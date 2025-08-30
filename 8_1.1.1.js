// ================= ФАЙЛ: 8_1.1.1.js =================
//
// Генерирует выражение из 3 одночленов и проверяет факторизацию методом вынесения
// наибольшего общего множителя (G). Допустимы две формы ответа:
//   1)  G(…)
//   2) -G(-…)
// Парсер терпим к пробелам, порядку переменных (xy или yx) и отсутствию одной
// переменной в одночлене внутри скобок (тогда её степень считается 0).

// ---------- ГЛОБАЛЬНЫЕ НАСТРОЙКИ ДЛЯ TRAINER ----------
const trainerSettings = {
  title: 'Разложение многочлена на множители',
  totalTime: 600,
  problemsToSelect: 1
};

// ---------- НАСТРОЙКИ ПРОВЕРКИ ----------
const CHECK_SETTINGS = {
  allowUnfactored: false,        // если true — можно засчитать и «не вынесен»
  requireAtLeastTwoTerms: true   // внутри скобок минимум два одночлена
};

// ---------- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ----------
function gcd(a, b) { return b === 0 ? Math.abs(a) : gcd(b, a % b); }
const choice  = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randint = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function _strip(s){ return (s||'').replace(/\s+/g,''); }
function _takeVar(src, v){
  const re = new RegExp('^' + v + '(?:\\^(\\d+))?');
  const m = src.match(re);
  if(!m) return null;
  return { exp: m[1] ? parseInt(m[1],10) : 1, rest: src.slice(m[0].length) };
}

// --- Разрешаем одночлены вида: 3k^4n^2, -11k^3, +8n^2, а также чистые константы (+11)
function _parseMonomial(str, xVar, yVar){
  let s = _strip(str);
  let sign = 1;
  if (s[0] === '+') s = s.slice(1);
  else if (s[0] === '-') { sign = -1; s = s.slice(1); }

  // коэффициент (необязателен), по умолчанию 1
  const mC = s.match(/^(\d+)/);
  let coef = 1;
  if (mC){ coef = parseInt(mC[1],10); s = s.slice(mC[1].length); }

  // степени по умолчанию 0 (переменная может отсутствовать)
  let xa = 0, yb = 0;

  // забираем до двух блоков переменных в любом порядке
  for (let step = 0; step < 2; step++) {
    let t = _takeVar(s, xVar);
    if (t && xa === 0) { xa = t.exp; s = t.rest; continue; }
    t = _takeVar(s, yVar);
    if (t && yb === 0) { yb = t.exp; s = t.rest; continue; }
    break; // больше переменных нет
  }

  // хвост должен быть пустой
  if (s.length !== 0) return null;

  return { coef: sign*coef, x: xa, y: yb };
}

