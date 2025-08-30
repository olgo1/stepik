// ====== НАСТРОЙКИ ПРОВЕРКИ ======
const CHECK_SETTINGS = {
  allowUnfactored: false,     // true — засчитывать и «не вынесен» (просто исходный полином)
  requireAtLeastTwoTerms: true // внутри скобок должна быть сумма минимум из двух одночленов
};

// ====== УТИЛИТЫ ДЛЯ ПАРСИНГА/НОРМАЛИЗАЦИИ ======
function _strip(s){ return (s||'').replace(/\s+/g,''); }
function _takeVar(src, v){
  const re = new RegExp('^' + v + '(?:\\^(\\d+))?');
  const m = src.match(re);
  if(!m) return null;
  return { exp: m[1] ? parseInt(m[1],10) : 1, rest: src.slice(m[0].length) };
}

// одночлен вида  [±][coef?] x^a y^b  (порядок xy / yx допускается)
function _parseMonomial(str, xVar, yVar){
  let s = _strip(str);
  let sign = 1;
  if (s[0] === '+') s = s.slice(1);
  else if (s[0] === '-') { sign = -1; s = s.slice(1); }

  const mC = s.match(/^(\d+)/);
  let coef = 1;
  if (mC){ coef = parseInt(mC[1],10); s = s.slice(mC[1].length); }

  let xa, yb, t = _takeVar(s, xVar);
  if (t){
    xa = t.exp; s = t.rest;
    t = _takeVar(s, yVar);
    if (!t) return null;
    yb = t.exp; s = t.rest;
  } else {
    t = _takeVar(s, yVar);
    if (!t) return null;
    yb = t.exp; s = t.rest;
    t = _takeVar(s, xVar);
    if (!t) return null;
    xa = t.exp; s = t.rest;
  }
  if (s.length) return null;
  return { coef: sign*coef, x: xa, y: yb };
}

// разбор факторизованной формы: [±]K x^px y^py ( ±mono ±mono ... )
function _parseFactorizedAnswer(raw, xVar, yVar){
  let s = _strip(raw);

  // внешний знак
  let osign = 1;
  if (s[0] === '+') s = s.slice(1);
  else if (s[0] === '-') { osign = -1; s = s.slice(1); }

  // числовой коэффициент K (обязателен)
  const mK = s.match(/^(\d+)/);
  if (!mK) return null;
  const K = parseInt(mK[1],10);
  s = s.slice(mK[1].length);

  // блоки x^px и y^py в любом порядке
  let px, py, t = _takeVar(s, xVar);
  if (t){
    px = t.exp; s = t.rest;
    t = _takeVar(s, yVar); if(!t) return null;
    py = t.exp; s = t.rest;
  } else {
    t = _takeVar(s, yVar); if(!t) return null;
    py = t.exp; s = t.rest;
    t = _takeVar(s, xVar); if(!t) return null;
    px = t.exp; s = t.rest;
  }

  // обязательные скобки
  if (s[0] !== '(') return null;
  // находим закрывающую
  let depth=0, i=0;
  for (; i<s.length; i++){
    if (s[i]==='(') depth++;
    else if (s[i]===')'){ depth--; if(depth===0) break; }
  }
  if (depth!==0) return null;
  const inside = s.slice(1, i);
  const tail = s.slice(i+1);
  if (tail.length) return null;

  // разбираем внутреннюю сумму по знакам
  const parts = inside.replace(/-/g,'+-').split('+').filter(Boolean);
  if (CHECK_SETTINGS.requireAtLeastTwoTerms && parts.length < 2) return null;

  const terms = [];
  for (const part of parts){
    const m = _parseMonomial(part, xVar, yVar);
    if (!m) return null;
    terms.push(m);
  }

  return { outer: {coef: osign*K, x:px, y:py}, inner: terms };
}

