// --- НАСТРОЙКИ ТРЕНАЖЁРА ---
const trainerConfig = {
    // Время на выполнение в секундах (например, 600 = 10 минут)
    totalTime: 600,
    // Сколько заданий нужно случайным образом выбрать из списка ниже
    problemsToSelect: 3
};

// --- Утилита для генерации случайных целых чисел (нужна для заданий) ---
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// --- СПИСОК ВСЕХ ТИПОВ ЗАДАНИЙ ---
const problemTypes = [
    {
        id: "УС1",
        generator: () => {
            let k = getRandomInt(501, 999);
            if (k % 10 === 0) k += 1;
            const n1 = getRandomInt(4, 9);
            let n4 = getRandomInt(1001, 99998);
            if (n4 % 10 === 0) n4 += 2;
            const n5 = k * n1 + n4;
            let n3 = getRandomInt(501, 998);
            if (n3 % 10 === 0) n3 += 3;
            const n2 = getRandomInt(4, 9);

            const answer = ((n5 - n4) / n1 + n3) * n2;
            const problemStr = `${n1} * (x : ${n2} - ${n3}) + ${n4} = ${n5}`;
            return { problem: problemStr, answer };
        }
    },
    {
        id: "УС2",
        generator: () => {
            let n4 = getRandomInt(501, 999);
            if (n4 % 10 === 0) n4 += 1;
            let n5 = getRandomInt(1001, 9998);
            if (n5 % 10 === 0) n5 += 2;
            const n3 = getRandomInt(4, 9);
            const k = getRandomInt(4, 9);
            const n2 = (n4 + n5) * n3 - k;
            let p = getRandomInt(5001, 9998);
            if (p % 10 === 0) p += 1;
            const n1 = p * k;

            const term1 = (n5 + n4) * n3 - n2;
            const answer = n1 / term1;
            const problemStr = `(${n1} : x + ${n2}) : ${n3} - ${n4} = ${n5}`;
            return { problem: problemStr, answer };
        }
    },
    // ... и так далее для всех 10 типов заданий ...
    // (Я скопирую сюда все остальные типы из вашего исходного кода)
    {
        id: "УС3",
        generator: () => {
            const n3 = getRandomInt(3, 9);
            let p = getRandomInt(501, 998);
            if (p % 10 === 0) p -= 123;
            const n5 = getRandomInt(4, 9);
            const n1 = n5 * p;
            let n4 = getRandomInt(1001, 6998);
            if (n4 % 10 === 0) n4 += 78;
            let m = getRandomInt(501, 998);
            if (m % 10 === 0) m -= 7;
            const n2 = m * n3 + (n1 / n5 + n4);
            
            const answer = (n2 - n4 - (n1 / n5)) / n3;
            const problemStr = `${n1} : (${n2} - ${n3} * x - ${n4}) = ${n5}`;
            return { problem: problemStr, answer };
        }
    },
    {
        id: "УС4",
        generator: () => {
            let n3 = getRandomInt(301, 499);
            if (n3 % 10 === 0) n3 += 123;
            let n2 = getRandomInt(1001, 1999);
            if (n2 % 10 === 0) n2 -= 68;
            const n1 = getRandomInt(n2 + n3 + 1001, 3499);
            const n4 = getRandomInt(n1 - n2 - n3 + 4, n1 - n2 - n3 + 9);
            let n5 = getRandomInt(501, 999);
            if (n5 % 100 === 0) n5 += 103;

            const answer = (n4 - (n1 - n2 - n3)) * n5;
            const problemStr = `${n1} - ${n2} - (${n4} - x : ${n5}) = ${n3}`;
            return { problem: problemStr, answer };
        }
    },
    {
        id: "УС5",
        generator: () => {
            let k = getRandomInt(501, 999);
            if (k % 10 === 0) k += 49;
            const n3 = getRandomInt(4, 9);
            let n1 = getRandomInt(101, 999);
            if (n1 % 10 === 0) n1 -= 17;
            let n5 = getRandomInt(101, 499);
            if (n5 % 10 === 0) n5 += 78;
            const n4 = getRandomInt(3, 9);
            const n2 = (n1 - n5) * n4 - k;

            const answer = (((n1 - n5) * n4) - n2) / n3;
            const problemStr = `${n1} - (${n2} + x * ${n3}) : ${n4} = ${n5}`;
            return { problem: problemStr, answer };
        }
    },
    {
        id: "УС6",
        generator: () => {
            let n1 = getRandomInt(101, 998);
            if (n1 % 10 === 0) n1 -= 3;
            const n2 = getRandomInt(4, 9);
            let p = getRandomInt(Math.ceil(101 / n2), Math.floor(998 / n2));
            if (p % 10 === 0) p -= 82;
            const n5 = n1 + n2 * p;
            const p_val = (n5 - n1) / n2;
            const n3 = getRandomInt(p_val + 3, p_val + 9);
            const t = n3 - p_val;
            let k = getRandomInt(101, 998);
            if (k % 10 === 0) k += 26;
            const n4 = k * t;

            const answer = n4 / (n3 - (n5 - n1) / n2);
            const problemStr = `${n1} + ${n2} * (${n3} - ${n4} : x) = ${n5}`;
            return { problem: problemStr, answer };
        }
    },
    {
        id: "УС7",
        generator: () => {
            const n5 = getRandomInt(4, 9);
            let n1 = getRandomInt(4, 9);
            if (n1 === 5) n1 = 4;
            const k = getRandomInt(Math.ceil(501 / n1), Math.floor(699 / n1));
            const n2 = n1 * k;
            const base_n3 = (n5 * n2) / n1;
            let n3 = getRandomInt(base_n3 + 501, base_n3 + 999);
            if (n3 % 10 === 0) n3 += 37;
            const n4 = getRandomInt(4, 9);

            const answer = (n3 - (n5 * n2) / n1) * n4;
            const problemStr = `${n1} * (${n3} - x : ${n4}) : ${n2} = ${n5}`;
            return { problem: problemStr, answer };
        }
    },
    {
        id: "УС8",
        generator: () => {
            const n4 = getRandomInt(4, 9);
            let k = getRandomInt(501, 998);
            if (k % 10 === 0) k -= 21;
            const n5 = n4 * k;
            const n2 = getRandomInt(4, 9);
            const p = getRandomInt(Math.ceil(501 / n2), Math.floor(999 / n2));
            const n1 = k - n2 * p;
            const n3 = getRandomInt(4, 9);
            
            const answer = ((n5 / n4 - n1) * n3) / n2;
            const problemStr = `(${n1} + x * ${n2} : ${n3}) * ${n4} = ${n5}`;
            return { problem: problemStr, answer };
        }
    },
    {
        id: "УС9",
        generator: () => {
            let m = getRandomInt(501, 998);
            if (m % 10 === 0) m -= 17;
            const p = getRandomInt(4, 9);
            const n2 = m * p;
            const n3 = getRandomInt(4, 9);
            const h = p * n3;
            const k = getRandomInt(4, 9);
            const n4 = getRandomInt(4, 9);
            const n5 = n4 * k;
            const n1 = h * k;

            const answer = (n2 * n4 * n5) / (n1 * n3);
            const problemStr = `${n1} : (${n2} : x * ${n3}) * ${n4} = ${n5}`;
            return { problem: problemStr, answer };
        }
    },
    {
        id: "УС10",
        generator: () => {
            let h = getRandomInt(51, 98);
            if (h % 10 === 0) h += 1;
            const t = getRandomInt(4, 9);
            const n3 = t * h;
            let p = getRandomInt(201, 599);
            if (p % 10 === 0) p += 17;
            const n2 = p + t;
            const n4 = getRandomInt(4, 9);
            let k = n4 * p;
            if (k % 10 === 0) k += 123;
            const n1 = getRandomInt(1001, 9999);
            const n5 = n1 + k;

            const answer = (n2 - (n5 - n1) / n4) / n3;
            const problemStr = `${n1} + (${n2} - ${n3} * x) * ${n4} = ${n5}`;
            return { problem: problemStr, answer };
        }
    }
];
