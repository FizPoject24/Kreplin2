let timerInterval;
let questionIndex = 0;
let correctCount = 0;
let incorrectCount = 0;
const questions = [];
const history = JSON.parse(localStorage.getItem('quizHistory')) || [];

// Generate 50 questions
for (let i = 0; i < 50; i++) {
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    questions.push({
        num1: num1,
        num2: num2,
        correctAnswer: num1 + num2
    });
}

function showTimeSelect() {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('time-select').style.display = 'block';
}

function startQuiz(timeLimit) {
    questionIndex = 0;
    correctCount = 0;
    incorrectCount = 0;

    document.getElementById('time-select').style.display = 'none';
    document.getElementById('quiz-title').style.display = 'none';
    document.getElementById('timer').innerText = `Time left: ${timeLimit} Detik`;
    document.getElementById('timer').style.display = 'block';
    document.getElementById('question').style.display = 'block';
    document.getElementById('options').style.display = 'block';

    timerInterval = setInterval(() => {
        timeLimit--;
        document.getElementById('timer').innerText = `Waktu: ${timeLimit} Detik`;

        if (timeLimit <= 0) {
            clearInterval(timerInterval); // Stop the timer
            endQuiz(); // End the quiz when time runs out
        }
    }, 1000);

    displayQuestion();
}

function displayQuestion() {
    if (questionIndex >= questions.length) {
        endQuiz();
        return;
    }

    const currentQuestion = questions[questionIndex];
    document.getElementById('question').innerText = `Berapa ${currentQuestion.num1} + ${currentQuestion.num2}?`;
    const options = document.getElementById('options');
    options.innerHTML = '';

    const answers = [
        currentQuestion.correctAnswer,
        currentQuestion.correctAnswer + 1,
        currentQuestion.correctAnswer - 1,
        currentQuestion.correctAnswer + 2
    ].sort(() => Math.random() - 0.5);

    answers.forEach(answer => {
        const button = document.createElement('button');
        button.innerText = answer;
        button.onclick = () => checkAnswer(answer);
        options.appendChild(button);
    });
}

function checkAnswer(selectedAnswer) {
    const currentQuestion = questions[questionIndex];

    if (selectedAnswer === currentQuestion.correctAnswer) {
        correctCount++;
    } else {
        incorrectCount++;
    }

    questionIndex++;
    displayQuestion();
}

function endQuiz() {
    clearInterval(timerInterval);

    const result = {
        date: new Date().toLocaleString(),
        score: `${correctCount} Correct, ${incorrectCount} Incorrect`,
        correct: correctCount,
        incorrect: incorrectCount
    };

    // Ensure the history array does not exceed 10 entries
    if (history.length >= 10) {
        history.shift(); // Remove the oldest entry
    }

    history.push(result); // Add the new quiz result
    localStorage.setItem('quizHistory', JSON.stringify(history)); // Save updated history to local storage
    updateHistory();

    const container = document.querySelector('.container');
    container.innerHTML = `<h1>Quiz Complete!</h1>
        <p>You answered ${correctCount} correctly and ${incorrectCount} incorrectly.</p>
        <button onclick="location.reload()">Back to Menu</button>`;
}

function updateHistory() {
    const historyContent = document.getElementById('history-content');
    historyContent.innerHTML = '';

    if (history.length === 0) {
        const row = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.colSpan = 2;
        emptyCell.innerText = 'No history available';
        row.appendChild(emptyCell);
        historyContent.appendChild(row);
    } else {
        history.forEach(entry => {
            const row = document.createElement('tr');
            const dateCell = document.createElement('td');
            const scoreCell = document.createElement('td');
            dateCell.innerText = entry.date;
            scoreCell.innerText = entry.score;
            row.appendChild(dateCell);
            row.appendChild(scoreCell);
            historyContent.appendChild(row);
        });
    }

    // Generate the chart
    generateHistoryChart();
}

function generateHistoryChart() {
    const chartContainer = document.getElementById('history-chart');
    const ctx = chartContainer.getContext('2d');

    // Destroy existing chart if it exists
    if (chartContainer.chartInstance) {
        chartContainer.chartInstance.destroy();
    }

    const labels = history.map(entry => entry.date);
    const correctData = history.map(entry => entry.correct);
    const incorrectData = history.map(entry => entry.incorrect);

    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Correct Answers',
                    data: correctData,
                    backgroundColor: 'rgba(76, 175, 80, 0.7)',
                    borderColor: 'rgba(76, 175, 80, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Incorrect Answers',
                    data: incorrectData,
                    backgroundColor: 'rgba(244, 67, 54, 0.7)',
                    borderColor: 'rgba(244, 67, 54, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Store chart instance for later use
    chartContainer.chartInstance = chart;
}

function showHistory() {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('time-select').style.display = 'none';
    document.getElementById('history').style.display = 'block';
    updateHistory();
}

function returnToMenu() {
    document.getElementById('history').style.display = 'none';
    document.getElementById('main-menu').style.display = 'block';
}

function deleteHistory() {
    // Remove the history from local storage permanently
    localStorage.removeItem('quizHistory');

    // Clear the history array
    history.length = 0;

    // Clear the history table immediately
    const historyContent = document.getElementById('history-content');
    historyContent.innerHTML = '';  // Remove all rows from the table

    // Add a message indicating that the history has been deleted
    const row = document.createElement('tr');
    const emptyCell = document.createElement('td');
    emptyCell.colSpan = 2;
    emptyCell.innerText = 'No history available';
    row.appendChild(emptyCell);
    historyContent.appendChild(row);

    // Also remove the chart
    const chartContainer = document.getElementById('history-chart');
    if (chartContainer.chartInstance) {
        chartContainer.chartInstance.destroy(); // Destroy the chart instance
        chartContainer.chartInstance = null; // Reset the chart instance
    }
}  
