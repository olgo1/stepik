// ================= ФАЙЛ: 8_1.1.1.js =================

// ---------- ГЛОБАЛЬНЫЕ НАСТРОЙКИ ДЛЯ TRAINER ----------
const trainerSettings = {
  title: 'Разложение многочлена на множители',
  totalTime: 600,
  problemsToSelect: 1
};

// ---------- НАСТРОЙКИ ПРОВЕРКИ ----------
const CHECK_SETTINGS = {
  allowUnfactored: false,
  requireAtLeastTwoTerms: true
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

// --- Разрешаем одночлены, где переменная может отсутствовать
function _parseMonomial(str, xVar, yVar){
  let s = _strip(str);
  let sign = 1;
  if (s[0] === '+') s = s.slice(1);
  else if (s[0] === '-') { sign = -1; s = s.slice(1); }

  const mC = s.match(/^(\d+)/);
  let coef = 1;
  if (mC){ coef = parseInt(mC[1],10); s = s.slice(mC[1].length); }

  let xa = 0, yb = 0;
  for (let step = 0; step < 2; step++) {
    let t = _takeVar(s, xVar);
    if (t && xa === 0) { xa = t.exp; s = t.rest; continue; }
    t = _takeVar(s, yVar);
    if (t && yb === 0) { yb = t.exp; s = t.rest; continue; }
    break;
  }
  if (s.length !== 0) return null;
  return { coef: sign*coef, x: xa, y: yb };
}

function _parseFactorizedAnswer(raw, xVar, yVar){
  let s = _strip(raw);
  if (s[0]==='(') {
    let d=0, j=0;
    for (; j<s.length; j++){
      if (s[j]==='(') d++;
      else if (s[j]===')'){ d--; if(d===0) break; }
    }
    if (d===0 && s[j+1]==='(') s = s.slice(1, j) + s.slice(j+1);
  }
  let osign = 1;
  if (s[0] === '+') s = s.slice(1);
  else if (s[0] === '-') { osign = -1; s = s.slice(1); }

  const mK = s.match(/^(\d+)/);
  if (!mK) return null;
  const K = parseInt(mK[1],10);
  s = s.slice(mK[1].length);

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

  let depth=0, i=0;
  for (; i<s.length; i++){
    if (s[i]==='(') depth++;
    else if (s[i]===')'){ depth--; if(depth===0) break; }
  }
  if (depth!==0) return null;
  const inside = s.slice(1, i);
  const tail = s.slice(i+1);
  if (tail.length) return null;

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
  if (!normRes.ok) return { correct:false, error:'format' };
  return { correct: answers.includes(normRes.normalized), expected: answers, normalized: normRes.normalized };
}

// ---------- ОПИСАНИЕ ЗАДАНИЙ ----------
const allTasks = [
  {
    type: 'polynomial_factorization',

    generate: function () {
      while (true) {
        try {
          const x_vars = ['m','n','p','k'];
          const x = choice(x_vars);
          const y = choice(x_vars.filter(v=>v!==x));

          const k1 = choice([3,4,6,7,8,9,-3,-4,-6,-7,-8,-9]);
          const k2_candidates = [5,11,13,-5,-11,-13].filter(n=>gcd(Math.abs(k1),Math.abs(n))===1);
          if (!k2_candidates.length) continue;
          const k2 = choice(k2_candidates);

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

          // ======= ТВОИ УСЛОВИЯ ДЛЯ СТЕПЕНЕЙ =======
          const p_x_nod = choice([2,3,4,5,6]);
          const p_y_nod = choice([1,2,3,4,5,6].filter(n => n !== p_x_nod));

          const p_x_1 = choice([2,3,4,5,6]);
          const p_y_1 = choice([2,3,4,5,6]);

          const p_x_2_options = [2,3,4,5,6].filter(n =>
            n + p_x_1 <= 8 &&
            Math.abs(n - p_x_1) >= 2 &&
            gcd(n, p_x_1) === 1
          );
          if (!p_x_2_options.length) continue;
          const p_x_2 = choice(p_x_2_options);

          const p_y_2_options = [2,3,4,5,6].filter(n =>
            n + p_y_1 <= 8 &&
            Math.abs(n - p_y_1) >= 2 &&
            gcd(n, p_y_1) === 1
          );
          if (!p_y_2_options.length) continue;
          const p_y_2 = choice(p_y_2_options);

          const p_x_3_options = [2,3,4,5,6].filter(n =>
            n + p_x_1 + p_x_2 <= 12 &&
            Math.abs(n - p_x_1) >= 2 &&
            Math.abs(n - p_x_2) >= 1 &&
            gcd(n, p_x_1) === 1 &&
            gcd(n, p_x_2) === 1
          );
          if (!p_x_3_options.length) continue;
          const p_x_3 = choice(p_x_3_options);

          const p_y_3_options = [2,3,4,5,6].filter(n =>
            n + p_y_1 + p_y_2 <= 12 &&
            Math.abs(n - p_y_1) >= 2 &&
            Math.abs(n - p_y_2) >= 3 &&
            gcd(n, p_y_1) === 1 &&
            gcd(n, p_y_2) === 1
          );
          if (!p_y_3_options.length) continue;
          const p_y_3 = choice(p_y_3_options);
          // ===========================================

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

          if(Math.abs(k_nod*k1)>=100||Math.abs(k_nod*k2)>=100||Math.abs(k_nod*k3)>=100) continue;

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
