// --- Логика тренажёра ---
document.addEventListener('DOMContentLoaded', () => {
    // --- Получение элементов со страницы ---
    const problemsContainer = document.getElementById('problems-container');
    const checkBtn = document.getElementById('checkBtn');
    const timerEl = document.getElementById('timer');
    const progressBar = document.querySelector('.progress-bar');
    const resultsEl = document.getElementById('results');
    const scoreTextEl = document.getElementById('score-text');
    const printBtn = document.getElementById('printBtn');

    let generatedProblems = [];
    let timerInterval;
    let progressSquares = [];

    // --- Утилиты ---
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    const formatNumber = (num) => {
        if (isNaN(num)) return num;
        if (Number.isInteger(num)) return num.toString();
        // Округляем до 2 знаков после запятой для дробных ответов
        return (Math.round(num * 100) / 100).toString().replace('.', ',');
    };

    // --- Основные функции ---
    function init() {
        // --- Установка заголовков из настроек ---
        document.getElementById('trainer-title').textContent = trainerSettings.title || 'Тренажёр';
        const minutes = Math.floor(trainerSettings.totalTime / 60);
        document.getElementById('trainer-subtitle').textContent = `Заданий: ${trainerSettings.problemsToSelect} | Время: ${minutes} мин.`;
        document.title = trainerSettings.title || 'Тренажёр';

        // --- Логика выбора задач ---
        const tasksByType = allTasks.reduce((acc, task) => {
            if (!acc[task.type]) { acc[task.type] = []; }
            acc[task.type].push(task);
            return acc;
        }, {});

        const uniqueTypes = Object.keys(tasksByType);
        shuffleArray(uniqueTypes);
        const typesToSelect = Math.min(trainerSettings.problemsToSelect, uniqueTypes.length);
        const selectedTypes = uniqueTypes.slice(0, typesToSelect);

        // --- Генерация задач ---
        generatedProblems = selectedTypes.map(type => {
            const tasksInType = tasksByType[type];
            const randomIndex = Math.floor(Math.random() * tasksInType.length);
            const taskTemplate = tasksInType[randomIndex];

            // 1. Генерируем переменные и текст задачи
            const generated = taskTemplate.generate();
            
            // 2. Вычисляем ответ по вашей формуле, передавая сгенерированные переменные
            const answer = taskTemplate.calculateAnswer(generated.variables);

            // 3. Собираем финальный объект задачи для тренажёра
            return {
                problem: generated.problemText,
                answer: answer
            };
        });
        
        // --- Отображение UI ---
        progressBar.innerHTML = '';
        for (let i = 0; i < generatedProblems.length; i++) {
            const square = document.createElement('div');
            square.className = 'progress-square';
            progressBar.appendChild(square);
        }
        progressSquares = document.querySelectorAll('.progress-square');
        
        problemsContainer.innerHTML = '';
        generatedProblems.forEach((p, index) => {
            const problemEl = document.createElement('div');
            problemEl.className = 'problem';
            const displayProblem = p.problem.replace(/x/g, ' x ');
            problemEl.innerHTML = `
                <span class="problem-text">${index + 1}. ${displayProblem}</span>
                <input type="text" inputmode="decimal" class="answer-input">
            `;
            problemsContainer.appendChild(problemEl);
        });
        startTimer(trainerSettings.totalTime);
    }

    function startTimer(duration) {
        if(timerInterval) clearInterval(timerInterval);
        const endTime = Date.now() + duration * 1000;
        
        const updateTimer = () => {
            const timeLeft = Math.round((endTime - Date.now()) / 1000);
            if (timeLeft < 0) {
                clearInterval(timerInterval);
                timerEl.textContent = "Время вышло!";
                checkAnswers();
                return;
            }
            const minutes = Math.floor(timeLeft / 60);
            let seconds = timeLeft % 60;
            seconds = seconds < 10 ? '0' + seconds : seconds;
            timerEl.textContent = `${minutes}:${seconds}`;
        };

        updateTimer();
        timerInterval = setInterval(updateTimer, 1000);
    }

    function checkAnswers() {
        if (timerInterval) clearInterval(timerInterval);
        checkBtn.disabled = true;
        const inputs = document.querySelectorAll('.answer-input');
        let correctCount = 0;
        inputs.forEach((input, index) => {
            const userValue = input.value.replace(',', '.');
            const userAnswer = parseFloat(userValue);
            const correctAnswer = generatedProblems[index].answer;
            
            generatedProblems[index].userAnswer = isNaN(userAnswer) ? '' : userAnswer;
            
            // Проверяем ответы: для строк (чч:мм) и для чисел
            let isCorrect = false;
            if (typeof correctAnswer === 'string') {
                isCorrect = userAnswer === correctAnswer || input.value.trim() === correctAnswer;
            } else if (!isNaN(userAnswer)) {
                isCorrect = Math.round(userAnswer * 100) === Math.round(correctAnswer * 100);
            }

            if (isCorrect) {
                progressSquares[index].classList.add('correct');
                correctCount++;
            } else {
                progressSquares[index].classList.add('incorrect');
            }
            input.disabled = true;
        });
        scoreTextEl.textContent = `Вы решили правильно ${correctCount} из ${generatedProblems.length} примеров.`;
        resultsEl.classList.remove('hidden');
        printBtn.classList.remove('hidden');
    }
    
    function printResults() {
        let printContent = `
            <style>
                body { font-family: Arial, sans-serif; }
                h1 { text-align: center; }
                .problem-item { margin-bottom: 20px; font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
                .correct { color: green; font-weight: bold; }
                .incorrect { color: red; font-weight: bold; }
            </style>
            <h1>${trainerSettings.title || 'Результаты'}</h1>
        `;
        generatedProblems.forEach((p, index) => {
            let isCorrect = false;
             if (typeof p.answer === 'string') {
                isCorrect = p.userAnswer === p.answer;
            } else if (!isNaN(p.userAnswer)) {
                isCorrect = Math.round(p.userAnswer * 100) === Math.round(p.answer * 100);
            }
            const displayProblem = p.problem.replace(/x/g, ' x ');
            printContent += `
                <div class="problem-item">
                    <p><b>Задание ${index + 1}:</b> ${displayProblem}</p>
                    <p><b>Ваш ответ:</b> <span class="${isCorrect ? 'correct' : 'incorrect'}">${p.userAnswer === '' ? 'нет ответа' : formatNumber(p.userAnswer)}</span></p>
                    ${!isCorrect ? `<p><b>Правильный ответ:</b> ${formatNumber(p.answer)}</p>` : ''}
                </div>
            `;
        });
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    }

    // --- Назначение событий ---
    checkBtn.addEventListener('click', checkAnswers);
    printBtn.addEventListener('click', printResults);
    
    // --- Запуск тренажёра ---
    init();
});
