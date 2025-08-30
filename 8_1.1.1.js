// ================= ФАЙЛ: 8_1.1.1.js (ПОЛНАЯ ФИНАЛЬНАЯ ВЕРСИЯ) =================

// ---------- ГЛОБАЛЬНЫЕ НАСТРОЙКИ ДЛЯ TRAINER ----------
const trainerSettings = {
  title: "Разложение многочлена на множители",
  totalTime: 600,
  problemsToSelect: 1,
};

// ---------- НАСТРОЙКИ ПРОВЕРКИ ----------
const CHECK_SETTINGS = {
  allowUnfactored: false,
  requireAtLeastTwoTerms: true,
};

// ---------- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ----------
function gcd(a, b) {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}
const choice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randint = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function _strip(s) {
  return (s || "").replace(/\s+/g, "");
}
function _takeVar(src, v) {
  const re = new RegExp("^" + v + "(?:\\^(\\d+))?");
  const m = src.match(re);
  if (!m) return null;
  return { exp: m[1] ? parseInt(m[1], 10) : 1, rest: src.slice(m[0].length) };
}

function _parseMonomial(str, xVar, yVar) {
  let s = _strip(str);
  let sign = 1;
  if (s[0] === "+") s = s.slice(1);
  else if (s[0] === "-") {
    sign = -1;
    s = s.slice(1);
  }

  const mC = s.match(/^(\d+)/);
  let coef = 1;
  if (mC) {
    coef = parseInt(mC[1], 10);
    s = s.slice(mC[1].length);
  }

  let xa = 0, yb = 0;
  for (let step = 0; step < 2; step++) {
    let t = _takeVar(s, xVar);
    if (t && xa === 0) {
      xa = t.exp;
      s = t.rest;
      continue;
    }
    t = _takeVar(s, yVar);
    if (t && yb === 0) {
      yb = t.exp;
      s = t.rest;
      continue;
    }
    break;
  }
  if (s.length !== 0) return null;
  return { coef: sign * coef, x: xa, y: yb };
}

function _parseFactorizedAnswer(raw, xVar, yVar) {
    let s = _strip(raw);
    if (s.startsWith('(')) {
        let depth = 0, j = 0;
        for (; j < s.length; j++) {
            if (s[j] === '(') depth++;
            else if (s[j] === ')') {
                depth--;
                if (depth === 0) break;
            }
        }
        if (depth === 0 && j < s.length - 1 && s[j + 1] === '(') {
            s = s.slice(1, j) + '*' + s.slice(j + 1);
        }
    }
    
    let outerSign = 1;
    if (s.startsWith('-')) {
        outerSign = -1;
        s = s.slice(1);
    } else if (s.startsWith('+')) {
        s = s.slice(1);
    }
    
    const parts = s.split('(');
    if (parts.length !== 2 || !parts[1].endsWith(')')) return null;

    const outerPartRaw = parts[0];
    const innerPartRaw = parts[1].slice(0, -1);
    
    const outerParsed = _parseMonomial(outerPartRaw, xVar, yVar);
    if (!outerParsed) return null;
    outerParsed.coef *= outerSign;
    
    const innerTermStrings = innerPartRaw.replace(/-/g, "+-").split('+').filter(Boolean);
    if (CHECK_SETTINGS.requireAtLeastTwoTerms && innerTermStrings.length < 2) return null;
    
    const innerTerms = [];
    for (const termStr of innerTermStrings) {
        const parsedTerm = _parseMonomial(termStr, xVar, yVar);
        if (!parsedTerm) return null;
        innerTerms.push(parsedTerm);
    }
    
    return { outer: outerParsed, inner: innerTerms };
}


function _canonFactorized(parsed, xVar, yVar) {
  const { outer, inner } = parsed;
  const sorted = [...inner].sort((a, b) => {
    const da = a.x + a.y, db = b.x + b.y;
    if (db !== da) return db - da;
    return b.x - a.x;
  });
  
  const formatMonomial = (c, xExp, yExp, isFirst) => {
    let str = "";
    if (!isFirst) {
        str += c > 0 ? '+' : '';
    }
    
    if (Math.abs(c) !== 1 || (xExp === 0 && yExp === 0)) {
      str += c;
    } else if (c === -1) {
      str += '-';
    }
    
    if (xExp > 0) str += xVar + (xExp > 1 ? `^${xExp}` : '');
    if (yExp > 0) str += yVar + (yExp > 1 ? `^${yExp}` : '');
    return str;
  };
  
  let innerStr = formatMonomial(sorted[0].coef, sorted[0].x, sorted[0].y, true);
  for (let i = 1; i < sorted.length; i++) {
    const t = sorted[i];
    innerStr += formatMonomial(t.coef, t.x, t.y, false);
  }
  
  const sign = outer.coef < 0 ? '-' : '';
  const gcfCoeff = Math.abs(outer.coef) === 1 ? '' : Math.abs(outer.coef);
  const gcfX = outer.x > 0 ? `${xVar}${outer.x > 1 ? `^${outer.x}`:''}` : '';
  const gcfY = outer.y > 0 ? `${yVar}${outer.y > 1 ? `^${outer.y}`:''}` : '';

  const g = `${gcfCoeff}${gcfX}${gcfY}`;
  return `${sign}${g}(${innerStr})`;
}


