// ================= ФАЙЛ: tasks.js (с новыми правилами для степеней) =================

// --- Настройки для тренажёра ---
const trainerSettings = {
    title: 'Разложение многочлена на множители',
    totalTime: 600, // 10 минут в секундах
    problemsToSelect: 1 // У нас пока один тип задач
};


// --- Массив со всеми типами заданий ---
const allTasks = [
    {
        type: 'polynomial_factorization',

        // --- ГЕНЕРАЦИЯ ЗАДАНИЯ ---
        generate: function() {
    // Вспомогательные функции
    const choice = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const randint = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    while (true) {
        try {
            const x_vars = ['m', 'n', 'p', 'k'];
            const x = choice(x_vars);
            const y_vars = x_vars.filter(v => v !== x);
            const y = choice(y_vars);

            // --- КОЭФФИЦИЕНТЫ ВНУТРИ СКОБОК (k1,k2) ---
            const k1 = choice([3, 4, 6, 7, 8, 9, -3, -4, -6, -7, -8, -9]);

            const k2_candidates = [5, 11, 13, -5, -11, -13].filter(
                n => gcd(Math.abs(k1), Math.abs(n)) === 1
            );
            if (k2_candidates.length === 0) continue;
            const k2 = choice(k2_candidates);

            // --- ВЫБОР k_nod (p1*p2 из {2,3,5,7}) С ОГРАНИЧЕНИЕМ <100 ---
            const p_set = [2, 3, 5, 7];
            const possible_nods = [];
            for (const p1 of p_set) {
                for (const p2 of p_set) {
                    if (p1 === p2) continue;
                    const nod = p1 * p2;
                    if (nod % 10 === 0) continue; // исключаем коэффициенты, оканчивающиеся на 0
                    if (Math.abs(nod * k1) < 100 && Math.abs(nod * k2) < 100) {
                        possible_nods.push(nod);
                    }
                }
            }
            if (possible_nods.length === 0) continue;
            const k_nod = choice(possible_nods);

            // --- ИЗМЕНЁННАЯ ЛОГИКА СТЕПЕНЕЙ ---
            const p_x_nod = randint(2, 6);
            const p_y_nod = choice([1, 2, 3, 4, 5, 6].filter(n => n !== p_x_nod));

            const p_x_1 = randint(2, 6);
            const p_y_1 = randint(2, 6);

            const p_x_2_range = Array.from({length: Math.min(6, 8 - p_x_1) - 1}, (_, i) => i + 2);
            const p_x_2_options = p_x_2_range.filter(n => Math.abs(n - p_x_1) >= 2);
            if (p_x_2_options.length === 0) continue;
            const p_x_2 = choice(p_x_2_options);

            const p_y_2_range = Array.from({length: Math.min(6, 8 - p_y_1) - 1}, (_, i) => i + 2);
            const p_y_2_options = p_y_2_range.filter(n => Math.abs(n - p_y_1) >= 2);
            if (p_y_2_options.length === 0) continue;
            const p_y_2 = choice(p_y_2_options);

            const p_x_3_range = Array.from({length: Math.min(6, 12 - p_x_1 - p_x_2) - 1}, (_, i) => i + 2);
            const p_x_3_options = p_x_3_range.filter(n => Math.abs(n - p_x_1) >= 2 && Math.abs(n - p_x_2) >= 1);
            if (p_x_3_options.length === 0) continue;
            const p_x_3 = choice(p_x_3_options);

            const p_y_3_range = Array.from({length: Math.min(6, 12 - p_y_1 - p_y_2) - 1}, (_, i) => i + 2);
            const p_y_3_options = p_y_3_range.filter(n => Math.abs(n - p_y_1) >= 2 && Math.abs(n - p_y_2) >= 3);
            if (p_y_3_options.length === 0) continue;
            const p_y_3 = choice(p_y_3_options);

            // --- ВЫБОР k3 С УЧЁТОМ ЛИМИТА <100 ДЛЯ k_nod*k3 ---
            let k3_range = [];
            for (let n = -19; n <= 19; n++) {
                if (Math.abs(n) < 2) continue;
                if (gcd(Math.abs(k1), Math.abs(n)) !== 1) continue;
                if (gcd(Math.abs(k2), Math.abs(n)) !== 1) continue;
                if (Math.abs(k_nod * n) >= 100) continue; // ключевое ограничение
                if ((k_nod * n) % 10 === 0) continue;     // избегаем коэффициента, оканчивающегося на 0
                k3_range.push(n);
            }
            let k3_options = (k1 > 0 && k2 > 0) ? k3_range.filter(n => n < 0) : k3_range;
            if (k3_options.length === 0) continue;
            const k3 = choice(k3_options);

            // --- ФИНАЛЬНАЯ СТРАХОВКА ---
            if (
                Math.abs(k_nod * k1) >= 100 ||
                Math.abs(k_nod * k2) >= 100 ||
                Math.abs(k_nod * k3) >= 100
            ) continue;

            // --- СБОРКА МОНОМОВ И ТЕКСТА ЗАДАЧИ ---
            const monomials = [
                { coeff: k_nod * k1, x_exp: p_x_nod + p_x_1, y_exp: p_y_nod + p_y_1 },
                { coeff: k_nod * k2, x_exp: p_x_nod + p_x_2, y_exp: p_y_nod + p_y_2 },
                { coeff: k_nod * k3, x_exp: p_x_nod + p_x_3, y_exp: p_y_nod + p_y_3 }
            ];

            monomials.forEach(m => m.total_degree = m.x_exp + m.y_exp);
            monomials.sort((a, b) => (b.total_degree - a.total_degree) || (b.x_exp - a.x_exp));

            const formatMonomialHTML = (coeff, x_var, x_exp, y_var, y_exp, isFirst) => {
                let sign = isFirst ? '' : (coeff < 0 ? ' - ' : ' + ');
                if (isFirst && coeff < 0) sign = '-';
                return `${sign}${Math.abs(coeff)}${x_var}<sup>${x_exp}</sup>${y_var}<sup>${y_exp}</sup>`;
            };

            const problemText =
                formatMonomialHTML(monomials[0].coeff, x, monomials[0].x_exp, y, monomials[0].y_exp, true) +
                formatMonomialHTML(monomials[1].coeff, x, monomials[1].x_exp, y, monomials[1].y_exp, false) +
                formatMonomialHTML(monomials[2].coeff, x, monomials[2].x_exp, y, monomials[2].y_exp, false);

            return {
                problemText: problemText,
                variables: {
                    k_nod, k1, k2, k3, x, y,
                    p_x_nod, p_y_nod,
                    p_x_1, p_y_1, p_x_2, p_y_2, p_x_3, p_y_3
                }
            };
        } catch (e) {
            continue;
        }
    }
},

        
        // --- РАСЧЁТ ПРАВИЛЬНОГО ОТВЕТА (остаётся без изменений) ---
        calculateAnswer: function(vars) {
            // ... (здесь код не меняется, так как ответ считается из тех же переменных)
            const { k_nod, k1, k2, k3, x, y, p_x_nod, p_y_nod, p_x_1, p_y_1, p_x_2, p_y_2, p_x_3, p_y_3 } = vars;

            const gcf_string = `${k_nod}${x}^${p_x_nod}${y}^${p_y_nod}`;

            let inner_poly = [
                { coeff: k1, x_exp: p_x_1, y_exp: p_y_1 },
                { coeff: k2, x_exp: p_x_2, y_exp: p_y_2 },
                { coeff: k3, x_exp: p_x_3, y_exp: p_y_3 }
            ];
            inner_poly.forEach(m => m.total_degree = m.x_exp + m.y_exp);
            inner_poly.sort((a, b) => (b.total_degree - a.total_degree) || (b.x_exp - a.x_exp));

            const formatMonomialString = (coeff, x_var, x_exp, y_var, y_exp) => {
                return `${coeff > 0 ? '+' : ''}${coeff}${x_var}^${x_exp}${y_var}^${y_exp}`;
            };
            
            let inner_string = formatMonomialString(inner_poly[0].coeff, x, inner_poly[0].x_exp, y, inner_poly[0].y_exp).replace(/^\+/, '');
            inner_string += formatMonomialString(inner_poly[1].coeff, x, inner_poly[1].x_exp, y, inner_poly[1].y_exp);
            inner_string += formatMonomialString(inner_poly[2].coeff, x, inner_poly[2].x_exp, y, inner_poly[2].y_exp);

            const answer1 = `${gcf_string}(${inner_string})`.replace(/\s/g, '');

            let inner_neg_string = formatMonomialString(-inner_poly[0].coeff, x, inner_poly[0].x_exp, y, inner_poly[0].y_exp).replace(/^\+/, '');
            inner_neg_string += formatMonomialString(-inner_poly[1].coeff, x, inner_poly[1].x_exp, y, inner_poly[1].y_exp);
            inner_neg_string += formatMonomialString(-inner_poly[2].coeff, x, inner_poly[2].x_exp, y, inner_poly[2].y_exp);
            const answer2 = `-${gcf_string}(${inner_neg_string})`.replace(/\s/g, '');
            
            return [answer1, answer2];
        }
    }
];

function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}
