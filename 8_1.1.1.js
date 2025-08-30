// Полный строгий парсер:  [±] K x^px y^py (  суммa из >=2 одночленов  )
function parseFactorizedAnswer(raw, xVar, yVar) {
  let s = (raw || '').replace(/\s+/g, '');

  // общий знак
  let sign = 1;
  if (s[0] === '+') s = s.slice(1);
  else if (s[0] === '-') { sign = -1; s = s.slice(1); }

  // K (обязателен)
  const mK = s.match(/^(\d+)/);
  if (!mK) return null;
  const K = parseInt(mK[1], 10);
  s = s.slice(mK[1].length);

  // x^px и y^py в любом порядке, экспоненты — целые >=1
  function takeVar(src, v) {
    const re = new RegExp('^' + v + '(?:\\^(\\d+))?');
    const m = src.match(re);
    if (!m) return null;
    return { exp: m[1] ? parseInt(m[1],10) : 1, rest: src.slice(m[0].length) };
  }

  let px, py;
  let t = takeVar(s, xVar);
  if (t) {
    px = t.exp; s = t.rest;
    t = takeVar(s, yVar);
    if (!t) return null;
    py = t.exp; s = t.rest;
  } else {
    t = takeVar(s, yVar);
    if (!t) return null;
    py = t.exp; s = t.rest;
    t = takeVar(s, xVar);
    if (!t) return null;
    px = t.exp; s = t.rest;
  }

  // обязательные скобки
  if (s[0] !== '(') return null;
  // найти соответствующую закрывающую
  let depth = 0, i = 0;
  for (; i < s.length; i++) {
    if (s[i] === '(') depth++;
    else if (s[i] === ')') { depth--; if (depth === 0) break; }
  }
  if (depth !== 0) return null;
  const inside = s.slice(1, i);
  const tail = s.slice(i+1);
  if (tail.length !== 0) return null; // строго вся строка разобрана

  // разбор внутренней суммы: ± mono ± mono ± mono ...
  const terms = [];
  // разделяем по знакам, сохраняя знаки
  const parts = inside.replace(/-/g, '+-').split('+').filter(Boolean);

  function parseMonomial(str) {
    let u = str;
    let sgn = 1;
    if (u[0] === '+') u = u.slice(1);
    else if (u[0] === '-') { sgn = -1; u = u.slice(1); }

    const mCoef = u.match(/^(\d+)/);
    const coef = mCoef ? parseInt(mCoef[1],10) : 1;
    u = mCoef ? u.slice(mCoef[1].length) : u;

    // ожидаем два блока переменных в любом порядке
    let a, b, t1 = takeVar(u, xVar);
    if (t1) {
      a = t1.exp; u = t1.rest;
      const t2 = takeVar(u, yVar);
      if (!t2) return null;
      b = t2.exp; u = t2.rest;
    } else {
      t1 = takeVar(u, yVar);
      if (!t1) return null;
      b = t1.exp; u = t1.rest;
      const t2 = takeVar(u, xVar);
      if (!t2) return null;
      a = t2.exp; u = t2.rest;
    }
    if (u.length !== 0) return null;
    return { coef: sgn*coef, x: a, y: b };
  }

  for (const part of parts) {
    const m = parseMonomial(part);
    if (!m) return null;
    terms.push(m);
  }
  if (terms.length < 2) return null; // внутри должна быть сумма

  return {
    outer: { coef: sign*K, x: px, y: py },
    inner: terms
  };
}

// Пример использования в обработчике ответа
function checkAnswer(raw, vars) {
  const { x, y } = vars;
  const parsed = parseFactorizedAnswer(raw, x, y);

  if (!parsed) {
    return { ok: false, reason: 'format', echo: raw }; // показать исходную строку и текст «Неверный формат»
  }
  // ... дальше твоя логика сравнения с calculateAnswer(...)
}
