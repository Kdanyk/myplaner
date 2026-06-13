// Реєстрація Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(() => console.log('SW зареєстровано'));
}

// Глобальні змінні для роботи з даними
let tasks = JSON.parse(localStorage.getItem('myTasks')) || [];
const container = document.getElementById('tasks-container');

// Елементи модалки
const modal = document.getElementById('task-modal');
const openModalBtn = document.getElementById('open-modal-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const saveTaskBtn = document.getElementById('save-task-btn');
const typeSelect = document.getElementById('task-type');

// Відкрити / Закрити модалку
openModalBtn.addEventListener('click', () => modal.classList.remove('hidden'));
closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));

// Перемикання полів форми (Таймер чи Текст)
window.toggleFormFields = function() {
    if (typeSelect.value === 'timer') {
        document.getElementById('timer-settings').classList.remove('hidden');
        document.getElementById('text-settings').classList.add('hidden');
    } else {
        document.getElementById('timer-settings').classList.add('hidden');
        document.getElementById('text-settings').classList.remove('hidden');
    }
}

// Збереження нового завдання
saveTaskBtn.addEventListener('click', () => {
    const title = document.getElementById('task-title').value;
    const type = typeSelect.value;
    
    if (!title) { alert('Введіть назву завдання!'); return; }

    const newTask = {
        id: Date.now().toString(), // Унікальний ID
        title: title,
        type: type,
        lastTaken: null
    };

    if (type === 'timer') {
        newTask.frequency = document.getElementById('task-frequency').value;
        newTask.interval = document.getElementById('task-interval').value;
    } else {
        newTask.text = document.getElementById('task-text').value;
    }

    tasks.push(newTask);
    localStorage.setItem('myTasks', JSON.stringify(tasks));
    
    modal.classList.add('hidden');
    document.getElementById('task-title').value = ''; // очистка
    document.getElementById('task-text').value = '';
    
    renderTasks();
});

// Функція видалення завдання
window.deleteTask = function(id) {
    if(confirm('Ви впевнені, що хочете видалити це завдання?')) {
        tasks = tasks.filter(t => t.id !== id);
        localStorage.setItem('myTasks', JSON.stringify(tasks));
        renderTasks();
    }
}

// Функція натискання "Виконано"
window.doTask = function(id) {
    const taskIndex = tasks.findIndex(t => t.id === id);
    if(taskIndex > -1) {
        tasks[taskIndex].lastTaken = new Date().getTime();
        localStorage.setItem('myTasks', JSON.stringify(tasks));
        renderTasks();
    }
}

// Відображення завдань на екрані
function renderTasks() {
    container.innerHTML = ''; // Очищаємо контейнер
    
    tasks.forEach(task => {
        const card = document.createElement('div');
        card.className = 'task-card';

        let content = '';
        
        // Шапка завдання
        content += `
            <div class="task-header">
                <h2>📌 ${task.title}</h2>
                ${task.type === 'timer' ? `<span class="badge">${task.frequency} раз(и) на день</span>` : `<span class="badge" style="background:#e2e8f0; color:#4a5568;">Нотатка</span>`}
            </div>
        `;

        if (task.type === 'text') {
            content += `<p class="description">${task.text}</p>`;
        } 
        else if (task.type === 'timer') {
            const intervalMs = task.interval * 60 * 60 * 1000;
            const now = new Date().getTime();
            let timeLeft = 0;

            if (task.lastTaken) {
                timeLeft = (task.lastTaken + intervalMs) - now;
            }

            if (timeLeft > 0) {
                // Показуємо таймер
                content += `
                    <div class="timer-box">
                        <p>Наступний раз через:</p>
                        <div class="time" id="time-${task.id}">--:--:--</div>
                    </div>
                `;
            } else {
                // Показуємо кнопку
                content += `<button class="action-btn" onclick="doTask('${task.id}')">Я виконав(ла) це</button>`;
            }
            content += `<p class="description">Інтервал: кожні ${task.interval} год.</p>`;
        }

        content += `<button class="delete-btn" onclick="deleteTask('${task.id}')">Видалити завдання</button>`;
        
        card.innerHTML = content;
        container.appendChild(card);
    });
}

// Функція оновлення всіх таймерів щосекунди
setInterval(() => {
    const now = new Date().getTime();
    tasks.forEach(task => {
        if (task.type === 'timer' && task.lastTaken) {
            const intervalMs = task.interval * 60 * 60 * 1000;
            const timeLeft = (task.lastTaken + intervalMs) - now;
            const timeEl = document.getElementById(`time-${task.id}`);
            
            if (timeLeft > 0 && timeEl) {
                const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

                const h = hours.toString().padStart(2, '0');
                const m = minutes.toString().padStart(2, '0');
                const s = seconds.toString().padStart(2, '0');

                timeEl.textContent = `${h}:${m}:${s}`;
            } else if (timeLeft <= 0 && timeEl) {
                // Час вийшов - перемальовуємо, щоб з'явилась кнопка
                renderTasks(); 
            }
        }
    });
}, 1000);

// Перший запуск
renderTasks();
