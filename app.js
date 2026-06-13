// Реєстрація Service Worker для PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log('Service Worker зареєстровано'));
}

const btn = document.getElementById('med-btn');
const timerDisplay = document.getElementById('timer-display');
const countdownSpan = document.getElementById('countdown');

// 24 години у мілісекундах
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

function updateTimer() {
    const lastTaken = localStorage.getItem('medLastTaken');
    
    if (lastTaken) {
        const now = new Date().getTime();
        const timeLeft = (parseInt(lastTaken) + TWENTY_FOUR_HOURS) - now;

        if (timeLeft > 0) {
            // Ховаємо кнопку, показуємо таймер
            btn.classList.add('hidden');
            timerDisplay.classList.remove('hidden');

            // Рахуємо години, хвилини та секунди
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

            // Додаємо нулі спереду, якщо число менше 10 (напр. 09:05:02)
            const h = hours.toString().padStart(2, '0');
            const m = minutes.toString().padStart(2, '0');
            const s = seconds.toString().padStart(2, '0');

            countdownSpan.textContent = `${h}:${m}:${s}`;
        } else {
            // Час вийшов - показуємо кнопку знову
            btn.classList.remove('hidden');
            timerDisplay.classList.add('hidden');
            localStorage.removeItem('medLastTaken');
        }
    } else {
        // Якщо ще не приймали - показуємо кнопку
        btn.classList.remove('hidden');
        timerDisplay.classList.add('hidden');
    }
}

// Подія натискання на кнопку
btn.addEventListener('click', () => {
    const now = new Date().getTime();
    localStorage.setItem('medLastTaken', now.toString());
    updateTimer();
});

// Оновлюємо таймер щосекунди
setInterval(updateTimer, 1000);
updateTimer(); // Запускаємо одразу при завантаженні