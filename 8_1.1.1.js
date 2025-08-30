// ================= ФАЙЛ: tasks.js =================

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

            // Логика генерации, которую мы создали
            const x_vars = ['m', 'n', 'p', 'k'];
            const x = choice(x_vars);
            const y_vars = x_vars.filter(v => v !== x);
            const y = choice(y_vars);

            const p1_set = [2, 3, 5, 7];
            const p1 = choice(p1_set);
            const p2_options = p1_set.filter(n => n !== p1 && (n * p1) % 10 !== 0);
            const p2 = choice(p2_options);
            const k_nod = p1 * p2;
            
            // Упрощенная генерация k1, k2, k3 для надежности
            const k1 = choice([3, 4, 6, 7, 8, 9, -3, -4, -6, -7, -8, -9]);
            const k2 = choice([5, 11, 13, -5, -11, -13].filter(n => gcd(Math.abs(k1), Math.abs(n)) === 1));
            const k3 = choice([2, 17, 19, -2, -17, -19].filter(n => gcd(Math.abs(k1), Math.abs(n)) === 1 && gcd(Math.abs(k2), Math.abs(n)) === 1));

            const p_x_nod = randint(2, 4);
            const p_y_nod = choice([1, 2, 3, 4, 5].filter(n => n !== p_x_nod));
            const p_x_1 = randint(2, 4);
            const p_y_1 = randint(2, 4);
            const p_x_2 = randint(2, Math.min(4, 8 - p_x_1));
            const p_y_2 = randint(2, Math.min(4, 8 - p_y_1));
            const p_x_3 = randint(2, Math.min(4, 12 - p_x_1 - p_x_2));
            const p_y_3 = randint(2, Math.min(4, 12 - p_y_1 - p_y_2));

            const monomials = [
                { coeff: k_nod * k1, x_exp: p_x_nod + p_x_1, y_exp: p_y_nod + p_y_1 },
                { coeff: k_nod * k2, x_exp: p_x_nod + p_x_2, y_exp: p_y_nod + p_y_2 },
                { coeff: k_nod * k3, x_exp: p_x_nod + p_x_3, y_exp: p_y_nod + p_y_3 }
            ];
            
            monomials.forEach(m => m.total_degree = m.x_exp + m.y_exp);
            monomials.sort((a, b) => (b.total_degree - a.total_degree) || (b.x_exp - a.x_exp));

            // Функция для красивого вывода с <sup>
            const formatMonomialHTML = (coeff, x_var, x_exp, y_var, y_exp, isFirst) => {
                let sign = isFirst ? '' : (coeff < 0 ? ' - ' : ' + ');
                if (isFirst && coeff < 0) sign = '-';
                return `${sign}${Math.abs(coeff)}${x_var}<sup>${x_exp}</sup>${y_var}<sup>${y_exp}</sup>`;
            };

            const problemText = formatMonomialHTML(monomials[0].coeff, x, monomials[0].x_exp, y, monomials[0].y_exp, true) +
                                formatMonomialHTML(monomials[1].coeff, x, monomials[1].x_exp, y, monomials[1].y_exp, false) +
                                formatMonomialHTML(monomials[2].coeff, x, monomials[2].x_exp, y, monomials[2].y_exp, false);
            
            // Возвращаем текст задачи и переменные для расчета ответа
            return {
                problemText: problemText,
                variables: { k_nod, k1, k2, k3, x, y, p_x_nod, p_y_nod, p_x_1, p_y_1, p_x_2, p_y_2, p_x_3, p_y_3 }
            };
        },

        // --- РАСЧЁТ ПРАВИЛЬНОГО ОТВЕТА ---
        calculateAnswer: function(vars) {
            const { k_nod, k1, k2, k3, x, y, p_x_nod, p_y_nod, p_x_1, p_y_1, p_x_2, p_y_2, p_x_3, p_y_3 } = vars;

            const gcf_string = `${k_nod}${x}^${p_x_nod}${y}^${p_y_nod}`;

            let inner_poly = [
                { coeff: k1, x_exp: p_x_1, y_exp: p_y_1 },
                { coeff: k2, x_exp: p_x_2, y_exp: p_y_2 },
                { coeff: k3, x_exp: p_x_3, y_exp: p_y_3 }
            ];
            inner_poly.forEach(m => m.total_degree = m.x_exp + m.y_exp);
            inner_poly.sort((a, b) => (b.total_degree - a.total_degree) || (b.x_exp - a.x_exp));

            // Формируем строку для сравнения
            const formatMonomialString = (coeff, x_var, x_exp, y_var, y_exp) => {
                return `${coeff > 0 ? '+' : ''}${coeff}${x_var}^${x_exp}${y_var}^${y_exp}`;
            };
            
            let inner_string = formatMonomialString(inner_poly[0].coeff, x, inner_poly[0].x_exp, y, inner_poly[0].y_exp).replace(/^\+/, ''); // Убираем + в начале
            inner_string += formatMonomialString(inner_poly[1].coeff, x, inner_poly[1].x_exp, y, inner_poly[1].y_exp);
            inner_string += formatMonomialString(inner_poly[2].coeff, x, inner_poly[2].x_exp, y, inner_poly[2].y_exp);

            // Вариант 1 ответа
            const answer1 = `${gcf_string}(${inner_string})`.replace(/\s/g, '');

            // Вариант 2 ответа
            let inner_neg_string = formatMonomialString(-inner_poly[0].coeff, x, inner_poly[0].x_exp, y, inner_poly[0].y_exp).replace(/^\+/, '');
            inner_neg_string += formatMonomialString(-inner_poly[1].coeff, x, inner_poly[1].x_exp, y, inner_poly[1].y_exp);
            inner_neg_string += formatMonomialString(-inner_poly[2].coeff, x, inner_poly[2].x_exp, y, inner_poly[2].y_exp);
            const answer2 = `-${gcf_string}(${inner_neg_string})`.replace(/\s/g, '');
            
            return [answer1, answer2]; // Возвращаем массив из двух правильных строк
        }
    }
];

// Вспомогательная функция НОД, нужна для генерации
function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}
