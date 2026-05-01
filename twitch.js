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

// Ждём полной загрузки страницы и script.js
window.addEventListener('load', function() {
    console.log('[chatRating] Инициализация расширений...');

    // === ИСПРАВЛЯЕМ "НЕ УКАЗАН КАНАЛ" ===
    // script.js должен сам обновить #channel, но на всякий случай форсируем
    setTimeout(function() {
        var params = new URLSearchParams(window.location.search);
        var channel = params.get('channel');
        var channelDiv = document.getElementById('channel');
        if (channel && channelDiv) {
            channelDiv.innerHTML = 'Канал: ' + channel;
        }
    }, 500);

    // === ПЕРЕХВАТ COMFYJS ДЛЯ ЧЁРНОГО СПИСКА ===
    if (typeof ComfyJS !== 'undefined') {
        // Ждём, пока script.js инициализирует ComfyJS
        var checkInterval = setInterval(function() {
            if (ComfyJS.onChat) {
                clearInterval(checkInterval);
                var originalOnChat = ComfyJS.onChat;
                ComfyJS.onChat = function(user, message, flags, self, extra) {
                    if (getBlacklistedNicks().includes(user.toLowerCase())) {
                        console.log('[Blacklist] Пропущено:', user);
                        return;
                    }
                    originalOnChat.call(this, user, message, flags, self, extra);
                };
                console.log('[chatRating] Чёрный список активирован');
            }
        }, 100);
    }

    // === ТАЙМЕР В СЕКУНДАХ ===
    var startBtn = document.getElementById('start-button');
    var timerSecInput = document.getElementById('timerSec');
    var timerMinInput = document.getElementById('timer');
    var timerIntervalSec = null;

    if (startBtn) {
        // Переопределяем window.start
        var originalStart = window.start;
        window.start = function() {
            var secVal = parseInt(timerSecInput.value) || 0;
            
            if (secVal > 0) {
                if (timerIntervalSec) clearInterval(timerIntervalSec);
                
                var remaining = secVal;
                timerSecInput.value = remaining;
                if (timerMinInput) timerMinInput.disabled = true;
                timerSecInput.disabled = true;
                startBtn.disabled = true;

                timerIntervalSec = setInterval(function() {
                    remaining--;
                    timerSecInput.value = remaining;
                    if (remaining <= 0) {
                        clearInterval(timerIntervalSec);
                        timerIntervalSec = null;
                        if (timerMinInput) timerMinInput.disabled = false;
                        timerSecInput.disabled = false;
                        startBtn.disabled = false;
                        timerSecInput.value = '0';
                        alert('Время вышло!');
                    }
                }, 1000);
            }
            
            // Вызываем оригинальный start()
            if (typeof originalStart === 'function') {
                originalStart();
            }
        };
        console.log('[chatRating] Таймер секунд привязан к кнопке СТАРТ');
    }

    // === РАЗБЛОКИРУЕМ КНОПКУ СТАРТ ПРИ ПОДКЛЮЧЕНИИ ===
    // На случай, если script.js не разблокировал
    if (typeof ComfyJS !== 'undefined') {
        ComfyJS.onConnected = (function(original) {
            return function() {
                if (original) original.call(this);
                var btn = document.getElementById('start-button');
                if (btn) btn.disabled = false;
                console.log('[chatRating] Подключено к чату, кнопка СТАРТ разблокирована');
            };
        })(ComfyJS.onConnected);
    }

    console.log('[chatRating] Все модули загружены');
});
