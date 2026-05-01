// ===== ЧЁРНЫЙ СПИСОК =====
const BLACKLIST_STORAGE_KEY = 'chatRating_blacklist';
function getBlacklistedNicks() {
    try {
        const raw = localStorage.getItem(BLACKLIST_STORAGE_KEY);
        return raw ? JSON.parse(raw).map(item => item.nick.toLowerCase()) : [];
    } catch(e) { return []; }
}

// Перехватываем onChat, когда script.js его создаст
const observer = setInterval(() => {
    if (typeof ComfyJS !== 'undefined' && ComfyJS.onChat) {
        clearInterval(observer);
        const original = ComfyJS.onChat;
        ComfyJS.onChat = function(user, message, flags, self, extra) {
            if (getBlacklistedNicks().includes(user.toLowerCase())) return;
            original.call(this, user, message, flags, self, extra);
        };
    }
}, 100);
// =========================

// ===== ТАЙМЕР В СЕКУНДАХ (по кнопке СТАРТ) =====
let secInterval = null;

function startSecTimer() {
    const input = document.getElementById('timerSec');
    const startBtn = document.getElementById('start-button');
    const minInput = document.getElementById('timer');
    const sec = parseInt(input.value) || 0;
    if (sec <= 0) return;

    if (secInterval) clearInterval(secInterval);
    let remaining = sec;
    input.value = remaining;
    input.disabled = true;
    if (minInput) minInput.disabled = true;
    if (startBtn) startBtn.disabled = true;

    secInterval = setInterval(() => {
        remaining--;
        input.value = remaining;
        if (remaining <= 0) {
            clearInterval(secInterval);
            secInterval = null;
            input.disabled = false;
            if (minInput) minInput.disabled = false;
            if (startBtn) startBtn.disabled = false;
            input.value = '0';
            alert('Время вышло!');
        }
    }, 1000);
}

// Обёртка над start(), чтобы не сломать оригинал
const origStart = window.start;
window.start = function() {
    const secVal = parseInt(document.getElementById('timerSec').value) || 0;
    if (secVal > 0) startSecTimer();
    if (typeof origStart === 'function') origStart();
};
// =========================
