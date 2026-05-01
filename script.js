const channelEl = document.getElementById("channel")
const timerEl = document.getElementById("timer")
const counterEl = document.getElementById("counter")
const scoreEl = document.getElementById("score")
const infoEl = document.getElementById("score")
const infoTextEl = document.getElementById("info-text")
const mainEl = document.getElementById("main")
const btnEl = document.getElementById("start-button")
const modeInfo = document.getElementById("mode-info")
const modeEl = document.getElementById("mode")

let timer = null
let started = false
let timerValue = 0
let users = []
let score = 0.0

let mode

const params = (new URL(document.location)).searchParams
const channel = params.get("channel") || null


if ( channel ) {
    channelEl.parentNode.removeChild(channelEl)
    btnEl.disabled = false
}


function start() {
    
    document.querySelector("#obs-widget") && (document.querySelector("#obs-widget").style.display = "none")
    
    if(started) {
        stop()
        return
    }

    modeEl.disabled = true
    timerEl.disabled = true
    mainEl.style.visibility = "visible"
    btnEl.innerText = "СТОП"
    btnEl.style.backgroundColor = "rgb(129, 93, 93)" // хотел без этого в коде, но так лень

    mode = modeEl.value

    timerValue = timerEl.valueAsNumber * 60 || 0

    infoTextEl.innerHTML = "Голосование в чате!<br>Напишите оценку от 1 до 10<br>"
    started = true

    if(timerValue > 0) {
        timer = setInterval(onTimer, 1000)
        timerToTime()
    }
    
}


function messageHandler(user, message) {
    if(!started) {
        return
    }

    if(users.includes(user)) {
        return
    }


    let answer
    if(mode=="only") {
        answer = message.trim().replace(",",".")
    } else if (mode=="first") {
        answer = message.split(" ")[0].trim().replace(",",".")
    }
    
    if(isNaN(answer)) {
        return
    }

    
    

    answer = parseFloat(answer)

    if (answer < 1 || answer > 10) {
        return
    }

    let color
    switch (Math.round(answer)) {
        case 1:
            color = "#f80000"; break
        case 2:
            color = "#fa3900"; break
        case 3:
            color = "#fb7100"; break
        case 4:
            color = "#fcaa00"; break
        case 5:
            color = "#fde300"; break
        case 6:
            color = "#e2ff06"; break
        case 7:
            color = "#aaff12"; break
        case 8:
            color = "#71ff1e"; break
        case 9:
            color = "#39ff2b"; break
        case 10:
            color = "#00ff37"; break
        default:
            color = "white"
    }

    score += answer
    users.push(user)
    counterEl.innerText = users.length
    showNewScore(user, answer, color)
}


function stop() {
    try { clearInterval(timer) } catch {}

    btnEl.innerText = "СТАРТ"
    btnEl.style.backgroundColor = "rgb(93, 129, 93)"
    infoTextEl.innerHTML = "Голосование окончено!<br><br>"
    btnEl.disabled = true 
    // Да, нужно F5 чтобы запустить голосование заново
    // МНе лень писать пару строчек чтобы сбрасывать таймеры, списки, текста в html и чёт там ещё

    if(users.length > 0) {
        let result = (score/users.length).toFixed(2)
        let text = `Итог: ${result}`
        scoreEl.innerText = text
    } else {
        scoreEl.innerText = "Никто не проголосовал :("
    }

    started = false

}


function onTimer() {
    timerValue -= 1

    if(timerValue > 0) {
        timerToTime()
    } else {
        stop()
    }
    
}


function timerToTime() {
    let minutes = Math.floor(timerValue / 60)
    let seconds = timerValue % 60

    minutes = minutes.toString().padStart(2, "0")
    seconds = seconds.toString().padStart(2, "0")

    let text = `${minutes}:${seconds}`
    scoreEl.innerText = text
}


function showModeInfo() {
    modeInfo.style.display = "block"
}


function hideModeInfo() {
    modeInfo.style.display = "none"
}


function showNewScore(user, answer, color) {
    let el = document.createElement("div")
    el.className = "new-score"
    el.innerText = `${user} - ${answer}`

    let y = Math.floor(Math.random() * (window.innerHeight / 3 * 2)) + 100
    let x = Math.floor(Math.random() * (window.innerWidth  / 3 * 2)) + 80
    
    el.style.top  = `${y}px`
    el.style.left = `${x}px`
    el.style.color = color

    
    document.body.appendChild(el)

    setTimeout(() => {
        document.body.removeChild(el)
    }, 1000)
}
