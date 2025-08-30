// ================= ФАЙЛ: trainer.js =================

(() => {
  // ---- DOM helpers ----
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  // ---- Basic sanity checks for globals from 8_1.1.1.js ----
  function assertGlobals() {
    const missing = [];
    if (typeof trainerSettings === 'undefined') missing.push('trainerSettings');
    if (typeof allTasks === 'undefined')       missing.push('allTasks');
    if (typeof normalizeUserAnswer === 'undefined') missing.push('normalizeUserAnswer');
    if (typeof isAnswerCorrect === 'undefined')     missing.push('isAnswerCorrect');
    return missing;
  }

  // ---- State ----
  const state = {
    selected: [],          // [{ task, vars, el: {container, input, feedback} }]
    startedAt: null,
    timerId: null,
    totalSeconds: (typeof trainerSettings !== 'undefined' && trainerSettings.totalTime) || 600,
    finished: false,
  };

  // ---- Timer ----
  function fmtTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  function startTimer() {
    const $timer = $('#timer');
    const $bar = $('.progress-bar');
    const total = state.totalSeconds;
    let elapsed = 0;

    $timer.textContent = fmtTime(total - elapsed);
    $bar.style.width = '0%';

    state.timerId = setInterval(() => {
      if (state.finished) { clearInterval(state.timerId); return; }
      elapsed++;
      const left = Math.max(total - elapsed, 0);
      $timer.textContent = fmtTime(left);
      const pct = Math.min((elapsed / total) * 100, 100);
      $bar.style.width = `${pct}%`;

      if (left <= 0) {
        clearInterval(state.timerId);
        state.finished = true;
        autoCheckWhenTimeUp();
      }
    }, 1000);
  }

  function autoCheckWhenTimeUp() {
    // Автоматическая проверка при окончании времени
    // Имитация клика по «Проверить», если еще не нажимали
    try {
      const btn = $('#checkBtn');
      if (btn && !btn.disabled) btn.click();
    } catch (_){}
  }

  // ---- UI building ----
  function buildProblemCard(idx, html) {
    const wrap = document.createElement('div');
    wrap.className = 'problem-card';

    const title = document.createElement('div');
    title.className = 'problem-title';
    title.innerHTML = `Задание ${idx + 1}: <span class="problem-text">${html}</span>`;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'answer-input';
    input.placeholder = 'Введите факторизацию, напр.: 6k^5p^7(6k^4p^2+13k^2p^4+11)';
    input.autocomplete = 'off';
    input.spellcheck = false;

    const small = document.createElement('div');
    small.className = 'help-line';
    small.innerHTML = 'Разрешены формы: <code>G(…)</code> и <code>-G(-…)</code>, где <code>G</code> — наибольший общий множитель.';

    const feedback = document.createElement('div');
    feedback.className = 'feedback';

    wrap.appendChild(title);
    wrap.appendChild(input);
    wrap.appendChild(small);
    wrap.appendChild(feedback);

    return { wrap, input, feedback };
  }

  // ---- Rendering and generation ----
  function pickTasks() {
    const howMany = trainerSettings.problemsToSelect || 1;
    const picked = [];

    // сейчас у нас один тип — возьмём по generate()
    for (let i = 0; i < howMany; i++) {
      const task = allTasks[0];
      const { problemText, variables } = task.generate();
      picked.push({ task, vars: variables, problemText });
    }
    return picked;
  }

  function render() {
    // header
    $('#trainer-title').textContent = trainerSettings.title || 'Тренажёр';
    $('#trainer-subtitle').textContent = 'Разложите многочлен на множители методом вынесения общего множителя';

    // problems
    const $container = $('#problems-container');
    $container.innerHTML = '';

    state.selected = pickTasks().map((p, i) => {
      const { wrap, input, feedback } = buildProblemCard(i, p.problemText);
      $container.appendChild(wrap);
      return { ...p, el: { container: wrap, input, feedback } };
    });

    // buttons
    const $check = $('#checkBtn');
    $check.disabled = false;
    $check.onclick = onCheck;

    const $print = $('#printBtn');
    if ($print) {
      $print.onclick = () => window.print();
    }

    // timer
    startTimer();
  }

  // ---- Checking ----
  function showFeedback(el, type, message, extraHtml = '') {
    // type: 'ok' | 'format' | 'wrong' | 'error'
    el.className = `feedback ${type}`;
    el.innerHTML = message + (extraHtml ? `<div class="details">${extraHtml}</div>` : '');
  }

  function onCheck() {
    state.finished = true;
    if (state.timerId) clearInterval(state.timerId);
    $('#checkBtn').disabled = true;

    let correctCount = 0;

    state.selected.forEach(({ task, vars, el }, idx) => {
      const raw = el.input.value || '';
      // если пусто — сразу отметка
      if (!raw.trim()) {
        showFeedback(el.feedback, 'format', 'Пустой ответ. Введите факторизацию, пример: <code>6k^5p^7(6k^4p^2+13k^2p^4+11)</code>');
        return;
      }

      try {
        const res = isAnswerCorrect(raw, task, vars);
        if (res.error === 'format') {
          const examples = `Ожидается форма <code>G(…)</code> или <code>-G(-…)</code>, где <code>G=${vars.k_nod}${vars.x}^${vars.p_x_nod}${vars.y}^${vars.p_y_nod}</code>.`;
          showFeedback(el.feedback, 'format', 'Неверный формат ответа.', examples);
          return;
        }
        if (res.correct) {
          correctCount++;
          showFeedback(el.feedback, 'ok', 'Верно!');
        } else {
          // показать оба допустимых эталона
          const answers = task.calculateAnswer(vars);
          const pretty = answers.map(a => `<code>${a}</code>`).join('<br>');
          showFeedback(el.feedback, 'wrong', 'Неверно.', `Правильные варианты:<br>${pretty}`);
        }
      } catch (e) {
        console.error(e);
        showFeedback(el.feedback, 'error', 'Внутренняя ошибка при проверке. Посмотрите консоль браузера.');
      }
    });

    // Итог
    const $results = $('#results');
    const $score = $('#score-text');
    $results.classList.remove('hidden');
    $score.textContent = `Результат: ${correctCount} из ${state.selected.length}`;
  }

  // ---- Boot ----
  document.addEventListener('DOMContentLoaded', () => {
    const missing = assertGlobals();
    if (missing.length) {
      // Покажем аккуратно, чтобы было видно проблему и пользователю
      const $container = $('#problems-container');
      $container.innerHTML = `
        <div class="error-box">
          Не найдены необходимые скрипты: <b>${missing.join(', ')}</b>.<br>
          Проверьте подключение <code>8_1.1.1.js</code> перед <code>trainer.js</code>.
        </div>`;
      $('#checkBtn').disabled = true;
      return;
    }
    render();
  });

})();
