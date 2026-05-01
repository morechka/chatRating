// ===== ЧЁРНЫЙ СПИСОК =====
function isBlacklisted(user) {
    try {
        const cookie = document.cookie.split('; ').find(row => row.startsWith('chatRating_blacklist='));
        if (cookie) {
            const list = JSON.parse(decodeURIComponent(cookie.split('=')[1]));
            return list.some(item => item.nick.toLowerCase() === user.toLowerCase());
        }
    } catch(e) {}
    return false;
}
// ==========================

ComfyJS.onChat = ( user, message, flags, self, extra ) => {
    if (isBlacklisted(user)) return;
    
    message = message.replace("  "," ").replace(/[\uD800-\uDFFF]/gi, []).trim()
    messageHandler(user, message)
}

if( !channel ) {
    alert("НЕ УКАЗАН ТВИЧ КАНАЛ (в ссылке добавить ?channel=КАНАЛ)")
} else {
    ComfyJS.Init(channel)
}