// канонический вывод для сравнения с эталоном
function _canonFactorized(parsed, xVar, yVar){
  const { outer, inner } = parsed;

  // сортировка слагаемых как в calculateAnswer (по суммарной степени, затем по степени x)
  const sorted = [...inner].sort((a,b)=>{
    const da = a.x + a.y, db = b.x + b.y;
    if (db !== da) return db - da;
    return b.x - a.x;
  });

  const fmtMono = (c, a, b) => `${c>0?'+':''}${c}${xVar}^${a}${yVar}^${b}`;
  let innerStr = fmtMono(sorted[0].coef, sorted[0].x, sorted[0].y).replace(/^\+/, '');
  for (let i=1;i<sorted.length;i++){
    const t = sorted[i];
    innerStr += fmtMono(t.coef, t.x, t.y);
  }

  const g = `${Math.abs(outer.coef)}${xVar}^${outer.x}${yVar}^${outer.y}`;
  const sign = outer.coef < 0 ? '-' : '';
  return `${sign}${g}(${innerStr})`;
}

// развёртка исходного полинома в канонической форме (если вдруг allowUnfactored=true)
function _canonExpanded(monos, xVar, yVar){
  const sorted = [...monos].sort((a,b)=>{
    const da = a.x_exp + a.y_exp, db = b.x_exp + b.y_exp;
    if (db !== da) return db - da;
    return b.x_exp - a.x_exp;
  });
  const fmt = (c, a, b) => `${c>0?'+':''}${c}${xVar}^${a}${yVar}^${b}`;
  let s = fmt(sorted[0].coeff, sorted[0].x_exp, sorted[0].y_exp).replace(/^\+/, '');
  for (let i=1;i<sorted.length;i++){
    const t = sorted[i]; s += fmt(t.coeff, t.x_exp, t.y_exp);
  }
  return s;
}

// ====== ПУБЛИЧНЫЕ ФУНКЦИИ ДЛЯ TRAINER ======
function normalizeUserAnswer(raw, vars){
  const { x, y } = vars;
  const parsed = _parseFactorizedAnswer(raw, x, y);
  if (!parsed) return { ok:false, reason:'format', normalized:null };

  // нормализуем до канонической строки
  const norm = _canonFactorized(parsed, x, y).replace(/\s/g,'');
  return { ok:true, reason:null, normalized:norm };
}

function isAnswerCorrect(userRaw, task, vars){
  const answers = task.calculateAnswer(vars).map(s=>s.replace(/\s/g,''));
  const normRes = normalizeUserAnswer(userRaw, vars);

  // если формат неверный — (опционально) проверим, хочет ли учитель разрешать «не вынесен»
  if (!normRes.ok){
    if (CHECK_SETTINGS.allowUnfactored){
      // соберём исходные одночлены и сравним с канонической развёрткой
      const monomials = [
        { coeff: vars.k_nod*vars.k1, x_exp: vars.p_x_nod + vars.p_x_1, y_exp: vars.p_y_nod + vars.p_y_1 },
        { coeff: vars.k_nod*vars.k2, x_exp: vars.p_x_nod + vars.p_x_2, y_exp: vars.p_y_nod + vars.p_y_2 },
        { coeff: vars.k_nod*vars.k3, x_exp: vars.p_x_nod + vars.p_x_3, y_exp: vars.p_y_nod + vars.p_y_3 },
      ];
      const expandedCanon = _canonExpanded(monomials, vars.x, vars.y).replace(/\s/g,'');
      // если ученик ввёл ровно исходный полином в таком же каноне — принять
      if (_strip(userRaw) === expandedCanon) {
        return { correct:true, variant:'unfactored' };
      }
    }
    return { correct:false, error:'format' };
  }

  const normalized = normRes.normalized;
  const correct = answers.includes(normalized);
  return { correct, expected: answers, normalized };
}

// Экспорт при необходимости
if (typeof module !== 'undefined') {
  module.exports.normalizeUserAnswer = normalizeUserAnswer;
  module.exports.isAnswerCorrect = isAnswerCorrect;
}
