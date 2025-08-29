// --- ОБЩИЕ НАСТРОЙКИ ТРЕНАЖЁРА ---
const trainerSettings = {
    title: "Время на часах",
    problemsToSelect: 3,
    totalTime: 600
};

// --- Утилиты для генерации ---
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// --- БАЗА ШАБЛОНОВ ЗАДАЧ ---
const allTasks = [
    {
        type: "Время в пути (пробки)",
        number: 1.1,
        generate: () => {
            const n1 = getRandomInt(17, 20);
            let k1 = getRandomInt(21, 59);
            if (k1 % 10 === 0) { k1 += 3; }
            const n2 = getRandomInt(0, 2);
            let k2 = getRandomInt(1, k1 - 1);
            if (k2 % 10 === 0) { k2 -= 5; }
            const t = getRandomInt(71, 119);
            const time1 = `${String(n1).padStart(2, '0')}:${String(k1).padStart(2, '0')}`;
            const time2 = `${String(n2).padStart(2, '0')}:${String(k2).padStart(2, '0')}`;
            const problemText = `Автобус выехал из автовокзала в ${time1} и должен был прибыть в пункт назначения в ${time2}. Однако он попал в пробку и прибыл на ${t} минут позже. Сколько времени автобус был в пути? Дайте ответ в минутах.`;
            const vars = { n1, k1, n2, k2, t };
            return { variables: vars, problemText: problemText };
        },
        calculateAnswer: (vars) => (vars.n2 * 60 + vars.k2 + vars.t) - (vars.n1 * 60 + vars.k1)
    },
    {
        type: "Время в пути (опережение)",
        number: 1.2,
        generate: () => {
            const n1 = getRandomInt(17, 20);
            let k1 = getRandomInt(21, 59);
            if (k1 % 10 === 0) { k1 += 3; }
            const n2 = getRandomInt(0, 2);
            let k2 = getRandomInt(1, k1 - 1);
            if (k2 % 10 === 0) { k2 -= 5; }
            let t = getRandomInt(71, 119);
            t -= t % 5;
            const time1 = `${String(n1).padStart(2, '0')}:${String(k1).padStart(2, '0')}`;
            const time2 = `${String(n2).padStart(2, '0')}:${String(k2).padStart(2, '0')}`;
            const problemText = `Автобус выехал из автовокзала в ${time1} и должен был прибыть в пункт назначения в ${time2}. Однако он не сделал остановку и прибыл на ${t} минут раньше. Сколько времени автобус был в пути? Дайте ответ в минутах.`;
            const vars = { n1, k1, n2, k2, t };
            return { variables: vars, problemText: problemText };
        },
        calculateAnswer: (vars) => (vars.n2 * 60 + vars.k2 - vars.t) - (vars.n1 * 60 + vars.k1)
    },
    {
        type: "Логика: Время прогулки (1)",
        number: 2.1,
        generate: () => {
            const N1 = ["Маша", "Лена", "Наташа", "Оля", "Яна"];
            const N2 = ["Денис", "Демид", "Андрей", "Витя", "Саша"];
            const name1 = N1[getRandomInt(0, N1.length - 1)];
            const name2 = N2[getRandomInt(0, N2.length - 1)];
            const n1 = getRandomInt(14, 17);
            let k1 = getRandomInt(10, 39);
            if (k1 % 5 === 0) { k1 += 1; }
            const t1 = getRandomInt(11, 16);
            const n2 = n1 + 1;
            let k2 = getRandomInt(0, k1 - 1);
            k2 -= k2 % 10;
            const t2 = getRandomInt(4, 14);
            const time1 = `${String(n1).padStart(2, '0')}:${String(k1).padStart(2, '0')}`;
            const time2 = `${String(n2).padStart(2, '0')}:${String(k2).padStart(2, '0')}`;
            const problemText = `${name1} вышла гулять в ${time1}, а ${name2} на ${t1} минут позже. ${name2} вернулся домой в ${time2}, и он гулял на ${t2} минут меньше ${name1}. Сколько минут гуляла ${name1}?`;
            const vars = { n1, k1, n2, k2, t1, t2 };
            return { variables: vars, problemText: problemText };
        },
        calculateAnswer: (vars) => (vars.n2 * 60 + vars.k2) - (vars.n1 * 60 + vars.k1 + vars.t1) + vars.t2
    },
    {
        type: "Логика: Время прогулки (2)",
        number: 2.2,
        generate: () => {
            const N1 = ["Ратмир", "Егор", "Миша", "Ильдар", "Денис"];
            const N2 = ["Настя", "Аня", "Катя", "Алина", "Сабина"];
            const name1 = N1[getRandomInt(0, N1.length - 1)];
            const name2 = N2[getRandomInt(0, N2.length - 1)];
            const n1 = getRandomInt(14, 17);
            let k1 = getRandomInt(10, 39);
            if (k1 % 5 === 0) { k1 += 1; }
            const t1 = getRandomInt(11, 16);
            const n2 = n1 + 1;
            let k2 = getRandomInt(0, k1 - 1);
            k2 -= k2 % 10;
            const t2 = getRandomInt(4, 14);
            const time1 = `${String(n1).padStart(2, '0')}:${String(k1).padStart(2, '0')}`;
            const time2 = `${String(n2).padStart(2, '0')}:${String(k2).padStart(2, '0')}`;
            const problemText = `${name1} вышел гулять в ${time1}, а ${name2} на ${t1} минут позже. ${name2} вернулась домой в ${time2}, и она гуляла на ${t2} минут меньше ${name1}. Во сколько вернулся домой ${name1}? Дайте ответ в формате чч:мм.`;
            const vars = { n1, k1, n2, k2, t1, t2 };
            return { variables: vars, problemText: problemText };
        },
        calculateAnswer: (vars) => {
            const totalMinutes = vars.n1 * 60 + vars.k1 + (vars.n2 * 60 + vars.k2 - (vars.n1 * 60 + vars.k1 + vars.t1) + vars.t2);
            const n0 = Math.floor(totalMinutes / 60);
            const k0 = totalMinutes % 60;
            return `${String(n0).padStart(2, '0')}:${String(k0).padStart(2, '0')}`;
        }
    },
    {
        type: "Поезда (1)",
        number: 3.1,
        generate: () => {
            const n1 = getRandomInt(9, 20);
            let k1 = getRandomInt(5, 30);
            k1 -= k1 % 10;
            const n2 = n1 + 4;
            const k2 = getRandomInt(k1 + 10, k1 + 29);
            const n3 = getRandomInt(n1 + 1, 22);
            let k3 = getRandomInt(10, 59);
            k3 -= k3 % 10;
            let t1 = getRandomInt(61, 300);
            t1 -= t1 % 10;
            const time1 = `${String(n1).padStart(2, '0')}:${String(k1).padStart(2, '0')}`;
            const time2 = `${String(n2).padStart(2, '0')}:${String(k2).padStart(2, '0')}`;
            const time3 = `${String(n3).padStart(2, '0')}:${String(k3).padStart(2, '0')}`;
            const problemText = `Поезд Сапсан отправляется из Санкт-Петербурга в ${time1} и прибывает в Москву в ${time2}. Обычный поезд отправляется в ${time3}, а едет до Москвы на ${t1} мин дольше Сапсана. Во сколько этот поезд прибывает в Москву? Дайте ответ в формате чч:мм.`;
            const vars = { n1, k1, n2, k2, n3, k3, t1 };
            return { variables: vars, problemText: problemText };
        },
        calculateAnswer: (vars) => {
            const totalMinutes = vars.n3 * 60 + vars.k3 + (vars.n2 * 60 + vars.k2 - (vars.n1 * 60 + vars.k1) + vars.t1);
            const n0 = Math.floor(totalMinutes / 60);
            const k0 = totalMinutes % 60;
            return `${String(n0).padStart(2, '0')}:${String(k0).padStart(2, '0')}`;
        }
    },
    {
        type: "Поезда (2)",
        number: 3.2,
        generate: () => {
            const n1 = getRandomInt(5, 15);
            let k1 = getRandomInt(5, 30);
            k1 -= k1 % 10;
            const n2 = getRandomInt(n1 + 5, n1 + 7);
            const k2 = getRandomInt(10, 50);
            let t1 = getRandomInt(61, 80);
            t1 -= t1 % 5;
            const n3 = getRandomInt(10, 16);
            let k3 = getRandomInt(5, 30);
            k3 -= k3 % 10;
            const time1 = `${String(n1).padStart(2, '0')}:${String(k1).padStart(2, '0')}`;
            const time2 = `${String(n2).padStart(2, '0')}:${String(k2).padStart(2, '0')}`;
            const time3 = `${String(n3).padStart(2, '0')}:${String(k3).padStart(2, '0')}`;
            const problemText = `Поезд отправляется из Москвы в Санкт-Петербург в ${time1}, а прибывает в ${time2}. На обратную дорогу поезд тратит на ${t1} минут меньше. Во сколько поезд прибудет в Москву, если он выедет из Санкт-Петербурга в ${time3}? Дайте ответ в формате чч:мм.`;
            const vars = { n1, k1, n2, k2, n3, k3, t1 };
            return { variables: vars, problemText: problemText };
        },
        calculateAnswer: (vars) => {
            const totalMinutes = vars.n3 * 60 + vars.k3 + (vars.n2 * 60 + vars.k2 - (vars.n1 * 60 + vars.k1) - vars.t1);
            const n0 = Math.floor(totalMinutes / 60);
            const k0 = totalMinutes % 60;
            return `${String(n0).padStart(2, '0')}:${String(k0).padStart(2, '0')}`;
        }
    },
    {
        type: "Лекции (1)",
        number: 4.1,
        generate: () => {
            const n1 = getRandomInt(8, 15);
            let k1 = getRandomInt(6, 10);
            k1 -= k1 % 2;
            const n2 = getRandomInt(n1 + 2, n1 + 3);
            let k2 = getRandomInt(10, 50);
            k2 -= k2 % 2;
            const time1 = `${String(n1).padStart(2, '0')}:${String(k1).padStart(2, '0')}`;
            const time2 = `${String(n2).padStart(2, '0')}:${String(k2).padStart(2, '0')}`;
            const problemText = `Лекция началась в ${time1} и закончилась в ${time2}. Посередине лекции лектор зевнул. Сколько времени было на часах? Дайте ответ в формате чч:мм.`;
            const vars = { n1, k1, n2, k2 };
            return { variables: vars, problemText: problemText };
        },
        calculateAnswer: (vars) => {
            const totalMinutes = vars.n1 * 60 + vars.k1 + (vars.n2 * 60 + vars.k2 - (vars.n1 * 60 + vars.k1)) / 2;
            const n0 = Math.floor(totalMinutes / 60);
            const k0 = Math.round(totalMinutes % 60);
            return `${String(n0).padStart(2, '0')}:${String(k0).padStart(2, '0')}`;
        }
    },
    {
        type: "Лекции (2)",
        number: 4.2,
        generate: () => {
            const n1 = getRandomInt(8, 15);
            let k1 = getRandomInt(5, 10);
            k1 -= k1 % 2;
            const n2 = getRandomInt(2, 4);
            let k2 = getRandomInt(2, 50);
            k2 -= k2 % 2;
            if ((k1 + k2) % 10 === 0) { k2 += 2; }
            let t1 = getRandomInt(70, 120);
            t1 -= t1 % 10;
            const time1 = `${String(n1).padStart(2, '0')}:${String(k1).padStart(2, '0')}`;
            const problemText = `Лекция началась в ${time1} и длилась ${n2} часов ${k2} минут. За ${t1} минут до конца лекции лектор зевнул. Сколько времени было на часах? Дайте ответ в формате чч:мм.`;
            const vars = { n1, k1, n2, k2, t1 };
            return { variables: vars, problemText: problemText };
        },
        calculateAnswer: (vars) => {
            const totalMinutes = vars.n1 * 60 + vars.k1 + vars.n2 * 60 + vars.k2 - vars.t1;
            const n0 = Math.floor(totalMinutes / 60);
            const k0 = totalMinutes % 60;
            return `${String(n0).padStart(2, '0')}:${String(k0).padStart(2, '0')}`;
        }
    },
    {
        type: "Школа (1)",
        number: 5.1,
        generate: () => {
            const name1List = ["Даша", "Василиса", "Рита", "Света"];
            const name2List = ["Гоша", "Гриша", "Дима", "Миша"];
            const name1 = name1List[getRandomInt(0, name1List.length - 1)];
            const name2 = name2List[getRandomInt(0, name2List.length - 1)];
            const t1 = [40, 45][getRandomInt(0, 1)];
            let t2 = getRandomInt(12, 18);
            t2 -= t2 % 2;
            const m1 = [2, 3, 4, 5, 6][getRandomInt(0, 4)];
            const m2 = m1 + 2; // Упрощенная логика для предсказуемости
            const n1 = Math.floor((525 + t1 * m2 + t2 * (m2 - 1)) / 60);
            const k1 = (525 + t1 * m2 + t2 * (m2 - 1)) % 60;
            const time1 = `${String(n1).padStart(2, '0')}:${String(k1).padStart(2, '0')}`;
            const problemText = `В школе каждый урок длится ${t1} минут, а каждая перемена - ${t2} минут. Уроки начинаются в 8:45. ${name1} ушла сразу после ${m1} урока, а ${name2} - сразу после ${m2}, в ${time1}. Сколько было времени, когда ушла ${name1}? Дайте ответ в виде чч:мм.`;
            const vars = { n1, k1, m1, m2, t1, t2 };
            return { variables: vars, problemText: problemText };
        },
        calculateAnswer: (vars) => {
            const totalMinutes = (vars.n1 * 60 + vars.k1) - (vars.m2 - vars.m1) * (vars.t1 + vars.t2);
            const n0 = Math.floor(totalMinutes / 60);
            const k0 = totalMinutes % 60;
            return `${String(n0).padStart(2, '0')}:${String(k0).padStart(2, '0')}`;
        }
    },
    {
        type: "Школа (2)",
        number: 5.2,
        generate: () => {
            const t1 = [40, 45][getRandomInt(0, 1)];
            let t2 = getRandomInt(12, 18);
            t2 -= t2 % 2;
            const m1 = [2, 3, 4, 5, 6][getRandomInt(0, 4)];
            const m2 = m1 + 2; // Упрощенная логика для предсказуемости
            const n1 = Math.floor((525 + t1 * m2 + t2 * (m2 - 1)) / 60);
            const k1 = (525 + t1 * m2 + t2 * (m2 - 1)) % 60;
            const time1 = `${String(n1).padStart(2, '0')}:${String(k1).padStart(2, '0')}`;
            const problemText = `В школе каждый урок длится ${t1} минут, а каждая перемена - ${t2} минут. Уроки начинаются в 8:45. ${m2} урок закончился в ${time1}. Во сколько закончился ${m1} урок? Дайте ответ в виде чч:мм.`;
            const vars = { n1, k1, m1, m2, t1, t2 };
            return { variables: vars, problemText: problemText };
        },
        calculateAnswer: (vars) => {
            const totalMinutes = (vars.n1 * 60 + vars.k1) - (vars.m2 - vars.m1) * (vars.t1 + vars.t2);
            const n0 = Math.floor(totalMinutes / 60);
            const k0 = totalMinutes % 60;
            return `${String(n0).padStart(2, '0')}:${String(k0).padStart(2, '0')}`;
        }
    },
    {
        type: "Самолёты (1)",
        number: 6.1,
        generate: () => {
            const a = [1, 2, 3][getRandomInt(0, 2)];
            const b = [10, 20, 30, 40, 50][getRandomInt(0, 4)];
            const t = getRandomInt(1, 29);
            const n1 = getRandomInt(3, 23);
            let k1 = getRandomInt(11, 59);
            if (k1 % 10 === 0) { k1++; }
            const time1 = `${String(n1).padStart(2, '0')}:${String(k1).padStart(2, '0')}`;
            const problemText = `Вылет самолёта задержали на ${a} ч ${b} мин. Он немного изменил маршрут, поэтому летел на ${t} минут больше расчётного времени и приземлился в ${time1}. Во сколько должен был приземлиться этот самолёт по плану? Дайте ответ в виде чч:мм.`;
            const vars = { a, b, t, n1, k1 };
            return { variables: vars, problemText: problemText };
        },
        calculateAnswer: (vars) => {
            let totalMinutes = (vars.n1 * 60 + vars.k1) - vars.t - (vars.a * 60 + vars.b);
            while (totalMinutes < 0) { totalMinutes += 24 * 60; }
            const n0 = Math.floor(totalMinutes / 60) % 24;
            const k0 = totalMinutes % 60;
            return `${String(n0).padStart(2, '0')}:${String(k0).padStart(2, '0')}`;
        }
    },
    {
        type: "Самолёты (2)",
        number: 6.2,
        generate: () => {
            const a = [1, 2, 3][getRandomInt(0, 2)];
            const b = [10, 20, 30, 40, 50][getRandomInt(0, 4)];
            const t = getRandomInt(1, 29);
            const n1 = getRandomInt(3, 23);
            let k1 = getRandomInt(11, 59);
            if (k1 % 10 === 0) { k1++; }
            const time1 = `${String(n1).padStart(2, '0')}:${String(k1).padStart(2, '0')}`;
            const problemText = `Вылет самолёта задержали на ${a} ч ${b} мин. Он немного изменил маршрут, поэтому летел на ${t} минут меньше расчётного времени и приземлился в ${time1}. Во сколько этот самолёт должен был вылететь по плану? Дайте ответ в виде чч:мм.`;
            const vars = { a, b, t, n1, k1 };
            return { variables: vars, problemText: problemText };
        },
        calculateAnswer: (vars) => {
            // Примечание: Эта формула из вашего условия, она не учитывает неизвестное время полёта.
            let totalMinutes = (vars.n1 * 60 + vars.k1 + vars.t) - (vars.a * 60 + vars.b);
            while (totalMinutes < 0) { totalMinutes += 24 * 60; }
            const n0 = Math.floor(totalMinutes / 60) % 24;
            const k0 = totalMinutes % 60;
            return `${String(n0).padStart(2, '0')}:${String(k0).padStart(2, '0')}`;
        }
    },
    {
        type: "Встречи (1)",
        number: 7.1,
        generate: () => {
            const names = ["Марина", "Злата", "Элина", "Аня", "Оксана", "Мия"];
            const idx1 = getRandomInt(0, names.length - 1);
            const name1 = names[idx1];
            let idx2 = getRandomInt(0, names.length - 1);
            while (idx1 === idx2) {
                idx2 = getRandomInt(0, names.length - 1);
            }
            const name2 = names[idx2];
            const n1 = getRandomInt(9, 14);
            const k1 = getRandomInt(21, 49);
            const n2 = n1 + 1;
            const k2 = getRandomInt(1, k1 - 11);
            let t = getRandomInt(60 + k2 - k1 + 6, 89);
            t -= t % 5;
            const time1 = `${String(n1).padStart(2, '0')}:${String(k1).padStart(2, '0')}`;
            const time2 = `${String(n2).padStart(2, '0')}:${String(k2).padStart(2, '0')}`;
            const problemText = `${name1} и ${name2} договорились встретиться. ${name1} пришла в ${time1}, но ${name2} ещё не было. В ${time2} ${name2} пришла, и ${name1} возмущённо сказала: “Ты опоздала на ${t} минут!” “А ты на сколько?” - спросила ${name2}. Что должна (честно) ответить ${name1}? (ответ в минутах)`;
            const vars = { n1, k1, n2, k2, t };
            return { variables: vars, problemText: problemText };
        },
        calculateAnswer: (vars) => (vars.n1 * 60 + vars.k1) - (vars.n2 * 60 + vars.k2 - vars.t)
    },
    {
        type: "Встречи (2)",
        number: 7.2,
        generate: () => {
            const names = ["Марина", "Злата", "Элина", "Аня", "Оксана", "Мия"];
            const idx1 = getRandomInt(0, names.length - 1);
            const name1 = names[idx1];
            let idx2 = getRandomInt(0, names.length - 1);
            while (idx1 === idx2) {
                idx2 = getRandomInt(0, names.length - 1);
            }
            const name2 = names[idx2];
            const n1 = getRandomInt(9, 14);
            const k1 = getRandomInt(46, 58);
            const n2 = n1 + 2;
            const k2 = getRandomInt(1, k1 - 41);
            let t = getRandomInt(80 + k2 - k1 + 1, 119 + k2 - k1);
            t -= t % 5;
            const time1 = `${String(n1).padStart(2, '0')}:${String(k1).padStart(2, '0')}`;
            const time2 = `${String(n2).padStart(2, '0')}:${String(k2).padStart(2, '0')}`;
            const problemText = `${name1} и ${name2} договорились встретиться. ${name1} пришла в ${time1}, но ${name2} ещё не было. В ${time2} ${name2} пришла, и ${name1} сказала: “Ты опоздала на ${t} минут!” За сколько минут до встречи пришла ${name1}?`;
            const vars = { n1, k1, n2, k2, t };
            return { variables: vars, problemText: problemText };
        },
        calculateAnswer: (vars) => (vars.n2 * 60 + vars.k2 - vars.t) - (vars.n1 * 60 + vars.k1)
    },
    {
        type: "Опоздания (1)",
        number: 9.1,
        generate: () => {
            const names = ["Михаил Юрьевич", "Сергей Петрович", "Дмитрий Олегович", "Юрий Владимирович"];
            const name1 = names[getRandomInt(0, names.length - 1)];
            let t1 = getRandomInt(61, 89);
            if (t1 % 5 === 0) t1++;
            const t2 = getRandomInt(16, 44);
            const n1 = getRandomInt(9, 14);
            let k1 = getRandomInt(12, 49);
            if (k1 % 5 === 0) k1++;
            const time1 = `${String(n1).padStart(2, '0')}:${String(k1).padStart(2, '0')}`;
            const problemText = `${name1} хотел приехать на вокзал за ${t1} минут до отправления поезда. Однако он потратил на дорогу на ${t2} минут больше, чем рассчитывал, и приехал только в ${time1}. Во сколько отправляется поезд? Дайте ответ в виде чч:мм.`;
            const vars = { n1, k1, t1, t2 };
            return { variables: vars, problemText: problemText };
        },
        calculateAnswer: (vars) => {
            const totalMinutes = vars.n1 * 60 + vars.k1 - vars.t2 + vars.t1;
            const n0 = Math.floor(totalMinutes / 60);
            const k0 = totalMinutes % 60;
            return `${String(n0).padStart(2, '0')}:${String(k0).padStart(2, '0')}`;
        }
    },
    {
        type: "Опоздания (2)",
        number: 9.2,
        generate: () => {
            const names = ["Михаил Юрьевич", "Сергей Петрович", "Дмитрий Олегович", "Юрий Владимирович"];
            const name1 = names[getRandomInt(0, names.length - 1)];
            const n1 = getRandomInt(9, 14);
            let k1 = getRandomInt(12, 49);
            if (k1 % 5 === 0) k1++;
            const t3 = getRandomInt(6, 9);
            const t4 = getRandomInt(6, 9);
            let t5 = getRandomInt(61, 89);
            if (t5 % 10 === 0) t5++;
            const time1 = `${String(n1).padStart(2, '0')}:${String(k1).padStart(2, '0')}`;
            const problemText = `${name1} планировал приехать на вокзал в ${time1}, за ${t4} минут до отправления поезда. Он вышел из дома позже и опоздал на поезд на ${t3} минут. Во сколько ${name1} вышел из дома, если до вокзала он добирался ${t5} минут? Дайте ответ в виде чч:мм.`;
            const vars = { n1, k1, t3, t4, t5 };
            return { variables: vars, problemText: problemText };
        },
        calculateAnswer: (vars) => {
            const totalMinutes = vars.n1 * 60 + vars.k1 + vars.t4 + vars.t3 - vars.t5;
            const n0 = Math.floor(totalMinutes / 60);
            const k0 = totalMinutes % 60;
            return `${String(n0).padStart(2, '0')}:${String(k0).padStart(2, '0')}`;
        }
    },
    {
        type: "Поезда (3)",
        number: 10.1,
        generate: () => {
            let n1 = getRandomInt(9, 16);
            let k1 = getRandomInt(1, 29);
            if (k1 % 5 === 0) k1++;
            const n2 = getRandomInt(n1 + 4, n1 + 6);
            let k2 = getRandomInt(k1 + 1, 59);
            if (k2 % 5 === 0) k2++;
            let n3;
            do {
                n3 = getRandomInt(9, 16);
            } while (n3 === n1 - 1 || n3 === n1 || n3 === n1 + 1);
            const k3 = [10, 20, 30, 40, 50][getRandomInt(0, 4)];
            const t = [70, 80][getRandomInt(0, 1)];
            const time1 = `${String(n1).padStart(2, '0')}:${String(k1).padStart(2, '0')}`;
            const time2 = `${String(n2).padStart(2, '0')}:${String(k2).padStart(2, '0')}`;
            const time3 = `${String(n3).padStart(2, '0')}:${String(k3).padStart(2, '0')}`;
            const problemText = `Первый поезд выезжает со станции А в ${time1} и прибывает в Б в ${time2}. Второй поезд выезжает из А в ${time3}, а едет на ${t} минут дольше, чем первый. Во сколько второй поезд прибывает в Б? Дайте ответ в виде чч:мм.`;
            const vars = { n1, k1, n2, k2, n3, k3, t };
            return { variables: vars, problemText: problemText };
        },
        calculateAnswer: (vars) => {
            const totalMinutes = (vars.n3 * 60 + vars.k3) + (vars.n2 * 60 + vars.k2 - (vars.n1 * 60 + vars.k1)) + vars.t;
            const n0 = Math.floor(totalMinutes / 60);
            const k0 = totalMinutes % 60;
            return `${String(n0).padStart(2, '0')}:${String(k0).padStart(2, '0')}`;
        }
    },
    {
        type: "Поезда (4)",
        number: 10.2,
        generate: () => {
            let n1 = getRandomInt(9, 16);
            let k1 = getRandomInt(1, 29);
            if (k1 % 5 === 0) k1++;
            const n2 = getRandomInt(n1 + 4, n1 + 6);
            let k2 = getRandomInt(k1 + 1, 59);
            if (k2 % 5 === 0) k2++;
            let n3;
            do {
                n3 = getRandomInt(9, 16);
            } while (n3 === n1 - 1 || n3 === n1 || n3 === n1 + 1);
            const k3 = [10, 20, 30, 40, 50][getRandomInt(0, 4)];
            const t = [70, 80][getRandomInt(0, 1)];
            const time1 = `${String(n1).padStart(2, '0')}:${String(k1).padStart(2, '0')}`;
            const time2 = `${String(n2).padStart(2, '0')}:${String(k2).padStart(2, '0')}`;
            const time3 = `${String(n3).padStart(2, '0')}:${String(k3).padStart(2, '0')}`;
            const problemText = `Первый поезд выезжает со станции А в ${time1} и прибывает в Б в ${time2}. Второй поезд выезжает из А в ${time3}, а едет на ${t} минут меньше, чем первый. Во сколько второй поезд прибывает в Б? Дайте ответ в виде чч:мм.`;
            const vars = { n1, k1, n2, k2, n3, k3, t };
            return { variables: vars, problemText: problemText };
        },
        calculateAnswer: (vars) => {
            const totalMinutes = (vars.n3 * 60 + vars.k3) + (vars.n2 * 60 + vars.k2 - (vars.n1 * 60 + vars.k1)) - vars.t;
            const n0 = Math.floor(totalMinutes / 60);
            const k0 = totalMinutes % 60;
            return `${String(n0).padStart(2, '0')}:${String(k0).padStart(2, '0')}`;
        }
    },
    {
        type: "Электрички (1)",
        number: 11.1,
        generate: () => {
            const name1List = ["Ромашково", "Хлюпино", "Быково", "Дачная"];
            const name2List = ["Ваня", "Даня", "Рома", "Андрей", "Саша"];
            const name1 = name1List[getRandomInt(0, name1List.length - 1)];
            const name2 = name2List[getRandomInt(0, name2List.length - 1)];
            const a = [1, 2, 3][getRandomInt(0, 2)];
            const b = [10, 20, 30, 40, 50][getRandomInt(0, 4)];
            const n1 = getRandomInt(9, 16);
            let k1 = getRandomInt(1, 59);
            if (k1 % 5 === 0) k1++;
            let t = getRandomInt(31, 60 * a + b - 1);
            t -= t % 30;
            if (t <= 30) t = 60;
            const time1 = `${String(n1).padStart(2, '0')}:${String(k1).padStart(2, '0')}`;
            const problemText = `Электрички со станции ${name1} отправляются в Москву с интервалом ${a} часов ${b} минут. ${name2} приехал на станцию в ${time1} и оказалось, что последняя электричка ушла ${t} минут назад. Во сколько уходит следующая электричка? Дайте ответ в виде чч:мм.`;
            const vars = { n1, k1, a, b, t };
            return { variables: vars, problemText: problemText };
        },
        calculateAnswer: (vars) => {
            const totalMinutes = vars.n1 * 60 + vars.k1 - vars.t + vars.a * 60 + vars.b;
            const n0 = Math.floor(totalMinutes / 60);
            const k0 = totalMinutes % 60;
            return `${String(n0).padStart(2, '0')}:${String(k0).padStart(2, '0')}`;
        }
    },
    {
        type: "Электрички (2)",
        number: 11.2,
        generate: () => {
            const name1List = ["Ромашково", "Хлюпино", "Быково", "Дачная"];
            const name2List = ["Ваня", "Даня", "Рома", "Андрей", "Саша"];
            const name1 = name1List[getRandomInt(0, name1List.length - 1)];
            const name2 = name2List[getRandomInt(0, name2List.length - 1)];
            const a = [1, 2, 3][getRandomInt(0, 2)];
            const b = [10, 20, 30, 40, 50][getRandomInt(0, 4)];
            const n1 = getRandomInt(9, 16);
            let k1 = getRandomInt(1, 59);
            if (k1 % 5 === 0) k1++;
            let t = getRandomInt(31, 60 * a + b - 1);
            t -= t % 30;
            if (t <= 30) t = 60;
            const time1 = `${String(n1).padStart(2, '0')}:${String(k1).padStart(2, '0')}`;
            const problemText = `Электрички со станции ${name1} отправляются в Москву с интервалом ${a} часов ${b} минут. ${name2} приехал на станцию в ${time1} и оказалось, что следующая электричка будет через ${t} минут. Во сколько ушла предыдущая электричка? Дайте ответ в виде чч:мм.`;
            const vars = { n1, k1, a, b, t };
            return { variables: vars, problemText: problemText };
        },
        calculateAnswer: (vars) => {
            const totalMinutes = vars.n1 * 60 + vars.k1 + vars.t - (vars.a * 60 + vars.b);
            const n0 = Math.floor(totalMinutes / 60);
            const k0 = totalMinutes % 60;
            return `${String(n0).padStart(2, '0')}:${String(k0).padStart(2, '0')}`;
        }
    },
    {
        type: "Автомобиль и автобус (1)",
        number: 12.1,
        generate: () => {
            let t1 = getRandomInt(240, 320);
            t1 -= t1 % 10;
            const n2 = getRandomInt(Math.floor(t1 / 60) + 1, Math.floor(t1 / 60) + 2);
            const k2 = getRandomInt(1, 9);
            const n1 = getRandomInt(9, 16);
            let k1 = getRandomInt(1, 59);
            if (k1 % 5 === 0) k1++;
            const time1 = `${String(n1).padStart(2, '0')}:${String(k1).padStart(2, '0')}`;
            const problemText = `Автомобиль едет из города А в город Б ${t1} минут, а автобус - ${n2} часов ${k2} минуты. Автобус выехал из А в ${time1}. Во сколько должен выехать автомобиль, чтобы прибыть в Б одновременно с автобусом? Дайте ответ в виде чч:мм.`;
            const vars = { n1, k1, t1, n2, k2 };
            return { variables: vars, problemText: problemText };
        },
        calculateAnswer: (vars) => {
            const arrivalTime = (vars.n1 * 60 + vars.k1) + (vars.n2 * 60 + vars.k2);
            const totalMinutes = arrivalTime - vars.t1;
            const n0 = Math.floor(totalMinutes / 60);
            const k0 = totalMinutes % 60;
            return `${String(n0).padStart(2, '0')}:${String(k0).padStart(2, '0')}`;
        }
    },
    {
        type: "Автомобиль и автобус (2)",
        number: 12.2,
        generate: () => {
            let t1 = getRandomInt(240, 320);
            t1 -= t1 % 10;
            const n2 = getRandomInt(Math.floor(t1 / 60) + 1, Math.floor(t1 / 60) + 2);
            const k2 = getRandomInt(1, 9);
            const n1 = getRandomInt(9, 16);
            let k1 = getRandomInt(1, 59);
            if (k1 % 5 === 0) k1++;
            const time1 = `${String(n1).padStart(2, '0')}:${String(k1).padStart(2, '0')}`;
            const problemText = `Автомобиль едет из города А в город Б ${t1} минут, а автобус - ${n2} часов ${k2} минуты. Автомобиль выехал из А в ${time1}. Во сколько должен выехать автобус, чтобы прибыть в Б одновременно с автомобилем? Дайте ответ в виде чч:мм.`;
            const vars = { n1, k1, t1, n2, k2 };
            return { variables: vars, problemText: problemText };
        },
        calculateAnswer: (vars) => {
            const totalMinutes = (vars.n1 * 60 + vars.k1 + vars.t1) - (vars.n2 * 60 + vars.k2);
            const n0 = Math.floor(totalMinutes / 60);
            const k0 = totalMinutes % 60;
            return `${String(n0).padStart(2, '0')}:${String(k0).padStart(2, '0')}`;
        }
    },
    {
        type: "Время прогулки (3)",
        number: 13.1,
        generate: () => {
            const name1List = ["Лена", "Даша", "Дарина", "Тася", "Лера", "Аманда"];
            const name2List = ["Серёжа", "Глеб", "Денис", "Антон", "Родион"];
            const name1 = name1List[getRandomInt(0, name1List.length - 1)];
            const name2 = name2List[getRandomInt(0, name2List.length - 1)];
            const a = [2, 3][getRandomInt(0, 1)];
            let b = getRandomInt(11, 49);
            if (b % 5 === 0) b++;
            const t1 = getRandomInt(2, 9);
            let t2 = getRandomInt(61, 89);
            t2 -= t2 % 10;
            if (t2 <= 60) t2 = 70;
            const problemText = `${name1} гуляла ${a} часа ${b} минут. ${name2} вышел на ${t1} минуты позже ${name1}, а вернулся на ${t2} минут раньше. Сколько минут гулял ${name2}?`;
            const vars = { a, b, t1, t2 };
            return { variables: vars, problemText: problemText };
        },
        calculateAnswer: (vars) => vars.a * 60 + vars.b - vars.t1 - vars.t2
    },
    {
        type: "Время прогулки (4)",
        number: 13.2,
        generate: () => {
            const name1List = ["Лена", "Даша", "Дарина", "Тася", "Лера", "Аманда"];
            const name2List = ["Серёжа", "Глеб", "Денис", "Антон", "Родион"];
            const name1 = name1List[getRandomInt(0, name1List.length - 1)];
            const name2 = name2List[getRandomInt(0, name2List.length - 1)];
            const a = [2, 3][getRandomInt(0, 1)];
            let b = getRandomInt(11, 49);
            if (b % 5 === 0) b++;
            const t1 = getRandomInt(2, 9);
            const t2 = t1 + getRandomInt(1, 3);
            const problemText = `${name1} гуляла ${a} часа ${b} минут. ${name2} вышел на ${t1} минуты позже ${name1}, а вернулся на ${t2} минут позже. Сколько минут гулял ${name2}?`;
            const vars = { a, b, t1, t2 };
            return { variables: vars, problemText: problemText };
        },
        calculateAnswer: (vars) => vars.a * 60 + vars.b - vars.t1 + vars.t2
    },
    {
        type: "Тесты (1)",
        number: 14.1,
        generate: () => {
            const name1List = ["Серёжа", "Глеб", "Денис", "Антон", "Родион"];
            const name2List = ["Лена", "Даша", "Дарина", "Тася", "Лера", "Аманда"];
            const name1 = name1List[getRandomInt(0, name1List.length - 1)];
            const name2 = name2List[getRandomInt(0, name2List.length - 1)];
            const a = [1, 2, 3][getRandomInt(0, 2)];
            const b = [10, 20, 30, 40, 50][getRandomInt(0, 4)];
            let t1 = getRandomInt(11, 24);
            if (t1 % 10 === 0) t1++;
            const t2 = getRandomInt(6, 14);
            const upperBound = a * 60 + b - t1 - t2;
            const t3 = getRandomInt(10, Math.floor(upperBound / 2) - 1);
            const problemText = `Тест длится ${a} часов ${b} минут. ${name1} опоздал на тест на ${t1} минут, а закончил за ${t2} минут до конца. ${name2} писала тест на ${t3} минут больше ${name1}. За сколько минут ${name2} справилась с тестом?`;
            const vars = { a, b, t1, t2, t3 };
            return { variables: vars, problemText: problemText };
        },
        calculateAnswer: (vars) => vars.a * 60 + vars.b - vars.t1 - vars.t2 + vars.t3
    },
    {
        type: "Тесты (2)",
        number: 14.2,
        generate: () => {
            const name1List = ["Серёжа", "Глеб", "Денис", "Антон", "Родион"];
            const name2List = ["Лена", "Даша", "Дарина", "Тася", "Лера", "Аманда"];
            const name1 = name1List[getRandomInt(0, name1List.length - 1)];
            const name2 = name2List[getRandomInt(0, name2List.length - 1)];
            const b = [10, 20, 30, 40, 50][getRandomInt(0, 4)];
            const t1 = getRandomInt(4, 6);
            let t2 = getRandomInt(61, 89);
            if (t2 % 5 !== 0) t2 -= t2 % 5;
            const upperBound = t1 + t2 - 5;
            let t3 = getRandomInt(3, upperBound - 1);
            if (t3 % 5 === 0) t3++;
            const problemText = `Тест длится 2 часа ${b} минут. ${name2} опоздала на него на ${t1} минут, а закончила за ${t2} минут до конца. ${name1} писал тест на ${t3} минут дольше ${name2}. За сколько минут ${name1} выполнил тест?`;
            const vars = { b, t1, t2, t3 };
            return { variables: vars, problemText: problemText };
        },
        calculateAnswer: (vars) => 120 + vars.b - vars.t1 - vars.t2 + vars.t3
    }
];
