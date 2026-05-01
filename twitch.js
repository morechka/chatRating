ComfyJS.onChat = ( user, message, flags, self, extra ) => {
    message = message.replace("  "," ").replace(/[\uD800-\uDFFF]/gi, []).trim()
    messageHandler(user, message)
}

if( !channel ) {
    alert("НЕ УКАЗАН ТВИЧ КАНАЛ (в ссылке добавить ?channel=КАНАЛ)")
} else {
    ComfyJS.Init(channel)
}