function normalizeUserAnswer(raw, vars) {
  const { x, y } = vars;
  const parsed = _parseFactorizedAnswer(raw, x, y);
  if (!parsed) return { ok: false, reason: "format", normalized: null };
  const norm = _canonFactorized(parsed, x, y).replace(/\s/g, "");
  return { ok: true, normalized: norm };
}

function isAnswerCorrect(userRaw, task, vars) {
  const answers = task.calculateAnswer(vars).map((s) => s.replace(/\s/g, ""));
  const normRes = normalizeUserAnswer(userRaw, vars);
  if (!normRes.ok) return { correct: false, error: "format" };
  return {
    correct: answers.includes(normRes.normalized),
    expected: answers,
    normalized: normRes.normalized,
  };
}

// ---------- ОПИСАНИЕ ЗАДАНИЙ ----------
const allTasks = [
  {
    type: "polynomial_factorization",

    generate: function () {
      let attempts = 0;
      while (true) {
        attempts++;
        if (attempts > 500) {
            console.error("Не удалось сгенерировать задание после 500 попыток. Проверьте условия.");
            return {
                problemText: "14m<sup>5</sup>n<sup>3</sup> + 35m<sup>4</sup>n<sup>4</sup> - 21m<sup>3</sup>n<sup>5</sup>",
                variables: { k_nod: 7, k1: 2, k2: 5, k3: -3, x: 'm', y: 'n', p_x_nod: 3, p_y_nod: 3, p_x_1: 2, p_y_1: 0, p_x_2: 1, p_y_2: 1, p_x_3: 0, p_y_3: 2 }
            };
        }
        
        try {
          const x_vars = ["m", "n", "p", "k"];
          const x = choice(x_vars);
          const y = choice(x_vars.filter((v) => v !== x));

          const k1 = choice([3, 4, 6, 7, 8, 9, -3, -4, -6, -7, -8, -9]);
          const k2_candidates = [5, 11, 13, -5, -11, -13].filter(
            (n) => gcd(Math.abs(k1), Math.abs(n)) === 1
          );
          if (!k2_candidates.length) continue;
          const k2 = choice(k2_candidates);

          const p_set = [2, 3, 5, 7];
          const possible_nods = [];
          for (const p1 of p_set) {
            for (const p2 of p_set) {
              if (p1 === p2) continue;
              const nod = p1 * p2;
              if (nod % 10 === 0) continue;
              if (Math.abs(nod * k1) < 100 && Math.abs(nod * k2) < 100)
                possible_nods.push(nod);
            }
          }
          if (!possible_nods.length) continue;
          const k_nod = choice(possible_nods);

          const p_x_nod = choice([2, 3, 4, 5]);
          const p_y_nod = choice([1, 2, 3, 4].filter((n) => n !== p_x_nod));

          const p_x_1 = choice([1, 2, 3, 4]);
          const p_y_1 = choice([1, 2, 3, 4]);

          const p_x_2_options = [1, 2, 3, 4].filter((n) => n + p_x_1 <= 7 && Math.abs(n - p_x_1) >= 1 && n !== p_x_1);
          if (!p_x_2_options.length) continue;
          const p_x_2 = choice(p_x_2_options);

          const p_y_2_options = [1, 2, 3, 4].filter((n) => n + p_y_1 <= 7 && Math.abs(n - p_y_1) >= 1 && n !== p_y_1);
          if (!p_y_2_options.length) continue;
          const p_y_2 = choice(p_y_2_options);
          
          const p_x_3_options = [1, 2, 3, 4].filter((n) => n + p_x_1 + p_x_2 <= 10 && n !== p_x_1 && n !== p_x_2);
          if (!p_x_3_options.length) continue;
          const p_x_3 = choice(p_x_3_options);

          const p_y_3_options = [1, 2, 3, 4].filter((n) => n + p_y_1 + p_y_2 <= 10 && n !== p_y_1 && n !== p_y_2);
          if (!p_y_3_options.length) continue;
          const p_y_3 = choice(p_y_3_options);

          let k3_range = [];
          for (let n = -19; n <= 19; n++) {
            if (Math.abs(n) < 2) continue;
            if (gcd(Math.abs(k1), Math.abs(n)) !== 1) continue;
            if (gcd(Math.abs(k2), Math.abs(n)) !== 1) continue;
            if (Math.abs(k_nod * n) >= 100) continue;
            if ((k_nod * n) % 10 === 0) continue;
            k3_range.push(n);
          }
          let k3_options = k1 > 0 && k2 > 0 ? k3_range.filter((n) => n < 0) : k3_range;
          if (!k3_options.length) continue;
          const k3 = choice(k3_options);

          if (Math.abs(k_nod * k1) >= 100 || Math.abs(k_nod * k2) >= 100 || Math.abs(k_nod * k3) >= 100) continue;

          const monomials = [
            { coeff: k_nod * k1, x_exp: p_x_nod + p_x_1, y_exp: p_y_nod + p_y_1 },
            { coeff: k_nod * k2, x_exp: p_x_nod + p_x_2, y_exp: p_y_nod + p_y_2 },
            { coeff: k_nod * k3, x_exp: p_x_nod + p_x_3, y_exp: p_y_nod + p_y_3 },
          ];
          monomials.forEach((m) => (m.total_degree = m.x_exp + m.y_exp));
          monomials.sort((a, b) => (b.total_degree - a.total_degree) || (b.x_exp - a.x_exp));

          const fmt = (c, xv, xe, yv, ye, first) => {
            let sign = first ? "" : c < 0 ? " - " : " + ";
            if (first && c < 0) sign = "-";
            return `${sign}${Math.abs(c)}${xv}<sup>${xe}</sup>${yv}<sup>${ye}</sup>`;
          };

          const problemText =
            fmt(monomials[0].coeff, x, monomials[0].x_exp, y, monomials[0].y_exp, true) +
            fmt(monomials[1].coeff, x, monomials[1].x_exp, y, monomials[1].y_exp, false) +
            fmt(monomials[2].coeff, x, monomials[2].x_exp, y, monomials[2].y_exp, false);

          return {
            problemText,
            variables: { k_nod, k1, k2, k3, x, y, p_x_nod, p_y_nod, p_x_1, p_y_1, p_x_2, p_y_2, p_x_3, p_y_3 },
          };
        } catch (_) {
          continue;
        }
      }
    },

    calculateAnswer: function (vars) {
        const { k_nod, k1, k2, k3, x, y, p_x_nod, p_y_nod, p_x_1, p_y_1, p_x_2, p_y_2, p_x_3, p_y_3 } = vars;

        const min_px = Math.min(p_x_1, p_x_2, p_x_3);
        const min_py = Math.min(p_y_1, p_y_2, p_y_3);

        const gcf_x_exp = p_x_nod + min_px;
        const gcf_y_exp = p_y_nod + min_py;
        
        const gcf_string = `${k_nod}${x}^${gcf_x_exp}${y}^${gcf_y_exp}`;

        let inner = [
          { coeff: k1, x_exp: p_x_1 - min_px, y_exp: p_y_1 - min_py },
          { coeff: k2, x_exp: p_x_2 - min_px, y_exp: p_y_2 - min_py },
          { coeff: k3, x_exp: p_x_3 - min_px, y_exp: p_y_3 - min_py },
        ];
        
        inner.forEach(m => m.total_degree = m.x_exp + m.y_exp);
        inner.sort((a, b) => (b.total_degree - a.total_degree) || (b.x_exp - a.x_exp));

        const formatMonomialInParentheses = (c, xv, xe, yv, ye) => {
            const sign = c > 0 ? '+' : '';
            const coeffPart = (Math.abs(c) === 1 && (xe > 0 || ye > 0)) ? (c === -1 ? '-' : (sign === '+' ? '+' : '')) : `${sign}${c}`;
            const x_part = xe > 0 ? (xe > 1 ? `${xv}^${xe}` : xv) : '';
            const y_part = ye > 0 ? (ye > 1 ? `${yv}^${ye}` : yv) : '';
            return `${coeffPart}${x_part}${y_part}`;
        };
        
        let inner_str = formatMonomialInParentheses(inner[0].coeff, x, inner[0].x_exp, y, inner[0].y_exp).replace(/^\+/, '');
        inner_str += formatMonomialInParentheses(inner[1].coeff, x, inner[1].x_exp, y, inner[1].y_exp);
        inner_str += formatMonomialInParentheses(inner[2].coeff, x, inner[2].x_exp, y, inner[2].y_exp);
        const ans1 = `${gcf_string}(${inner_str})`.replace(/\s/g, '');

        let inner_neg_str = formatMonomialInParentheses(-inner[0].coeff, x, inner[0].x_exp, y, inner[0].y_exp).replace(/^\+/, '');
        inner_neg_str += formatMonomialInParentheses(-inner[1].coeff, x, inner[1].x_exp, y, inner[1].y_exp);
        inner_neg_str += formatMonomialInParentheses(-inner[2].coeff, x, inner[2].x_exp, y, inner[2].y_exp);
        const ans2 = `-${gcf_string}(${inner_neg_str})`.replace(/\s/g, '');

        return [ans1, ans2];
      },
  },
];
