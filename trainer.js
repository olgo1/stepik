// ================= ФАЙЛ: trainer.js =================
// Минимальный тренажёр без лишних подсказок/placeholder’ов.
// Ожидает, что 8_1.1.1.js уже подключён и определил:
//    - trainerSettings
//    - allTasks
//    - normalizeUserAnswer
//    - isAnswerCorrect

(() => {
  // -------- helpers --------
  const $ = (sel) => document.querySelector(sel);

  function assertGlobals() {
    const missing = [];
    if (typeof trainerSettings === 'undefined') missing.push('trainerSettings');
    if (typeof allTasks === 'undefined') missing.push('allTasks');
    if (typeof normalizeUserAnswer === 'undefined') missing.push('normalizeUserAnswer');
    if (typeof isAnswerCorrect === 'undefined') missing.push('isAnswerCorrect');
    return missing;
  }

  // -------- state --------
  const state = {
    items: [],        // [{ task, vars, el:{wrap,input,feedback}, problemText }]
    totalSeconds: 600,
    timerId: null,
    finished: false,
  };

  // -------- timer --------
  function fmtTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  function startTimer() {
    const total = state.totalSeconds;
    const $timer = $('#timer');
    const $barInner = $('.progress-bar-inner');
    let tick = 0;

    $timer.textContent = fmtTime(total);
    if ($barInner) $barInner.style.width = '0%';

    state.timerId = setInterval(() => {
      if (state.finished) { clearInterval(state.timerId); return; }
      tick++;
      const left = Math.max(total - tick, 0);
      $timer.textContent = fmtTime(left);
      if ($barInner) $barInner.style.width = `${Math.min((tick / total) * 100, 100)}%`;
      if (left === 0) {
        clearInterval(state.timerId);
        state.finished = true;
        const btn = $('#checkBtn');
        if (btn && !btn.disabled) btn.click();
      }
    }, 1000);
  }

  // -------- UI --------
  function buildProblemCard(index, html) {
    const wrap = document.createElement('div');
    wrap.className = 'problem-card';

    const title = document.createElement('div');
    title.className = 'problem-title';
    // ИЗМЕНЕНИЕ 1: Убран текст "Задание..."
    title.innerHTML = `<span class="problem-text">${html}</span>`;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'answer-input';
    input.autocomplete = 'off';
    input.spellcheck = false;
    
    const feedback = document.createElement('div');
    feedback.className = 'feedback';

    wrap.appendChild(title);
    wrap.appendChild(input);
    wrap.appendChild(feedback);

    return { wrap, input, feedback };
  }

  function pickTasks() {
    const cnt = (trainerSettings && trainerSettings.problemsToSelect) || 1;
    const picked = [];
    for (let i = 0; i < cnt; i++) {
      const task = allTasks[0]; // у нас один тип
      const { problemText, variables } = task.generate();
      picked.push({ task, vars: variables, problemText });
    }
    return picked;
  }

  function render() {
    // заголовок
    $('#trainer-title').textContent = trainerSettings.title || 'Тренажёр';
    // без подзаголовка
    const st = $('#trainer-subtitle');
    if (st) st.textContent = '';

    // задачи
    const container = $('#problems-container');
    container.innerHTML = '';
    state.items = pickTasks().map((p, i) => {
      const el = buildProblemCard(i, p.problemText);
      container.appendChild(el.wrap);
      return { ...p, el };
    });

    // кнопки
    const btn = $('#checkBtn');
    btn.disabled = false;
    btn.onclick = onCheck;

    const printBtn = $('#printBtn');
    if (printBtn) {
      printBtn.onclick = () => window.print();
    }

    // таймер
    state.totalSeconds = trainerSettings.totalTime || 600;
    state.finished = false;
    if (state.timerId) clearInterval(state.timerId);
    startTimer();
  }

  // -------- check --------
  function showFeedback(node, type, text, detailsHtml = '') {
    node.className = `feedback ${type}`; // type: ok | wrong | format | error
    node.innerHTML = text + (detailsHtml ? `<div class="details">${detailsHtml}</div>` : '');
  }

  function onCheck() {
    state.finished = true;
    if (state.timerId) clearInterval(state.timerId);
    $('#checkBtn').disabled = true;

    let ok = 0;
    for (const item of state.items) {
      const { task, vars, el } = item;
      const raw = (el.input.value || '').trim();

      if (!raw) {
        showFeedback(el.feedback, 'format', 'Пустой ответ.');
        continue;
      }

      try {
        const res = isAnswerCorrect(raw, task, vars);
        if (res.error === 'format') {
          showFeedback(el.feedback, 'format', 'Неверный формат ответа.');
          continue;
        }
        if (res.correct) {
          ok++;
          showFeedback(el.feedback, 'ok', 'Верно!');
        } else {
          const answers = task.calculateAnswer(vars);
          // ИЗМЕНЕНИЕ 2: Форматирование степеней в правильных ответах
          const formattedAnswers = answers.map(a => a.replace(/\^(\d+)/g, '<sup>$1</sup>')); 
          const pretty = formattedAnswers.join('<br>');
          showFeedback(el.feedback, 'wrong', 'Неверно.', `Правильные варианты:<br>${pretty}`);
        }
      } catch (e) {
        console.error(e);
        showFeedback(el.feedback, 'error', 'Ошибка при проверке. Откройте консоль браузера.');
      }
    }

    const results = $('#results');
    const score = $('#score-text');
    if (results && score) {
      results.classList.remove('hidden');
      score.textContent = `Результат: ${ok} из ${state.items.length}`;
    }
  }

  // -------- boot --------
  document.addEventListener('DOMContentLoaded', () => {
    const missing = assertGlobals();
    if (missing.length) {
      const box = document.createElement('div');
      box.className = 'error-box';
      box.innerHTML = `Не найдены необходимые скрипты: <b>${missing.join(', ')}</b>.<br>
      Проверьте подключение <code>8_1.1.1.js</code> перед <code>trainer.js</code>.`;
      const container = $('#problems-container');
      if (container) container.appendChild(box);
      const btn = $('#checkBtn');
      if (btn) btn.disabled = true;
      return;
    }
    render();
  });
})();
