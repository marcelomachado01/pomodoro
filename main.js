let timerDisplay = document.getElementById('timer');
let startButton = document.getElementById('start');
let pauseButton = document.getElementById('pause');
let resetButton = document.getElementById('reset');
let customFocusInput = document.getElementById('customFocus');
let customBreakInput = document.getElementById('customBreak');
let applyTimeButton = document.getElementById('applyTime');
let cycleTypeDisplay = document.getElementById('cycleType');
let alarmSound = document.getElementById('alarm-sound');
let themeSelector = document.getElementById('themeSelector');

let focusTime = parseInt(localStorage.getItem('focusTime')) || 25;
let breakTime = parseInt(localStorage.getItem('breakTime')) || 5;
let timeLeft = parseInt(localStorage.getItem('pomodoroTime')) || focusTime * 60;
let currentMode = localStorage.getItem('pomodoroMode') || 'focus';
let cyclesCompleted = JSON.parse(localStorage.getItem('cycles')) || {};

let timer = null;

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    cycleTypeDisplay.textContent = 'Modo: ' + (currentMode === 'focus' ? 'Foco' : 'Pausa');
}

function saveProgress() {
    localStorage.setItem('pomodoroTime', timeLeft);
    localStorage.setItem('pomodoroMode', currentMode);
}

function startTimer() {
    if (timer) return;
    timer = setInterval(() => {
        if (timeLeft > 0) {
        timeLeft--;
        updateDisplay();
        saveProgress();
        } else {
        alarmSound.play();
        clearInterval(timer);
        timer = null;
        if (currentMode === 'focus') {
            logCycle();
            currentMode = 'break';
            timeLeft = breakTime * 60;
        } else {
            currentMode = 'focus';
            timeLeft = focusTime * 60;
        }
        updateDisplay();
        saveProgress();
        startTimer();
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timer);
    timer = null;
}

function resetTimer() {
    pauseTimer();
    timeLeft = (currentMode === 'focus' ? focusTime : breakTime) * 60;
    updateDisplay();
    saveProgress();
    }

    function applyCustomTime() {
    const focus = parseInt(customFocusInput.value);
    const brk = parseInt(customBreakInput.value);
    if (!isNaN(focus) && focus > 0) {
        focusTime = focus;
        localStorage.setItem('focusTime', focusTime);
    }
    if (!isNaN(brk) && brk > 0) {
        breakTime = brk;
        localStorage.setItem('breakTime', breakTime);
    }
    resetTimer();
}

function applyTheme(themeName) {
    document.body.className = themeName;
    localStorage.setItem('theme', themeName);
    themeSelector.value = themeName;
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'tema-claro';
    applyTheme(savedTheme);
}

themeSelector.addEventListener('change', (e) => {
    applyTheme(e.target.value);
});

function logCycle() {
    const today = new Date().toLocaleDateString();
    cyclesCompleted[today] = (cyclesCompleted[today] || 0) + 1;
    localStorage.setItem('cycles', JSON.stringify(cyclesCompleted));
    updateChart();
}

function updateChart() {
    const ctx = document.getElementById('productivityChart').getContext('2d');
    const labels = Object.keys(cyclesCompleted);
    const data = Object.values(cyclesCompleted);
    if (window.chart) window.chart.destroy();
    window.chart = new Chart(ctx, {
        type: 'bar',
        data: {
        labels,
        datasets: [{
            label: 'Ciclos Completos',
            data,
            backgroundColor: '#ff5e57',
        }]
        },
        options: {
        scales: {
            y: {
            beginAtZero: true,
            precision: 0
            }
        }
        }
    });
}

startButton.addEventListener('click', startTimer);
pauseButton.addEventListener('click', pauseTimer);
resetButton.addEventListener('click', resetTimer);
applyTimeButton.addEventListener('click', applyCustomTime);

loadTheme();
updateDisplay();
updateChart();
