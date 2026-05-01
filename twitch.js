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

// Ждём, пока script.js загрузится и создаст свои функции
window.addEventListener('load', function() {
    
    // ===== ПЕРЕХВАТЫВАЕМ ComfyJS.onChat ДЛЯ ЧЁРНОГО СПИСКА =====
    // Сохраняем оригинальный onChat, если он уже задан в script.js
    const originalOnChat = ComfyJS.onChat;
    
    ComfyJS.onChat = function(user, message, flags, self, extra) {
        // Проверка чёрного списка
        if (getBlacklistedNicks().includes(user.toLowerCase())) {
            console.log(`[Blacklist] Игнорируем сообщение от ${user}`);
            return;
        }
        // Вызываем оригинальный обработчик из script.js
        if (typeof originalOnChat === 'function') {
            originalOnChat(user, message, flags, self, extra);
        }
    };
    // ========================================================

    // ===== ТАЙМЕР В СЕКУНДАХ =====
    let timerIntervalSec = null;
    let remainingSeconds = 0;

    // Добавляем обработчик на кнопку СТАРТ
    const startButton = document.getElementById('start-button');
    const timerSecInput = document.getElementById('timerSec');
    
    if (startButton && timerSecInput) {
        // Сохраняем оригинальный onclick
        const originalClick = startButton.onclick;
        
        startButton.onclick = function(event) {
            const secValue = parseInt(timerSecInput.value);
            
            // Если введены секунды — запускаем секундный таймер
            if (!isNaN(secValue) && secValue > 0) {
                if (timerIntervalSec) clearInterval(timerIntervalSec);
                
                remainingSeconds = secValue;
                timerSecInput.value = remainingSeconds;
                startButton.disabled = true;
                document.getElementById('timer').disabled = true;
                timerSecInput.disabled = true;
                
                timerIntervalSec = setInterval(function() {
                    remainingSeconds--;
                    timerSecInput.value = remainingSeconds;
                    
                    if (remainingSeconds <= 0) {
                        clearInterval(timerIntervalSec);
                        timerIntervalSec = null;
                        startButton.disabled = false;
                        document.getElementById('timer').disabled = false;
                        timerSecInput.disabled = false;
                        timerSecInput.value = '0';
                        alert('Время вышло!');
                    }
                }, 1000);
            }
            
            // Вызываем оригинальный обработчик (для минутного таймера)
            if (typeof originalClick === 'function') {
                originalClick.call(startButton, event);
            }
        };
    }
    // ============================

    console.log('[chatRating] Чёрный список и таймер секунд активированы');
});
