let q = document.querySelector.bind(document);

let width = window.innerWidth;
let height = window.innerHeight;

const d = {
    maxlen: 200,
    minlen: 7,
};
let params = new URLSearchParams(window.location.search);
if (params.get('maxlen') && !isNaN(params.get('maxlen'))) d.maxlen = Number(params.get('maxlen'));
if (params.get('minlen') && !isNaN(params.get('minlen'))) d.minlen = Number(params.get('minlen'));
let channel = params.get("channel");
if(!channel) channel = "forsen";

let currentTimeout = null;
let counts = [];
const maxbars = 40;

let modes = ['', 'kys', 'kys', 'kys❤', ''];
if(params.get('modes')) modes = params.get('modes').split(',');
let modeIndex = params.get('mode') === 'only' ? false : 0;

let off = false;
let chat = [];
let rating = 0;
let lastX = d.minlen;

var page = new Audio();

let calcMode = (modeIndex !== false);

let canvas = q('#canvas');
let ctx = canvas.getContext('2d');

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}
window.addEventListener('resize', resize);
resize();

const r = (from, to) => Math.random() * (to - from) + from;
const ri = (from, to) => Math.floor(r(from, to + 1));

let player = new Audio();
player.volume = 1;
let pepegaSources = [
    'https://cdn.discordapp.com/emojis/986351812621607052.webp?size=96&quality=lossless'
];
let pepega = q('#pepega');

const colors = ['#fff', '#ff8b8b', '#ff8b8b', '#f7a6ff', '#fff'];

function getColorHeight(h) {
    if (h < d.minlen) return colors[0];
    let cr = d.maxlen - d.minlen;
    let pr = (h - d.minlen) / cr;
    if (pr < 1/3) return colors[1];
    if (pr < 2/3) return colors[2];
    return colors[3];
}

function messageHandler(user, message) {
    let onlyNums = message.replace(/[^0-9]/g, '');
    if (onlyNums.length === 0 && message.length <= 3) {
        onlyNums = message.replace(/[^0-9]/g, '').length;
    }
    if ((/[7-9]/g).test(onlyNums)) onlyNums = Number(onlyNums[0] + onlyNums[1]) || Number(onlyNums[0]) || 0;
    onlyNums = Number(onlyNums);
    if (onlyNums <= 10 && onlyNums > 0) {
        if (modeIndex !== false && rating + onlyNums > 10 && modes[modeIndex].indexOf('kys') != -1) {
            modeIndex = (modeIndex + 1) % modes.length;
        }
        rating += onlyNums;
        if (rating > 10) rating = 10;
        chat.push({user, message, rating});
        if (chat.length > 30) chat.shift();
        player.src = 'https://declider.github.io/onlyup/static/'+onlyNums+'.mp3';
        player.play();
        lastX = r(d.minlen, d.maxlen);
    }
}

ComfyJS.onChat = ( user, message, flags, self, extra ) => {
    message = message.replace("  "," ").replace(/[\uD800-\uDFFF]/gi, []).trim()
    messageHandler(user, message)
}

if( !channel ) {
    alert("НЕ УКАЗАН ТВИЧ КАНАЛ (в ссылке добавить ?channel=КАНАЛ)")
} else {
    ComfyJS.Init(channel)
}

function loop() {
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 '+Math.floor(height/10)+'px Nunito';
    let text = rating.toFixed(1).replace('.0', '');
    ctx.textAlign = 'right';
    ctx.fillText(text, width/2+width/15+width/6, height/2+height/35);
    ctx.textAlign = 'left';
    ctx.fillText('/10', width/2+width/15+width/6, height/2+height/35);

    let mode = modes[modeIndex];
    if(calcMode && mode) {
        let lastChars = text.slice(-1);
        let aM = 0;
        if(lastChars == mode.replace('❤', '').length && rating >= 10) aM = 1;
        else if(mode == '' && rating <= 0) aM = 1;
        else if(mode == 'kys') {
            aM = r(0, 5) < 0.3 ? 0 : 1;
        }
        let m = mode;
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = aM;
        ctx.font = '700 '+Math.floor(height/8)+'px Nunito';
        ctx.textAlign = 'right';
        ctx.fillText(m, width/2-height/80, height/2-height/10);
        ctx.globalAlpha = 1;
    }

    for (let i = counts.length - 1; i >= 0; i--) {
        let count = counts[i];
        ctx.fillStyle = getColorHeight(count.y);
        ctx.globalAlpha = count.opacity;
        ctx.beginPath();
        let possiblebar = maxbars-count.x/4.5;
        if (possiblebar < 10) count.opacity -= 0.03;
        ctx.arc(count.x+Math.sin(counts.length/3)*4.5, count.y+Math.sin(counts.length/3)*1.5, possiblebar, 0, 2*Math.PI);
        ctx.fill();
    }

    ctx.textAlign = 'right';
    for (let i = chat.length - 1; i >= 0; i--) {
        let ch = chat[i];
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.5-(chat.length-i)/40;
        let fontSize = Math.floor(height/50);
        ctx.font = '700 '+fontSize+'px Nunito';
        let y = height - (chat.length-i)*fontSize*1.2 - height/2.2;
        if (y > height) ctx.globalAlpha = 0;
        ctx.fillText(ch.user + ': ' + ch.rating, width/2+width/25, y);
    }
    ctx.globalAlpha = 1;

    let rand = r(d.minlen, d.maxlen);
    if (!currentTimeout || rating <= 0) {
        lastX -= lastX/5;
        if(Math.round(lastX) <= d.minlen+1) {
            currentTimeout = setTimeout(() => {
                rating = 0;
                chat = [];
            }, 3000);
            currentTimeout = null;
        }
    }
    window.requestAnimationFrame(loop);
}
window.requestAnimationFrame(loop);

function showModeInfo() { document.getElementById("mode-info").style.display = "block"; }
function hideModeInfo() { document.getElementById("mode-info").style.display = "none"; }

function start() {
    let hours = Number(document.getElementById("timer").value);
    if (!hours) hours = 0;
    let minutes = hours * 60 * 1000;
    let counter = document.getElementById("counter");
    let start = document.getElementById("start-button");
    let timer = document.getElementById("timer");
    start.disabled = true;
    timer.disabled = true;
    let interval = setInterval(function() {
        minutes -= 1000;
        if (minutes <= 0) {
            clearInterval(interval);
            start.disabled = false;
            timer.disabled = false;
            timer.value = 0;
            alert("Время вышло!");
        }
    }, 1000);
    
    let interval2 = setInterval(function() {
        let timePlus = 60000/(hours*60);
        timer.value = Math.round(minutes/60000);
    }, 100);
}

document.getElementById("start-button").addEventListener("click", start);

ComfyJS.onConnected = () => {
    document.getElementById("start-button").disabled = false;
}
