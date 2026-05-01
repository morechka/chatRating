// ===== ЧЁРНЫЙ СПИСОК =====
const BLACKLIST_STORAGE_KEY = 'chatRating_blacklist';

function getBlacklistedNicks() {
    try {
        const raw = localStorage.getItem(BLACKLIST_STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw).map(item => item.nick.toLowerCase());
    } catch(e) {
        return [];
    }
}
// =========================

// Ждём полной загрузки script.js
window.addEventListener('load', function() {

    // Перехватываем сообщения чата для фильтрации чёрного списка
    ComfyJS.onChat = (function(originalOnChat) {
        return function(user, message, flags, self, extra) {
            if (getBlacklistedNicks().includes(user.toLowerCase())) {
                return;
            }
            // Вызываем оригинальный обработчик из script.js
            if (typeof originalOnChat === 'function') {
                originalOnChat.call(this, user, message, flags, self, extra);
            }
        };
    })(ComfyJS.onChat);

    // ===== ТАЙМЕР В СЕКУНДАХ =====
    const startButton = document.getElementById('start-button');
    const timerSecInput = document.getElementById('timerSec');
    let timerIntervalSec = null;

    if (startButton && timerSecInput) {
        startButton.addEventListener('click', function(e) {
            const secValue = parseInt(timerSecInput.value);
            if (isNaN(secValue) || secValue <= 0) return; // нет секунд — работает только минуты

            // Блокируем кнопку сразу (оригинальный script.js тоже заблокирует)
            let remaining = secValue;
            timerSecInput.value = remaining;
            timerSecInput.disabled = true;

            if (timerIntervalSec) clearInterval(timerIntervalSec);
            timerIntervalSec = setInterval(function() {
                remaining--;
                timerSecInput.value = remaining;
                if (remaining <= 0) {
                    clearInterval(timerIntervalSec);
                    timerIntervalSec = null;
                    timerSecInput.disabled = false;
                    timerSecInput.value = '0';
                    startButton.disabled = false;
                    document.getElementById('timer').disabled = false;
                    alert('Время вышло!');
                }
            }, 1000);
        });
    }
    // ============================
});
