// Реєстрація Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log('Service Worker зареєстровано'));
}

const btn = document.getElementById('med-btn');
const timerDisplay = document.getElementById('timer-display');
const countdownSpan = document.getElementById('countdown');
const notifyBtn = document.getElementById('notify-btn');

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

// --- ЛОГІКА ТАЙМЕРА ---
function updateTimer() {
    const lastTaken = localStorage.getItem('medLastTaken');
    
    if (lastTaken) {
        const now = new Date().getTime();
        const timeLeft = (parseInt(lastTaken) + TWENTY_FOUR_HOURS) - now;

        if (timeLeft > 0) {
            btn.classList.add('hidden');
            timerDisplay.classList.remove('hidden');

            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

            const h = hours.toString().padStart(2, '0');
            const m = minutes.toString().padStart(2, '0');
            const s = seconds.toString().padStart(2, '0');

            countdownSpan.textContent = `${h}:${m}:${s}`;
        } else {
            btn.classList.remove('hidden');
            timerDisplay.classList.add('hidden');
            localStorage.removeItem('medLastTaken');
        }
    } else {
        btn.classList.remove('hidden');
        timerDisplay.classList.add('hidden');
    }
}

btn.addEventListener('click', () => {
    const now = new Date().getTime();
    localStorage.setItem('medLastTaken', now.toString());
    updateTimer();
});

setInterval(updateTimer, 1000);
updateTimer();

// --- ЛОГІКА СПОВІЩЕНЬ ---

// Перевіряємо, чи вже надано дозвіл. Якщо так - ховаємо кнопку налаштування.
if (Notification.permission === 'granted') {
    notifyBtn.classList.add('hidden');
    startMorningCheck();
}

notifyBtn.addEventListener('click', () => {
    if (!("Notification" in window)) {
        alert("Ваш браузер не підтримує сповіщення.");
        return;
    }
    
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            notifyBtn.classList.add('hidden');
            alert('Сповіщення увімкнено! Ви отримаєте нагадування о 08:00 ранку.');
            startMorningCheck();
        } else {
            alert('Ви відхилили сповіщення.');
        }
    });
});

// Функція перевірки часу для ранкового сповіщення
function startMorningCheck() {
    setInterval(() => {
        const now = new Date();
        
        // Спрацює рівно о 08:00:00 ранку
        if (now.getHours() === 8 && now.getMinutes() === 0 && now.getSeconds() === 0) {
            
            // Перевіряємо, чи ми вже не випили ліки сьогодні
            const lastTaken = localStorage.getItem('medLastTaken');
            let shouldNotify = true;
            
            if (lastTaken) {
                const timeSinceLastTaken = now.getTime() - parseInt(lastTaken);
                // Якщо ліки випиті менше ніж 8 годин тому, не турбувати
                if (timeSinceLastTaken < 8 * 60 * 60 * 1000) {
                    shouldNotify = false;
                }
            }

            if (shouldNotify) {
                navigator.serviceWorker.ready.then(registration => {
                    registration.showNotification("💊 Ранкові ліки!", {
                        body: "Добрий ранок! Час випити ваші ліки.",
                        icon: "https://cdn-icons-png.flaticon.com/512/2382/2382461.png",
                        vibrate: [200, 100, 200, 100, 200],
                        badge: "https://cdn-icons-png.flaticon.com/512/2382/2382461.png"
                    });
                });
            }
        }
    }, 1000); // Перевіряємо кожну секунду
}
