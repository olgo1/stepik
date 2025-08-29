// --- ОБЩИЕ НАСТРОЙКИ ТРЕНАЖЁРА ---
const trainerSettings = {
    title: "Тренажёр по уравнениям (с условиями)",
    problemsToSelect: 3,
    totalTime: 600 
};

// --- Утилиты для генерации (могут быть полезны) ---
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// --- БАЗА ШАБЛОНОВ ЗАДАЧ ---
const allTasks = [
    {
        type: "Простые уравнения",
        number: 101,
        // Генератор для этого типа задач
        generator: () => {
            // Создаём переменные согласно правилам
            const a2 = getRandomInt(10, 99); // Двузначное положительное
            const c1 = getRandomInt(2, 9);   // Однозначное положительное
            
            // "Обратная" генерация: сначала придумываем ответ
            const x = getRandomInt(5, 25); 
            
            // Затем вычисляем правую часть уравнения
            const result = a2 + c1 * x;

            // Собираем задачу
            const problemText = `${a2} + ${c1} * x = ${result}`;
            const answer = x;
            
            return { problem: problemText, answer: answer };
        }
    },
    {
        type: "Уравнения с отрицательными числами",
        number: 201,
        generator: () => {
            // a2 - двузначное положительное, не кратное 10
            let a2 = getRandomInt(11, 99);
            if (a2 % 10 === 0) a2--;

            // b3 - трёхзначное отрицательное
            const b3 = getRandomInt(-999, -100);

            // c1 - однозначное, не равное нулю
            let c1 = getRandomInt(-9, 9);
            if (c1 === 0) c1 = 1;

            const x = c1 * a2 + b3; // Придумываем ответ

            const problemText = `(x - (${b3})) : ${a2} = ${c1}`;
            const answer = x;

            return { problem: problemText, answer: answer };
        }
    },
    {
        type: "Уравнения со скобками",
        number: 301,
        generator: () => {
            const a2_1 = getRandomInt(10, 50);
            const a2_2 = getRandomInt(2, 9);
            
            const x = getRandomInt(10, 30); // Ответ
            const result = (x + a2_1) * a2_2;

            const problemText = `(x + ${a2_1}) * ${a2_2} = ${result}`;
            const answer = x;
            
            return { problem: problemText, answer: answer };
        }
    }
    // ... сюда можно добавлять любые другие шаблоны задач с их правилами
];