// --- Разбор факторизованной формы: [±]K x^px y^py ( ±mono ±mono ... )
function _parseFactorizedAnswer(raw, xVar, yVar){
  let s = _strip(raw);

  // необязательные внешние скобки вокруг G: (G)(...)
  if (s[0]==='(') {
    let d=0, j=0;
    for (; j<s.length; j++){
      if (s[j]==='(') d++;
      else if (s[j]===')'){ d--; if(d===0) break; }
    }
    if (d===0 && s[j+1]==='(') s = s.slice(1, j) + s.slice(j+1);
  }

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

  if (s[0] !== '(') return null;

  // найдём закрывающую скобку
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

// --- Канонизация факторизованной записи (для сравнения)
function _canonFactorized(parsed, xVar, yVar){
  const { outer, inner } = parsed;
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

// --- Развёртка исходного полинома (если allowUnfactored=true)
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

// --- Публичное API для trainer.js ---
function normalizeUserAnswer(raw, vars){
  const { x, y } = vars;
  const parsed = _parseFactorizedAnswer(raw, x, y);
  if (!parsed) return { ok:false, reason:'format', normalized:null };
  const norm = _canonFactorized(parsed, x, y).replace(/\s/g,'');
  return { ok:true, normalized:norm };
}

function isAnswerCorrect(userRaw, task, vars){
  const answers = task.calculateAnswer(vars).map(s=>s.replace(/\s/g,''));
  const normRes = normalizeUserAnswer(userRaw, vars);

  if (!normRes.ok){
    if (CHECK_SETTINGS.allowUnfactored){
      const monomials = [
        { coeff: vars.k_nod*vars.k1, x_exp: vars.p_x_nod + vars.p_x_1, y_exp: vars.p_y_nod + vars.p_y_1 },
        { coeff: vars.k_nod*vars.k2, x_exp: vars.p_x_nod + vars.p_x_2, y_exp: vars.p_y_nod + vars.p_y_2 },
        { coeff: vars.k_nod*vars.k3, x_exp: vars.p_x_nod + vars.p_x_3, y_exp: vars.p_y_nod + vars.p_y_3 },
      ];
      const expandedCanon = _canonExpanded(monomials, vars.x, vars.y).replace(/\s/g,'');
      if (_strip(userRaw) === expandedCanon) return { correct:true, variant:'unfactored' };
    }
    return { correct:false, error:'format' };
  }

  const normalized = normRes.normalized;
  return { correct: answers.includes(normalized), expected: answers, normalized };
}

// ---------- ОПИСАНИЕ ЗАДАНИЙ ----------
const allTasks = [
  {
    type: 'polynomial_factorization',

    // --- ГЕНЕРАЦИЯ ---
    generate: function () {
      while (true) {
        try {
          const x_vars = ['m','n','p','k'];
          const x = choice(x_vars);
          const y = choice(x_vars.filter(v=>v!==x));

          // коэффициенты внутри скобок
          const k1 = choice([3,4,6,7,8,9,-3,-4,-6,-7,-8,-9]);
          const k2_candidates = [5,11,13,-5,-11,-13].filter(n=>gcd(Math.abs(k1),Math.abs(n))===1);
          if (!k2_candidates.length) continue;
          const k2 = choice(k2_candidates);

          // k_nod = p1*p2 из {2,3,5,7}, без хвоста 0, и |k_nod*k1|,|k_nod*k2|<100
          const p_set=[2,3,5,7];
          const possible_nods=[];
          for (const p1 of p_set){
            for (const p2 of p_set){
              if(p1===p2) continue;
              const nod=p1*p2;
              if(nod%10===0) continue;
              if(Math.abs(nod*k1)<100 && Math.abs(nod*k2)<100) possible_nods.push(nod);
            }
          }
          if(!possible_nods.length) continue;
          const k_nod=choice(possible_nods);

          // Степени (логика из твоего варианта)
          const p_x_nod=randint(2,6);
          const p_y_nod=choice([1,2,3,4,5,6].filter(n=>n!==p_x_nod));

          const p_x_1=randint(2,6), p_y_1=randint(2,6);

          const p_x_2_range=Array.from({length:Math.min(6,8-p_x_1)-1},(_,i)=>i+2);
          const p_x_2_options=p_x_2_range.filter(n=>Math.abs(n-p_x_1)>=2);
          if(!p_x_2_options.length) continue;
          const p_x_2=choice(p_x_2_options);

          const p_y_2_range=Array.from({length:Math.min(6,8-p_y_1)-1},(_,i)=>i+2);
          const p_y_2_options=p_y_2_range.filter(n=>Math.abs(n-p_y_1)>=2);
          if(!p_y_2_options.length) continue;
          const p_y_2=choice(p_y_2_options);

          const p_x_3_range=Array.from({length:Math.min(6,12-p_x_1-p_x_2)-1},(_,i)=>i+2);
          const p_x_3_options=p_x_3_range.filter(n=>Math.abs(n-p_x_1)>=2&&Math.abs(n-p_x_2)>=1);
          if(!p_x_3_options.length) continue;
          const p_x_3=choice(p_x_3_options);

          const p_y_3_range=Array.from({length:Math.min(6,12-p_y_1-p_y_2)-1},(_,i)=>i+2);
          const p_y_3_options=p_y_3_range.filter(n=>Math.abs(n-p_y_1)>=2&&Math.abs(n-p_y_2)>=3);
          if(!p_y_3_options.length) continue;
          const p_y_3=choice(p_y_3_options);

          // выбор k3: взаимно прост с k1,k2; |k_nod*k3|<100; не оканчивается на 0
          let k3_range=[];
          for(let n=-19;n<=19;n++){
            if(Math.abs(n)<2) continue;
            if(gcd(Math.abs(k1),Math.abs(n))!==1) continue;
            if(gcd(Math.abs(k2),Math.abs(n))!==1) continue;
            if(Math.abs(k_nod*n)>=100) continue;
            if((k_nod*n)%10===0) continue;
            k3_range.push(n);
          }
          let k3_options=(k1>0&&k2>0)?k3_range.filter(n=>n<0):k3_range;
          if(!k3_options.length) continue;
          const k3=choice(k3_options);

          // финальная страховка
          if(Math.abs(k_nod*k1)>=100||Math.abs(k_nod*k2)>=100||Math.abs(k_nod*k3)>=100) continue;

          // сборка и HTML
          const monomials=[
            {coeff:k_nod*k1,x_exp:p_x_nod+p_x_1,y_exp:p_y_nod+p_y_1},
            {coeff:k_nod*k2,x_exp:p_x_nod+p_x_2,y_exp:p_y_nod+p_y_2},
            {coeff:k_nod*k3,x_exp:p_x_nod+p_x_3,y_exp:p_y_nod+p_y_3}
          ];
          monomials.forEach(m=>m.total_degree=m.x_exp+m.y_exp);
          monomials.sort((a,b)=>(b.total_degree-a.total_degree)||(b.x_exp-a.x_exp));

          const fmt=(c,xv,xe,yv,ye,first)=>{
            let sign=first?'':(c<0?' - ':' + ');
            if(first&&c<0) sign='-';
            return `${sign}${Math.abs(c)}${xv}<sup>${xe}</sup>${yv}<sup>${ye}</sup>`;
          };

          const problemText=
            fmt(monomials[0].coeff,x,monomials[0].x_exp,y,monomials[0].y_exp,true)+
            fmt(monomials[1].coeff,x,monomials[1].x_exp,y,monomials[1].y_exp,false)+
            fmt(monomials[2].coeff,x,monomials[2].x_exp,y,monomials[2].y_exp,false);

          return { problemText, variables:{k_nod,k1,k2,k3,x,y,p_x_nod,p_y_nod,p_x_1,p_y_1,p_x_2,p_y_2,p_x_3,p_y_3}};
        } catch(_){ continue; }
      }
    },

    // --- ПРАВИЛЬНЫЕ ОТВЕТЫ (две формы) ---
    calculateAnswer: function(vars){
      const {k_nod,k1,k2,k3,x,y,p_x_nod,p_y_nod,p_x_1,p_y_1,p_x_2,p_y_2,p_x_3,p_y_3}=vars;
      const gcf_string=`${k_nod}${x}^${p_x_nod}${y}^${p_y_nod}`;

      let inner=[
        {coeff:k1,x_exp:p_x_1,y_exp:p_y_1},
        {coeff:k2,x_exp:p_x_2,y_exp:p_y_2},
        {coeff:k3,x_exp:p_x_3,y_exp:p_y_3}
      ];
      inner.forEach(m=>m.total_degree=m.x_exp+m.y_exp);
      inner.sort((a,b)=>(b.total_degree-a.total_degree)||(b.x_exp-a.x_exp));

      const fmt=(c,xv,xe,yv,ye)=>`${c>0?'+':''}${c}${xv}^${xe}${yv}^${ye}`;
      let inner_str=fmt(inner[0].coeff,x,inner[0].x_exp,y,inner[0].y_exp).replace(/^\+/, '');
      inner_str+=fmt(inner[1].coeff,x,inner[1].x_exp,y,inner[1].y_exp);
      inner_str+=fmt(inner[2].coeff,x,inner[2].x_exp,y,inner[2].y_exp);
      const ans1=`${gcf_string}(${inner_str})`.replace(/\s/g,'');

      let inner_neg=fmt(-inner[0].coeff,x,inner[0].x_exp,y,inner[0].y_exp).replace(/^\+/, '');
      inner_neg+=fmt(-inner[1].coeff,x,inner[1].x_exp,y,inner[1].y_exp);
      inner_neg+=fmt(-inner[2].coeff,x,inner[2].x_exp,y,inner[2].y_exp);
      const ans2=`-${gcf_string}(${inner_neg})`.replace(/\s/g,'');

      return [ans1,ans2];
    }
  }
];

// (для локальных тестов можно экспортировать)
// if (typeof module !== 'undefined') { module.exports = { trainerSettings, allTasks, normalizeUserAnswer, isAnswerCorrect }; }
