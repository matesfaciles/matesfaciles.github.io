/* =====================================================================
   comandos.js — Sistema de comandos para el Chat Oficial de Cocacolalandia 27
   ---------------------------------------------------------------------
   Módulo independiente (ES module). NO toca el HTML principal: todo el
   DOM, CSS y listeners se inyectan desde aquí.

   INTEGRACIÓN (3 líneas en el <script type="module"> del chat):

   1) Arriba, junto a los demás imports:
        import { initCommands } from "/comandos.js";

   2) Justo después del bloque `let userData = { ... };`:
        const commands = initCommands({ db, auth, getUser: () => userData, deviceId: myDeviceId });

   3) En el onValue de mensajes, sustituye `cachedMsgs = arr;` por:
        cachedMsgs = commands.processMessages(arr);
   ===================================================================== */

import {
    ref, set, push, get, update, remove, onValue, off, runTransaction,
    serverTimestamp, query, orderByChild, equalTo
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

/* =====================================================================
   CONSTANTES Y METADATOS — COCACOLALANDIA 27
   ===================================================================== */
const DEVICE_RE = /^[A-Za-z0-9_-]{16,256}$/; // compatible con todas las versiones de generador de deviceId
const FLASHBANG_COOLDOWN = 5 * 60 * 1000;
const START_COINS = 100;
const STALE_EVENT_MS = 15000;

export const COMMAND_LIST = [
    { name: 'help', desc: 'Lista de todos los comandos' },
    { name: 'comandos', desc: 'Alias de /help' },
    { name: 'flashbang', desc: 'Ciega la pantalla de TODOS 3s · cooldown 5 min' },
    { name: 'sismo', desc: 'Terremoto en todas las pantallas (2s)' },
    { name: 'confeti', desc: 'Lluvia de confeti neón para todos' },
    { name: 'ciberpanik', desc: 'Alerta roja de hackeo para todos' },
    { name: 'glitch', desc: 'Distorsión RGB gamer en todas las pantallas (2.5s)' },
    { name: 'aplaudir', desc: '👏 lluvia de palmas para todos' },
    { name: 'matemathica', desc: 'Ecuaciones flotando por la pantalla (3s)' },
    { name: 'matrix', desc: 'Lluvia de código verde (solo tú, 4s)' },
    { name: 'invertir', desc: 'Invierte los colores de tu UI (alterna)' },
    { name: 'ruleta', desc: 'Ruleta rusa: 1/6 de quedar muteado 1 min' },
    { name: '8ball', args: '[pregunta]', desc: 'La bola mágica responde' },
    { name: 'suerte', desc: 'Tu fortuna de hoy (1-100)' },
    { name: 'bateria', desc: 'Tu ciber-energía actual' },
    { name: 'moneda', desc: 'Cara o cruz a cara descubierta' },
    { name: 'dado', args: '[n]', desc: 'Tira uno o varios dados (ej: /dado 3)' },
    { name: 'rand', args: '[min] [max]', desc: 'Número aleatorio entre dos valores' },
    { name: 'polla', args: '[longitud]', desc: 'La clásica polla, versión cyber-neón' },
    { name: 'nave', desc: 'Tu nave espacial generada proceduralmente 🚀' },
    { name: 'baraja', args: '[n]', desc: 'Cartas de la baraja francesa (ej: /baraja 3)' },
    { name: 'flip', args: '[texto]', desc: 'Texto invertido y espejado Ɐ' },
    { name: 'repetir', args: '[n] [texto]', desc: 'Repite un texto n veces (máx. 10)' },
    { name: 'eco', args: '[texto]', desc: 'Repite tu mensaje como un bot' },
    { name: 'clap', args: '[texto]', desc: 'Separa cada palabra 👏 con 👏 palmas 👏' },
    { name: 'calcula', args: '[expresión]', desc: 'Calcula en el chat: /calcula sqrt(144)+2^3' },
    { name: 'derivada', args: '[número]', desc: '¿Divertido? Deriva un número en público 😏' },
    { name: 'ship', args: '[nombre1] [nombre2]', desc: 'Compatibilidad entre dos personas' },
    { name: 'hackear', args: '[nombre]', desc: 'Hackea el mainframe de un amigo' },
    { name: 'amor', args: '[nombre]', desc: 'Tu compatibilidad romántica con alguien' },
    { name: 'abrazar', args: '[nombre]', desc: 'Manda un ciber-abrazo' },
    { name: 'coca', desc: 'Abre una Coca-Cola bien fría' },
    { name: 'refresco', desc: 'Abre un refresco bien fresquito' },
    { name: 'cartera', desc: 'Tu saldo de CocaCoins' },
    { name: 'robar', args: '[usuario]', desc: '50% robas CocaCoins · 50% ciber-cárcel 30s' },
    { name: 'robos', args: '[usuario]', desc: 'Alias de /robar' },
    { name: 'transferir', args: '[usuario] [cantidad]', desc: 'Regala CocaCoins a un amigo' },
    { name: 'tragarmonedas', args: '[cantidad]', desc: 'Apuesta tus CocaCoins a la ruleta cyber' },
    { name: 'ppt', args: 'retar [nombre]', desc: 'Piedra, Papel o Tijera contra alguien' },
    { name: 'tresenraya', args: 'retar [nombre]', desc: 'Tres en Raya contra alguien' },
    { name: 'reto', args: '[ppt|tresenraya] [nombre]', desc: 'Retos con nombre largo (ej: /reto tres en raya Ana)' },
    { name: 'anuncio', args: '[texto]', desc: 'Anuncio destacado para todos', admin: true },
    { name: 'ban', args: '[usuario]', desc: 'Banear dispositivo de un usuario', admin: true },
    { name: 'unban', args: '[deviceId]', desc: 'Levantar un baneo', admin: true },
    { name: 'limpiar', desc: 'Vacía el chat completo', admin: true },
    { name: 'nuke', desc: 'Explosión nuclear y limpia tu chat visual', admin: true }
];

const LOCAL_COOLDOWNS = { sismo: 15000, confeti: 10000, ciberpanik: 30000, glitch: 12000, aplaudir: 10000, matemathica: 15000 };

const GAME_NAMES = { ppt: 'Piedra, Papel o Tijera', tresenraya: 'Tres en Raya' };
const MOVES = { piedra: '✊', papel: '✋', tijera: '✌️' };
const BEATS = { piedra: 'tijera', papel: 'piedra', tijera: 'papel' };
const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const BALL_ANSWERS = [
    'Sí, rotundamente. ✅', 'Los circuitos dicen que sí. 🔮', 'Todo apunta a que sí. 👍', 'Sin duda alguna. 💯',
    'Pregunta más tarde, estoy actualizando. ⏳', 'Señal débil... inténtalo de nuevo. 📡', 'Mejor no te lo cuento ahora. 🤐',
    'No cuentes con ello. ❌', 'Mis fuentes dicen que no. 🚫', 'Muy dudoso, choom. 🤔', 'Error 404: respuesta no encontrada. 🤖',
    'Las estrellas neón dicen que sí. ✨'
];

const SUERTE_FRASES = [
    'Tu firmware está corrupto. Hoy no toques nada. 🪫',
    'Hasta tu router te ignora hoy. 📡',
    'El casero-IA te sube el alquiler. 🏚️',
    'Bug en producción y tú de guardia. 🐛',
    'Eres un NPC con buena conexión. 🧍',
    'Tu ping es decente, tu destino también. 📶',
    'La Coca está fría y el wifi vuela. 🥤',
    'Un dron te trae pizza gratis. 🍕',
    'Los neones brillan para ti, choom. 🌆',
    '¡JACKPOT! Has hackeado a la suerte. 🎰'
];

const BATERIA_FRASES = [
    'Modo zombi activado. 🧟', 'Necesitas un enchufe YA. 🔌', 'Vas con la lengua fuera. 🥵',
    'Aguantas, pero justito. 😬', 'Nivel humano normal. 🙂', 'Cargadísimo, a por todo. ⚡', 'Reactor nuclear andante. ☢️'
];

/* =====================================================================
   UTILIDADES
   ===================================================================== */
const rand = (n) => Math.floor(Math.random() * n);
const randInt = (a, b) => a + rand(b - a + 1);
const pickOne = (arr) => arr[rand(arr.length)];
const trunc = (s, n) => String(s).length > n ? String(s).slice(0, n - 1) + '…' : String(s);
const bar = (p) => { const f = Math.round(p / 10); return '█'.repeat(f) + '░'.repeat(10 - f); };

/* Evaluador aritmético seguro para /calcula (sin eval, sin acceso a DOM ni globals) */
function chatEval(src) {
    try {
        let s = String(src).toLowerCase()
            .replace(/,/g, '.')
            .replace(/√/g, 'sqrt')
            .replace(/\^/g, '^')
            .replace(/π/g, 'pi').replace(/e\b/g, 'E');
        // valida caracteres permitidos
        if (!/^[0-9+\-*/^%().,\s a-zA-Z]*$/.test(s)) return null;
        // funciones y constantes soportadas
        const FN = { sqrt: Math.sqrt, abs: Math.abs, sin: Math.sin, cos: Math.cos, tan: Math.tan, ln: Math.log, log: Math.log10, log2: Math.log2, exp: Math.exp, floor: Math.floor, ceil: Math.ceil, round: Math.round, pow: Math.pow, min: Math.min, max: Math.max };
        s = s.replace(/\bpi\b/g, 'PI').replace(/\bE\b/g, 'EUL');
        // tokenizar y parser recursivo descendente
        let toks = [];
        const re = /(\d+\.?\d*(?:[eE][+-]?\d+)?)|([+\-*/^%(),])|([A-Za-z_]+)/g;
        let m;
        while ((m = re.exec(s))) toks.push(m[1] !== undefined ? { t: 'n', v: parseFloat(m[1]) } : (m[2] ? { t: 'o', v: m[2] } : { t: 'f', v: m[3] }));
        let i = 0;
        const peek = () => toks[i];
        const eat = (v) => toks[i] && ((toks[i].t === 'o' && toks[i].v === v) || (toks[i].t === 'f' && toks[i].v === v)) ? toks[i++] : null;
        function expr() { let v = term(); while (peek() && peek().t === 'o' && (peek().v === '+' || peek().v === '-')) { const op = toks[i++].v; const r = term(); v = op === '+' ? v + r : v - r; } return v; }
        function term() { let v = unary(); while (peek() && peek().t === 'o' && (peek().v === '*' || peek().v === '/' || peek().v === '%')) { const op = toks[i++].v; const r = unary(); if (op === '*') v *= r; else if (op === '/') v /= r; else v %= r; } return v; }
        function unary() { if (peek() && peek().t === 'o' && peek().v === '-') { i++; return -unary(); } if (peek() && peek().t === 'o' && peek().v === '+') { i++; } return power(); }
        function power() { let b = atom(); if (peek() && peek().t === 'o' && peek().v === '^') { i++; const e = unary(); return Math.pow(b, e); } return b; }
        function atom() {
            const tk = peek();
            if (!tk) throw new Error('fin');
            if (tk.t === 'n') { i++; return tk.v; }
            if (tk.t === 'f') {
                const name = tk.v.toLowerCase();
                if (name === 'pi') { i++; return Math.PI; }
                if (name === 'eul') { i++; return Math.E; }
                const fn = FN[name];
                if (!fn) throw new Error('func ' + name);
                i++;
                if (!eat('(')) throw new Error('parentesis');
                const args = [expr()];
                while (peek() && peek().t === 'o' && peek().v === ',') { i++; args.push(expr()); }
                if (!eat(')')) throw new Error('parentesis cierre');
                return fn(...args);
            }
            if (tk.t === 'o' && tk.v === '(') { i++; const v = expr(); if (!eat(')')) throw new Error('cierre'); return v; }
            throw new Error('token');
        }
        const val = expr();
        if (i !== toks.length) throw new Error('resto');
        return typeof val === 'number' ? val : null;
    } catch (e) { return null; }
}

function chatFmt(n) {
    if (!isFinite(n)) return String(n);
    if (Number.isInteger(n) && Math.abs(n) < 1e15) return n.toLocaleString('es-ES');
    return parseFloat(n.toPrecision(10)).toString();
}

function tokenize(s) {
    const out = [];
    const re = /"([^"]+)"|(\S+)/g;
    let m;
    while ((m = re.exec(s))) out.push(m[1] ?? m[2]);
    return out;
}

function hashStr(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
}

function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
}

function toast(msg) {
    let c = document.getElementById('toast-container');
    if (!c) { c = document.createElement('div'); c.id = 'toast-container'; document.body.appendChild(c); }
    const t = document.createElement('div');
    t.className = 'toast-msg';
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

function isPermissionDenied(e) {
    return e && (e.code === 'PERMISSION_DENIED' || String(e.message || '').includes('PERMISSION_DENIED'));
}

function makeCanvas(z = 99992) {
    const c = document.createElement('canvas');
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    c.style.cssText = `position:fixed;inset:0;width:100%;height:100%;z-index:${z};pointer-events:none;`;
    document.body.appendChild(c);
    return c;
}

/* =====================================================================
   ESTILOS
   ===================================================================== */
const CSS = `
#commands-menu{position:absolute;left:20px;right:20px;bottom:calc(100% + 6px);max-height:280px;overflow-y:auto;
 background:rgba(8,10,24,.86);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);
 border:1px solid rgba(0,198,255,.6);border-radius:12px;padding:6px;z-index:9000;display:none;
 box-shadow:0 0 14px rgba(0,198,255,.45),0 0 38px rgba(188,19,254,.25),inset 0 0 18px rgba(0,198,255,.06);
 font-family:'Courier New',Courier,monospace}
#commands-menu.open{display:block;animation:cmdMenuIn .14s ease-out}
@keyframes cmdMenuIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.cmd-item{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 10px;padding:8px 10px;border-radius:8px;cursor:pointer;color:#cfe9ff;border-left:3px solid transparent}
.cmd-item.active,.cmd-item:hover{background:linear-gradient(90deg,rgba(0,198,255,.22),rgba(188,19,254,.14));border-left-color:#00c6ff;text-shadow:0 0 6px rgba(0,198,255,.7)}
.cmd-name{color:#00c6ff;font-weight:800;white-space:nowrap}
.cmd-args{color:#bc13fe;white-space:nowrap;font-size:.8rem}
.cmd-desc{color:#8fa3c4;font-size:.76rem;flex:1 1 160px}
.cmd-badge{background:#ff3333;color:#fff;font-size:9px;padding:2px 5px;border-radius:4px;font-weight:800}

.cmd-flash{position:fixed;inset:0;background:#fff;z-index:99998;pointer-events:none;animation:cmdFlash 3s ease-out forwards}
@keyframes cmdFlash{0%,12%{opacity:1}100%{opacity:0}}

.cmd-glitchfx{position:fixed;inset:0;z-index:99994;pointer-events:none;overflow:hidden;mix-blend-mode:screen}
.cmd-glitchfx::before,.cmd-glitchfx::after{content:"";position:absolute;inset:-15%;background:repeating-linear-gradient(0deg,rgba(0,230,255,.16) 0 2px,transparent 2px 7px);animation:cmdGl 2.5s steps(18) forwards}
.cmd-glitchfx::after{background:repeating-linear-gradient(90deg,rgba(0,255,195,.13) 0 3px,transparent 3px 9px);animation-duration:1.7s}
@keyframes cmdGl{0%{transform:translateX(-3%)}20%{transform:translateX(4%) skewX(4deg)}40%{transform:translateX(-6%)}60%{transform:translateX(3%) skewX(-3deg)}80%{transform:translateX(-2%)}100%{transform:translateX(0);opacity:0}}
.cmd-aplaus{position:fixed;inset:0;z-index:99993;pointer-events:none;display:flex;align-items:center;justify-content:center;font-size:clamp(3rem,14vw,8rem);animation:cmdAp .9s ease-out forwards;filter:drop-shadow(0 0 24px rgba(0,230,255,.7))}
@keyframes cmdAp{0%{opacity:0;transform:scale(.4)}25%{opacity:1;transform:scale(1.25)}60%{transform:scale(1)}100%{opacity:0;transform:scale(1.5)}}
.cmd-matematica{position:fixed;inset:0;z-index:99993;pointer-events:none;overflow:hidden}
.cmd-matematica span{position:absolute;top:100%;color:#00e6ff;font-family:'Space Grotesk',sans-serif;font-weight:700;text-shadow:0 0 10px rgba(0,230,255,.8);animation:cmdAsc linear forwards}
@keyframes cmdAsc{to{transform:translateY(-115vh) rotate(12deg);opacity:0}}

.cmd-quake #app{animation:cmdQuake .1s linear infinite}
@keyframes cmdQuake{0%{transform:translate(0,0) rotate(0)}20%{transform:translate(-9px,5px) rotate(-.6deg)}
 40%{transform:translate(8px,-7px) rotate(.5deg)}60%{transform:translate(-6px,-4px) rotate(-.4deg)}
 80%{transform:translate(7px,6px) rotate(.6deg)}100%{transform:translate(0,0) rotate(0)}}

.cmd-panik{position:fixed;inset:0;z-index:99990;pointer-events:none;
 background:repeating-linear-gradient(0deg,rgba(255,0,0,.07) 0 2px,transparent 2px 4px);
 box-shadow:inset 0 0 120px 30px rgba(255,0,0,.75);animation:cmdPanikPulse .6s ease-in-out infinite alternate}
@keyframes cmdPanikPulse{from{box-shadow:inset 0 0 60px 10px rgba(255,0,0,.45)}to{box-shadow:inset 0 0 160px 50px rgba(255,0,0,.9)}}
.cmd-panik-text{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;width:90%;
 color:#ff2a2a;font-weight:800;font-family:'Courier New',monospace;font-size:clamp(1.1rem,5vw,2.6rem);
 text-shadow:0 0 12px #f00,0 0 30px #f00;animation:cmdBlink .5s steps(2,start) infinite}
@keyframes cmdBlink{to{visibility:hidden}}

.cmd-announce{position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:99996;width:min(92%,640px);
 background:rgba(90,0,0,.94);border:2px solid #ff3333;border-radius:14px;padding:14px 18px;text-align:center;color:#fff;
 font-family:'Courier New',monospace;box-shadow:0 0 14px #ff3333,0 0 40px rgba(255,51,51,.6);
 animation:cmdAnnIn .35s ease-out,cmdAnnOut .5s ease-in 7.5s forwards;pointer-events:none}
.cmd-announce b{display:block;color:#ffcc00;font-size:.8rem;letter-spacing:2px;margin-bottom:6px}
.cmd-announce span{font-size:1.05rem;font-weight:800;word-break:break-word}
@keyframes cmdAnnIn{from{opacity:0;transform:translate(-50%,-30px)}to{opacity:1;transform:translate(-50%,0)}}
@keyframes cmdAnnOut{to{opacity:0;transform:translate(-50%,-20px)}}

.cmd-nuke{position:fixed;inset:0;z-index:99997;pointer-events:none;display:flex;align-items:center;justify-content:center;
 background:radial-gradient(circle at center,#fff 0%,#ffd24d 25%,#ff6a00 55%,#5a0000 100%);animation:cmdNuke 3s ease-out forwards}
.cmd-nuke i{font-style:normal;font-size:clamp(6rem,30vw,16rem);animation:cmdNukeIcon 3s ease-out forwards}
@keyframes cmdNuke{0%{opacity:0;transform:scale(.2)}10%{opacity:1;transform:scale(1)}70%{opacity:.95}100%{opacity:0}}
@keyframes cmdNukeIcon{0%{transform:scale(.1)}40%{transform:scale(1.2)}100%{transform:scale(1.6)}}

html.cmd-invert{filter:invert(1) hue-rotate(180deg)}
html.cmd-invert img{filter:invert(1) hue-rotate(180deg)}

.cmd-game-overlay{position:fixed;inset:0;z-index:99995;display:flex;align-items:center;justify-content:center;
 background:rgba(5,6,16,.72);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);padding:16px}
.cmd-game{background:var(--card,#14172b);border:2px solid var(--accent2,#bc13fe);border-radius:18px;padding:22px;
 width:100%;max-width:360px;text-align:center;color:#fff;font-family:'Courier New',monospace;
 box-shadow:0 0 28px rgba(188,19,254,.6);animation:cmdMenuIn .2s ease-out}
.cmd-game h3{margin:0 0 4px;color:var(--accent,#00c6ff)}
.cmd-game .sub{color:#8fa3c4;font-size:.8rem;margin-bottom:14px;word-break:break-word}
.cmd-game .line{margin:10px 0;font-size:.9rem;min-height:1.2em}
.cmd-game .score{font-size:1.3rem;font-weight:800;margin:8px 0}
.cmd-game .row{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:12px}
.cmd-btn{background:linear-gradient(45deg,var(--accent,#00c6ff),var(--accent2,#bc13fe));color:#fff;border:none;border-radius:10px;
 padding:10px 16px;font-family:'Courier New',monospace;font-weight:800;cursor:pointer;font-size:.9rem}
.cmd-btn.big{font-size:2rem;padding:10px 14px}
.cmd-btn.red{background:#ff3333}
.cmd-btn.grey{background:#444}
.cmd-btn:disabled{background:#222;color:#555;cursor:not-allowed;filter:grayscale(1)}
.cmd-ttt{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px auto;max-width:260px}
.cmd-cell{aspect-ratio:1;background:#000;border:1px solid var(--accent,#00c6ff);border-radius:10px;color:#fff;
 font-size:2rem;font-weight:800;font-family:'Courier New',monospace;cursor:pointer}
.cmd-cell:disabled{cursor:not-allowed}
.cmd-cell.win{background:rgba(57,255,20,.25);border-color:#39ff14;box-shadow:0 0 12px #39ff14}
.cmd-cell.x{color:#00c6ff;text-shadow:0 0 8px #00c6ff}
.cmd-cell.o{color:#ff2bd6;text-shadow:0 0 8px #ff2bd6}
`;

function ensureStyles() {
    if (document.getElementById('cmd-styles')) return;
    const s = document.createElement('style');
    s.id = 'cmd-styles';
    s.textContent = CSS;
    document.head.appendChild(s);
}

/* =====================================================================
   MENÚ DESPLEGABLE (#commands-menu) — exportable
   ===================================================================== */
export function injectCommandsMenu({ input, getUser }) {
    ensureStyles();
    const host = input.closest('.input-wrap') || input.parentElement;
    host.style.position = 'relative';

    const old = document.getElementById('commands-menu');
    if (old) old.remove();
    const menu = document.createElement('div');
    menu.id = 'commands-menu';
    host.appendChild(menu);

    let items = [];
    let index = 0;

    const isOpen = () => menu.classList.contains('open');
    const current = () => (isOpen() ? items[index] : null);

    function hide() { menu.classList.remove('open'); items = []; index = 0; }

    function render() {
        menu.replaceChildren();
        items.forEach((c, i) => {
            const row = el('div', 'cmd-item' + (i === index ? ' active' : ''));
            row.appendChild(el('span', 'cmd-name', '/' + c.name));
            if (c.args) row.appendChild(el('span', 'cmd-args', c.args));
            row.appendChild(el('span', 'cmd-desc', c.desc));
            if (c.admin) row.appendChild(el('span', 'cmd-badge', 'ADMIN'));
            row.addEventListener('mousedown', (e) => e.preventDefault()); // no pierde el foco del input
            row.addEventListener('click', () => pick(c));
            menu.appendChild(row);
        });
        const active = menu.children[index];
        if (active) active.scrollIntoView({ block: 'nearest' });
    }

    function update() {
        const v = input.value;
        if (!v.startsWith('/') || /\s/.test(v)) return hide();
        const q = v.slice(1).toLowerCase();
        const isAdmin = !!(getUser && getUser().isAdmin);
        const avail = COMMAND_LIST.filter(c => !c.admin || isAdmin);
        const starts = avail.filter(c => c.name.startsWith(q));
        const contains = avail.filter(c => !c.name.startsWith(q) && c.name.includes(q));
        items = starts.concat(contains);
        if (!items.length) return hide();
        index = 0;
        menu.classList.add('open');
        render();
    }

    function pick(c) {
        input.value = '/' + c.name + (c.args ? ' ' : '');
        hide();
        input.focus();
        const len = input.value.length;
        try { input.setSelectionRange(len, len); } catch (e) { }
    }

    input.addEventListener('input', update);
    input.addEventListener('focus', update);
    input.addEventListener('blur', () => setTimeout(hide, 120));

    window.addEventListener('keydown', (e) => {
        if (e.target !== input || !isOpen()) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); index = (index + 1) % items.length; render(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); index = (index - 1 + items.length) % items.length; render(); }
        else if (e.key === 'Escape') { hide(); }
        else if (e.key === 'Tab') { e.preventDefault(); pick(items[index]); }
    }, true);

    return { isOpen, current, pick, hide, update };
}

/* =====================================================================
   EFECTOS VISUALES
   ===================================================================== */
function fxFlashbang() {
    const d = el('div', 'cmd-flash');
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 3100);
}

function fxSismo() {
    document.body.classList.add('cmd-quake');
    setTimeout(() => document.body.classList.remove('cmd-quake'), 2000);
}

function fxConfeti() {
    const c = makeCanvas();
    const ctx = c.getContext('2d');
    const colors = ['#00c6ff', '#bc13fe', '#39ff14', '#ff2bd6', '#fff200', '#ff6b00'];
    const parts = Array.from({ length: 180 }, () => ({
        x: Math.random() * c.width, y: -20 - Math.random() * c.height * 0.5,
        w: 6 + Math.random() * 8, h: 8 + Math.random() * 10,
        vx: (Math.random() - 0.5) * 3, vy: 2 + Math.random() * 4,
        rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.3, color: pickOne(colors)
    }));
    const end = performance.now() + 4500;
    function frame(t) {
        ctx.clearRect(0, 0, c.width, c.height);
        for (const p of parts) {
            p.x += p.vx; p.y += p.vy; p.rot += p.vr;
            if (p.y > c.height + 30 && t < end - 1500) { p.y = -20; p.x = Math.random() * c.width; }
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
        }
        if (t < end) requestAnimationFrame(frame); else c.remove();
    }
    requestAnimationFrame(frame);
}

function fxCiberpanik() {
    const d = el('div', 'cmd-panik');
    const t = el('div', 'cmd-panik-text');
    t.appendChild(document.createTextNode('⚠ ALERTA ROJA ⚠'));
    t.appendChild(document.createElement('br'));
    t.appendChild(document.createTextNode('INTRUSIÓN DETECTADA · HACKEO INMINENTE'));
    d.appendChild(t);
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 6000);
}

function fxMatrix() {
    const c = makeCanvas(99991);
    c.style.background = 'rgba(0,12,0,.35)';
    const ctx = c.getContext('2d');
    const size = 16;
    const cols = Math.ceil(c.width / size);
    const drops = Array.from({ length: cols }, () => Math.random() * -40);
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF';
    const end = performance.now() + 4000;
    let last = 0;
    function frame(t) {
        if (t - last > 45) {
            last = t;
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = 'rgba(0,0,0,.12)';
            ctx.fillRect(0, 0, c.width, c.height);
            ctx.globalCompositeOperation = 'source-over';
            ctx.font = size + 'px monospace';
            ctx.shadowColor = '#0f0';
            ctx.shadowBlur = 6;
            drops.forEach((y, i) => {
                ctx.fillStyle = Math.random() > 0.9 ? '#d6ffd9' : '#1aff3c';
                ctx.fillText(chars[rand(chars.length)], i * size, y * size);
                if (y * size > c.height && Math.random() > 0.975) drops[i] = 0; else drops[i]++;
            });
        }
        if (t < end) requestAnimationFrame(frame);
        else { c.style.transition = 'opacity .5s'; c.style.opacity = '0'; setTimeout(() => c.remove(), 550); }
    }
    requestAnimationFrame(frame);
}

function fxInvertir() {
    const on = document.documentElement.classList.toggle('cmd-invert');
    toast(on ? '🌗 Colores invertidos' : '🌓 Colores normales');
}

function fxGlitch() {
    const d = el('div', 'cmd-glitchfx');
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 2600);
}

function fxAplaudir() {
    const d = el('div', 'cmd-aplaus', '👏');
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 1000);
}

const MATH_FLOATIES = ['∫eˣdx', '√(0/0)', 'π²', 'Σn²', 'lim x→∞', 'dy/dx', 'eiπ+1=0', '∞', 'Δ', 'θ', '∛8', 'x²+y²=r²'];
function fxMatematathica() {
    const d = el('div', 'cmd-matematica');
    for (let i = 0; i < 14; i++) {
        const s = el('span', null, pickOne(MATH_FLOATIES));
        s.style.left = rand(95) + 'vw';
        s.style.fontSize = (14 + rand(22)) + 'px';
        s.style.animationDuration = (2.5 + Math.random() * 2) + 's';
        s.style.animationDelay = (Math.random() * 1.2) + 's';
        d.appendChild(s);
    }
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 4500);
}

function fxAnuncio(text) {
    const d = el('div', 'cmd-announce');
    d.appendChild(el('b', null, '📢 ANUNCIO DEL DUEÑO'));
    d.appendChild(el('span', null, text));
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 8100);
}

function fxNuke(onClear) {
    const d = el('div', 'cmd-nuke');
    d.appendChild(el('i', null, '☢️'));
    document.body.appendChild(d);
    document.body.classList.add('cmd-quake');
    setTimeout(onClear, 900);
    setTimeout(() => document.body.classList.remove('cmd-quake'), 2500);
    setTimeout(() => d.remove(), 3100);
}

/* =====================================================================
   INICIALIZACIÓN
   ===================================================================== */
export function initCommands(opts) {
    const { db, auth, getUser, deviceId } = opts;
    const input = opts.input || document.getElementById('msg-input');
    const sendBtn = opts.sendBtn || document.getElementById('send-btn');
    const chatBox = opts.chatBox || document.getElementById('chat-box');

    ensureStyles();
    const menu = injectCommandsMenu({ input, getUser });

    /* ---------- reloj del servidor ---------- */
    let serverOffset = 0;
    onValue(ref(db, '.info/serverTimeOffset'), (s) => { serverOffset = s.val() || 0; });
    const serverNow = () => Date.now() + serverOffset;

    /* ---------- muteo local (ruleta, ciber-cárcel) ---------- */
    const ORIGINAL_PLACEHOLDER = input.placeholder || 'Escribe un mensaje...';
    let muteUntil = 0;
    let muteTimer = null;
    try { muteUntil = Number(localStorage.getItem('cc_mute_until')) || 0; } catch (e) { }

    const isBanned = () => !!document.querySelector('.toast-ban');
    const isMuted = () => muteUntil > Date.now();

    function startMuteLoop(reason) {
        clearInterval(muteTimer);
        const tick = () => {
            const left = muteUntil - Date.now();
            if (left <= 0) {
                clearInterval(muteTimer);
                try { localStorage.removeItem('cc_mute_until'); localStorage.removeItem('cc_mute_reason'); } catch (e) { }
                if (!isBanned()) {
                    input.disabled = false;
                    sendBtn.disabled = false;
                    input.placeholder = ORIGINAL_PLACEHOLDER;
                }
                return;
            }
            input.disabled = true;
            sendBtn.disabled = true;
            input.placeholder = `🔇 ${reason}: ${Math.ceil(left / 1000)}s`;
        };
        tick();
        muteTimer = setInterval(tick, 500);
    }

    function applyMute(ms, reason) {
        muteUntil = Date.now() + ms;
        try { localStorage.setItem('cc_mute_until', String(muteUntil)); localStorage.setItem('cc_mute_reason', reason); } catch (e) { }
        startMuteLoop(reason);
    }

    if (isMuted()) {
        let r = 'Muteado';
        try { r = localStorage.getItem('cc_mute_reason') || r; } catch (e) { }
        startMuteLoop(r);
    }

    /* ---------- envío de mensajes de comando ---------- */
    async function say(text, tipo = 'comando', extra = {}, extraUpdates = {}) {
        const u = getUser();
        if (!u.isGoogle && u.name === 'Invitado') {
            toast('👤 Antes de usar comandos elige un nombre: envía un mensaje normal.');
            return false;
        }
        try {
            const key = push(ref(db, 'messages')).key;
            const payload = {
                text: String(text).slice(0, 150),
                user: u.name,
                pfp: u.pfp,
                isGoogle: !!u.isGoogle,
                isAdmin: !!u.isAdmin,
                uid: auth.currentUser ? auth.currentUser.uid : 'guest',
                deviceId,
                time: serverTimestamp(),
                tipo_mensaje: tipo,
                ...extra
            };
            await update(ref(db), { ['messages/' + key]: payload, ...extraUpdates });
            return true;
        } catch (e) {
            console.error('Error enviando comando:', e);
            toast(isPermissionDenied(e) ? '🚫 El servidor rechazó la acción (¿baneado o en cooldown?)' : '⚠️ Error de conexión');
            return false;
        }
    }

    /* ---------- usuarios conocidos (para retos y robos) ---------- */
    const known = new Map(); // nombre en minúsculas -> {name, deviceId}
    function findUser(name) {
        const key = String(name || '').trim().toLowerCase();
        if (!key) return null;
        if (known.has(key)) return known.get(key);
        const m = [...known.values()].filter(u => u.name.toLowerCase().startsWith(key));
        return m.length === 1 ? m[0] : null;
    }

    /* =================================================================
       RECEPCIÓN DE EFECTOS (processMessages)
       ================================================================= */
    const REACTIONS = {
        flashbang: fxFlashbang,
        sismo: fxSismo,
        confeti: fxConfeti,
        ciberpanik: fxCiberpanik,
        glitch: fxGlitch,
        aplaudir: fxAplaudir,
        matematica: fxMatematathica,
        matemathica: fxMatematathica,
        anuncio: (m) => { if (m.isAdmin === true) fxAnuncio(String(m.anuncio ?? m.text ?? '').slice(0, 120)); }
    };

    const seen = new Set();
    const hiddenIds = new Set();
    let primed = false;
    let lastItems = [];

    function processMessages(items) {
        lastItems = items;
        for (const { m } of items) {
            if (m && m.user && DEVICE_RE.test(m.deviceId || '')) {
                known.set(String(m.user).toLowerCase(), { name: String(m.user), deviceId: m.deviceId });
            }
        }

        if (!primed) {
            items.forEach(({ id }) => seen.add(id)); // el historial no reproduce efectos
            primed = true;
        } else {
            for (const { id, m } of items) {
                if (seen.has(id)) continue;
                seen.add(id);
                const fn = m && REACTIONS[m.tipo_mensaje];
                if (!fn) continue;
                if (typeof m.time === 'number' && serverNow() - m.time > STALE_EVENT_MS) continue;
                try { fn(m); } catch (e) { console.error(e); }
            }
            if (seen.size > 600) {
                const keep = new Set(items.map(i => i.id));
                seen.clear();
                keep.forEach(k => seen.add(k));
            }
        }
        return items.filter(({ id }) => !hiddenIds.has(id));
    }

    /* =================================================================
       ECONOMÍA
       ================================================================= */
    /* El saldo puede vivir en varias rutas según la versión del backend.
       Las recorremos todas y normalizamos el número en la primera que exista. */
    const WALLET_PATHS = ['economia', 'wallets', 'carteras', 'cocaCoins'];
    let walletRoot = null; // se resuelve una sola vez

    const wref = (root, id) => ref(db, root + '/' + id);

    async function resolveWalletRoot() {
        if (walletRoot) return walletRoot;
        for (const root of WALLET_PATHS) {
            try {
                const snap = await get(ref(db, root));
                if (snap.exists()) { walletRoot = root; return root; }
            } catch (e) {
                if (isPermissionDenied(e)) continue; // ruta no publicada: probamos la siguiente
            }
        }
        walletRoot = WALLET_PATHS[0]; // fallback: la canónica
        return walletRoot;
    }

    function readBalance(val) {
        if (typeof val === 'number') return val;
        if (val && typeof val === 'object') {
            const c = val.coins ?? val.saldo ?? val.balance ?? val.cocaCoins ?? val.amount;
            if (typeof c === 'number') return c;
        }
        return null;
    }

    async function getBalance(id) {
        const root = await resolveWalletRoot();
        // 1) intento directo en la raíz canónica
        try {
            const snap = await get(wref(root, id));
            const b = readBalance(snap.exists() ? snap.val() : null);
            if (b !== null) return b;
        } catch (e) { if (!isPermissionDenied(e)) console.error(e); }
        // 2) autodescubrimiento por si el backend cambió de raíz
        for (const alt of WALLET_PATHS) {
            if (alt === root) continue;
            try {
                const snap = await get(wref(alt, id));
                const b = readBalance(snap.exists() ? snap.val() : null);
                if (b !== null) { walletRoot = alt; return b; }
            } catch (e) { /* seguimos buscando */ }
        }
        // 3) no existe todavía: se crea con el saldo inicial
        try {
            const r = await runTransaction(wref(root, id), (cur) => (readBalance(cur) === null ? START_COINS : cur));
            const created = readBalance(r.snapshot.val());
            return created === null ? START_COINS : created;
        } catch (e) {
            console.error('ensureWallet:', e);
            throw e;
        }
    }

    async function ensureWallet(id) { return getBalance(id); }

    async function addCoins(id, delta) {
        const root = await resolveWalletRoot();
        return runTransaction(wref(root, id), (cur) => {
            const bal = readBalance(cur);
            if (bal === null) return START_COINS + delta;
            return Math.max(0, bal + delta);
        });
    }

    /* =================================================================
       PARTIDAS P2P
       ================================================================= */
    let gameOverlay = null;
    let gameCard = null;
    let lastActive = null;
    const dismissed = new Set();
    const cleaned = new Set();
    let gamesA = {};
    let gamesB = {};

    const snapToObj = (s) => { const o = {}; s.forEach(c => { o[c.key] = c.val(); }); return o; };
    const gameRef = (id) => ref(db, 'partidas/' + id);

    async function txGame(id, fn) {
        try {
            return await runTransaction(gameRef(id), (cur) => {
                if (cur === null) return cur;
                return fn(cur); // undefined = abortar
            });
        } catch (e) {
            console.error(e);
            toast('⚠️ Error de conexión con la partida');
            return null;
        }
    }

    function winnerLine(b) {
        return LINES.find(([x, y, z]) => b[x] !== '-' && b[x] === b[y] && b[x] === b[z]) || null;
    }

    const acceptGame = (id) => txGame(id, (g) => { if (g.estado !== 'pendiente') return; g.estado = 'jugando'; return g; });
    const rejectGame = (id) => { dismissed.add(id); return txGame(id, (g) => { if (g.estado !== 'pendiente') return; g.estado = 'rechazada'; return g; }); };

    function cancelGame(id) {
        dismissed.add(id);
        remove(gameRef(id)).catch(() => { });
        hideGame();
    }

    function abandonGame(id, role) {
        txGame(id, (g) => {
            if (g.estado !== 'jugando') return;
            g.estado = 'terminada';
            g.ganador = role === 'retador' ? 'rival' : 'retador';
            g.abandono = role;
            return g;
        });
    }

    function closeGame(id, role) {
        dismissed.add(id);
        hideGame();
        txGame(id, (g) => {
            g.vistas = g.vistas || {};
            g.vistas[role] = true;
            if (g.vistas.retador && g.vistas.rival) return null; // ambos han visto el final: se borra
            return g;
        });
    }

    function pptMove(id, role, move) {
        txGame(id, (g) => {
            if (g.estado !== 'jugando' || g.tipo !== 'ppt') return;
            g.jugadas = g.jugadas || {};
            if (g.jugadas[role]) return;
            g.jugadas[role] = move;
            if (g.jugadas.retador && g.jugadas.rival) {
                const a = g.jugadas.retador, b = g.jugadas.rival;
                const winner = a === b ? 'empate' : (BEATS[a] === b ? 'retador' : 'rival');
                g.puntos = g.puntos || { retador: 0, rival: 0 };
                g.ultima = { retador: a, rival: b, ganador: winner, ronda: g.ronda || 1 };
                if (winner !== 'empate') g.puntos[winner] = (g.puntos[winner] || 0) + 1;
                g.jugadas = null;
                g.ronda = (g.ronda || 1) + 1;
                if (winner !== 'empate' && g.puntos[winner] >= 2) { g.estado = 'terminada'; g.ganador = winner; }
            }
            return g;
        });
    }

    function tttMove(id, role, idx) {
        txGame(id, (g) => {
            if (g.estado !== 'jugando' || g.tipo !== 'tresenraya') return;
            if (g.turno !== role) return;
            const b = String(g.tablero || '---------').split('');
            if (b[idx] !== '-') return;
            b[idx] = role === 'retador' ? 'X' : 'O';
            g.tablero = b.join('');
            const line = winnerLine(b);
            if (line) { g.estado = 'terminada'; g.ganador = role; g.linea = line.join(','); }
            else if (!b.includes('-')) { g.estado = 'terminada'; g.ganador = 'empate'; }
            else g.turno = role === 'retador' ? 'rival' : 'retador';
            return g;
        });
    }

    function hideGame() {
        if (gameOverlay) gameOverlay.remove();
        gameOverlay = null;
        gameCard = null;
    }

    function mkBtn(label, cls, onClick, disabled) {
        const b = el('button', 'cmd-btn ' + (cls || ''), label);
        b.type = 'button';
        if (disabled) b.disabled = true;
        b.addEventListener('click', onClick);
        return b;
    }

    function showGame(id, g) {
        if (!gameOverlay) {
            gameOverlay = el('div', 'cmd-game-overlay');
            gameCard = el('div', 'cmd-game');
            gameOverlay.appendChild(gameCard);
            document.body.appendChild(gameOverlay);
        }
        const role = g.retadorId === deviceId ? 'retador' : 'rival';
        const other = role === 'retador' ? 'rival' : 'retador';
        const oppName = role === 'retador' ? g.rivalNombre : g.retadorNombre;
        const over = g.estado === 'terminada';

        const nodes = [];
        nodes.push(el('h3', null, '🎮 ' + (GAME_NAMES[g.tipo] || 'Partida')));
        nodes.push(el('div', 'sub', `${g.retadorNombre} vs ${g.rivalNombre}`));

        if (g.estado === 'pendiente') {
            if (role === 'retador') {
                nodes.push(el('div', 'line', `⏳ Esperando a ${oppName}...`));
                const row = el('div', 'row');
                row.appendChild(mkBtn('Cancelar', 'red', () => cancelGame(id)));
                nodes.push(row);
            } else {
                nodes.push(el('div', 'line', `⚔️ ${oppName} te reta a ${GAME_NAMES[g.tipo]}`));
                const row = el('div', 'row');
                row.appendChild(mkBtn('Aceptar', '', () => acceptGame(id)));
                row.appendChild(mkBtn('Rechazar', 'red', () => { rejectGame(id); hideGame(); }));
                nodes.push(row);
            }
        } else if (g.tipo === 'ppt') {
            const p = g.puntos || { retador: 0, rival: 0 };
            nodes.push(el('div', 'score', `Tú ${p[role] || 0} — ${p[other] || 0} ${trunc(oppName, 12)}`));
            nodes.push(el('div', 'line', over ? 'Partida terminada' : `Ronda ${g.ronda || 1} · gana quien llegue a 2`));
            if (g.ultima) {
                const u = g.ultima;
                const res = u.ganador === 'empate' ? 'Empate' : (u.ganador === role ? '¡Ganaste la ronda!' : 'Perdiste la ronda');
                nodes.push(el('div', 'line', `Ronda ${u.ronda}: ${MOVES[u[role]]} vs ${MOVES[u[other]]} → ${res}`));
            }
            if (!over) {
                const chosen = g.jugadas && g.jugadas[role];
                const row = el('div', 'row');
                Object.keys(MOVES).forEach(mv => row.appendChild(mkBtn(MOVES[mv], 'big', () => pptMove(id, role, mv), !!chosen)));
                nodes.push(row);
                nodes.push(el('div', 'line', chosen ? `✅ Elegiste ${MOVES[chosen]} · esperando al rival...` : 'Elige tu jugada'));
            }
        } else if (g.tipo === 'tresenraya') {
            const board = String(g.tablero || '---------');
            const winCells = g.linea ? g.linea.split(',').map(Number) : [];
            const myTurn = !over && g.turno === role;
            nodes.push(el('div', 'line', over ? 'Partida terminada' : (myTurn ? `Tu turno (${role === 'retador' ? 'X' : 'O'})` : `Turno de ${oppName}...`)));
            const grid = el('div', 'cmd-ttt');
            for (let i = 0; i < 9; i++) {
                const ch = board[i] === '-' ? '' : board[i];
                const cell = el('button', 'cmd-cell' + (ch === 'X' ? ' x' : ch === 'O' ? ' o' : '') + (winCells.includes(i) ? ' win' : ''), ch);
                cell.type = 'button';
                cell.disabled = !myTurn || board[i] !== '-';
                cell.addEventListener('click', () => tttMove(id, role, i));
                grid.appendChild(cell);
            }
            nodes.push(grid);
        }

        if (over) {
            let res;
            if (g.ganador === 'empate') res = '🤝 ¡Empate!';
            else res = g.ganador === role ? '🏆 ¡Has ganado!' : '💀 Has perdido';
            nodes.push(el('div', 'score', res));
            if (g.abandono) nodes.push(el('div', 'line', g.abandono === role ? 'Abandonaste la partida.' : 'Tu rival abandonó la partida.'));
            const row = el('div', 'row');
            row.appendChild(mkBtn('Cerrar', 'grey', () => closeGame(id, role)));
            nodes.push(row);
        } else if (g.estado === 'jugando') {
            const row = el('div', 'row');
            row.appendChild(mkBtn('Abandonar', 'red', () => abandonGame(id, role)));
            nodes.push(row);
        }

        gameCard.replaceChildren(...nodes);
        lastActive = { id, estado: g.estado, role };
    }

    function syncGames() {
        const all = { ...gamesA, ...gamesB };
        const now = serverNow();
        let best = null;

        for (const [id, g] of Object.entries(all)) {
            if (!g || typeof g !== 'object') continue;
            const age = typeof g.creada === 'number' ? now - g.creada : 0;
            const isHost = g.retadorId === deviceId;
            const stale = (g.estado === 'pendiente' && age > 5 * 60e3) ||
                ((g.estado === 'terminada' || g.estado === 'rechazada') && age > 10 * 60e3);

            if (stale) {
                if (isHost && !cleaned.has(id)) { cleaned.add(id); remove(gameRef(id)).catch(() => { }); }
                continue;
            }
            if (g.estado === 'rechazada') {
                if (isHost) {
                    if (!dismissed.has(id)) toast(`❌ ${g.rivalNombre} rechazó tu reto`);
                    dismissed.add(id);
                    remove(gameRef(id)).catch(() => { });
                }
                continue;
            }
            if (dismissed.has(id)) continue;

            const t = typeof g.creada === 'number' ? g.creada : Number.MAX_SAFE_INTEGER;
            if (!best || t > best.t) best = { id, g, t };
        }

        if (best) {
            showGame(best.id, best.g);
        } else {
            if (lastActive && lastActive.estado === 'pendiente' && lastActive.role === 'rival' && !dismissed.has(lastActive.id)) {
                toast('⚔️ El reto fue cancelado');
            }
            lastActive = null;
            hideGame();
        }
    }

    onValue(query(ref(db, 'partidas'), orderByChild('retadorId'), equalTo(deviceId)), (s) => { gamesA = snapToObj(s); syncGames(); });
    onValue(query(ref(db, 'partidas'), orderByChild('rivalId'), equalTo(deviceId)), (s) => { gamesB = snapToObj(s); syncGames(); });

    async function challenge(tipo, rest) {
        const m = rest.match(/^retar\s+([\s\S]+)$/i);
        if (!m) return toast(`Uso: /${tipo === 'ppt' ? 'ppt' : 'tresenraya'} retar [nombre]`);
        const nameArg = tokenize(m[1].trim())[0] ? m[1].trim().replace(/^"(.+)"$/, '$1') : '';
        const target = findUser(nameArg);
        if (!target) return toast(`No veo a "${trunc(nameArg, 20)}" en el chat reciente`);
        if (target.deviceId === deviceId) return toast('No puedes retarte a ti mismo 😅');
        if (lastActive) return toast('Ya tienes una partida activa');

        const u = getUser();
        if (!u.isGoogle && u.name === 'Invitado') return toast('👤 Antes de usar comandos elige un nombre: envía un mensaje normal.');

        const id = push(ref(db, 'partidas')).key;
        try {
            await update(ref(db), {
                ['partidas/' + id]: {
                    tipo, estado: 'pendiente',
                    retadorId: deviceId, retadorNombre: u.name,
                    rivalId: target.deviceId, rivalNombre: target.name,
                    creada: serverTimestamp(),
                    ronda: 1, puntos: { retador: 0, rival: 0 },
                    tablero: '---------', turno: 'retador'
                }
            });
        } catch (e) {
            console.error(e);
            return toast('⚠️ No se pudo crear la partida');
        }
        say(`⚔️ ${u.name} reta a ${target.name} a ${GAME_NAMES[tipo]}`, 'reto');
    }

    /* =================================================================
       MANEJADORES DE COMANDOS
       ================================================================= */
    const H = {
        async flashbang() {
            try {
                const snap = await get(ref(db, `cooldowns/${deviceId}/flashbang`));
                if (snap.exists()) {
                    const left = FLASHBANG_COOLDOWN - (serverNow() - snap.val());
                    if (left > 0) {
                        const txt = left >= 60000 ? `${Math.ceil(left / 60000)} min` : `${Math.ceil(left / 1000)} s`;
                        return toast(`⏳ Flashbang en cooldown: te quedan ${txt}`);
                    }
                }
            } catch (e) { console.error(e); return toast('⚠️ No se pudo comprobar el cooldown'); }
            await say(`💥 ${getUser().name} ha lanzado una FLASHBANG`, 'flashbang', {},
                { [`cooldowns/${deviceId}/flashbang`]: serverTimestamp() });
        },
        sismo: () => say(`🌋 ${getUser().name} ha provocado un SISMO`, 'sismo'),
        confeti: () => say(`🎉 ${getUser().name} lanza confeti neón`, 'confeti'),
        ciberpanik: () => say(`🚨 ${getUser().name} activa la CIBERPANIK: ¡hackeo inminente!`, 'ciberpanik'),

        glitch: () => say(`📺 ${getUser().name} provoca un GLITCH RGB`, 'glitch'),
        aplaudir: () => say(`👏 ${getUser().name} pide un aplauso`, 'aplaudir'),
        matemathica: () => say(`∑ ${getUser().name} activa la lluvia de ecuaciones`, 'matematica'),
        matrix() { fxMatrix(); },
        invertir() { fxInvertir(); },

        /* ---------- aleatorios ---------- */
        async moneda() {
            const lado = Math.random() < 0.5 ? 'CARA 🪙' : 'CRUZ 🥶';
            await say(`🪙 ${getUser().name} lanza la moneda... ¡${lado}!`);
        },
        async dado(rest, args) {
            let n = parseInt(args[0], 10);
            if (!isFinite(n) || n <= 0) n = 1;
            if (n > 10) { n = 10; toast('Máximo 10 dados'); }
            const tiradas = Array.from({ length: n }, () => randInt(1, 6));
            const total = tiradas.reduce((a, b) => a + b, 0);
            await say(`🎲 ${getUser().name} tira ${n} dado${n > 1 ? 's' : ''}: ${tiradas.join(' · ')} → total ${total}`);
        },
        async rand(rest, args) {
            let a = parseInt(args[0], 10), b = parseInt(args[1], 10);
            if (!isFinite(a)) a = 1; if (!isFinite(b)) b = 100;
            if (b < a) { const t = a; a = b; b = t; }
            await say(`🔢 ${getUser().name}: ${randInt(a, b)} (entre ${a} y ${b})`);
        },
        async baraja(rest, args) {
            let n = parseInt(args[0], 10);
            if (!isFinite(n) || n <= 0) n = 1;
            if (n > 5) { n = 5; toast('Máximo 5 cartas'); }
            const out = [];
            for (let i = 0; i < n; i++) out.push(`${pickOne(RANKS)}${pickOne(SUITS)}`);
            await say(`🃏 ${getUser().name} saca: ${out.join('  ')}`);
        },
        async polla(rest, args) {
            let n = parseInt(args[0], 10);
            if (!isFinite(n) || n < 1) n = randInt(5, 20);
            if (n > 60) n = 60;
            await say(`📏 ${getUser().name}: 8${'═'.repeat(n)}D (${n} cm de neón)`);
        },
        async nave() {
            const parts = [
                ['🛸', '🚀', '🛰️', '🌟'],
                ['▰▱▰', '◈◈◈', '▓▒░', '≡≡≡', '◆◇◆'],
                ['🔥', '⚡', '💠', '☄️']
            ];
            const ship = `${pickOne(parts[1])}${pickOne(parts[0])}${pickOne(parts[2])}`;
            const nombre = `MSN-${String(randInt(1, 9999)).padStart(4, '0')}`;
            await say(`🚀 ${getUser().name} pilota la nave «${nombre}» ${ship}`);
        },

        /* ---------- texto ---------- */
        flip(rest) {
            if (!rest) return toast('Uso: /flip [texto]');
            const map = {
                a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ƃ', h: 'ɥ', i: 'ᴉ', j: 'ɾ', k: 'ʞ', l: 'l',
                m: 'ɯ', n: 'u', o: 'o', p: 'd', q: 'b', r: 'ɹ', s: 's', t: 'ʇ', u: 'n', v: 'ʌ', w: 'ʍ', x: 'x',
                y: 'ʎ', z: 'z',
                A: '∀', B: '𐐒', C: 'Ɔ', D: 'Ð', E: 'Ǝ', F: 'Ⅎ', G: '⅁', H: 'H', I: 'I', J: 'ſ', K: 'ʞ', L: '˥',
                M: 'W', N: 'NO', O: 'O', P: 'Ԁ', Q: 'Ό', R: 'ᴚ', S: 'S', T: '⊥', U: '∩', V: 'Λ', W: 'M', X: 'X',
                Y: 'ʎ', Z: 'Z',
                '0': 'O', '1': 'I', '2': 'S', '3': 'E', '4': 'h', '5': 'S', '6': 'g', '7': 'L', '8': 'B', '9': 'g',
                '?': '¿', '!': '¡', '.': '˙', ',': "' ", "'": ',', '"': '„',
                '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{', '<': '>', '>': '<', '_': '‾', '-': '-',
                ' ': ' '
            };
            const inv = [...rest.toLowerCase()].reverse().map(ch => map[ch] !== undefined ? map[ch] : ch).join('');
            return say(`${trunc(inv, 140)}`);
        },
        repetir(rest, args) {
            if (args.length < 2) return toast('Uso: /repetir [n] [texto]');
            let n = parseInt(args[0], 10);
            if (!isFinite(n) || n <= 0) return toast('El primer argumento debe ser un número positivo');
            if (n > 10) { n = 10; toast('Máximo 10 repeticiones'); }
            const txt = rest.replace(/^\s*\d+\s*/, '').slice(0, 100);
            if (!txt) return toast('Falta el texto');
            return say(Array(n).fill(txt).join(' · '));
        },
        eco(rest) {
            if (!rest) return toast('Uso: /eco [texto]');
            return say(`🔊 ${trunc(rest, 140)}`);
        },
        clap(rest) {
            if (!rest) return toast('Uso: /clap [texto]');
            return say('👏 ' + rest.split(/\s+/).filter(Boolean).slice(0, 12).join(' 👏 '));
        },

        /* ---------- economía ---------- */
        async transferir(rest, args) {
            if (args.length < 2) return toast('Uso: /transferir [usuario] [cantidad]');
            const cantidad = parseInt(args[args.length - 1], 10);
            const who = args.slice(0, args.length - 1).join(' ');
            if (!isFinite(cantidad) || cantidad <= 0) return toast('La cantidad debe ser un número mayor que 0');
            if (cantidad > 5000) return toast('Máximo 5000 monedas por transferencia');
            const target = findUser(who);
            if (!target) return toast(`No veo a "${trunc(who, 20)}" en el chat reciente`);
            if (target.deviceId === deviceId) return toast('No puedes transferirte a ti mismo 😅');
            let mine;
            try { mine = await getBalance(deviceId); } catch (e) { console.error(e); return toast('⚠️ No se pudo leer tu saldo'); }
            if (mine < cantidad) return toast(`💸 No te alcanza: tienes ${mine} monedas`);
            try {
                await addCoins(deviceId, -cantidad);
                await addCoins(target.deviceId, cantidad);
            } catch (e) {
                console.error(e);
                return toast(isPermissionDenied(e) ? '🔒 Los permisos del servidor no permiten mover monedas' : '⚠️ La transferencia falló');
            }
            await say(`💸 ${getUser().name} transfiere ${cantidad} monedas a ${target.name} 🤝`);
        },
        async tragarmonedas(rest, args) {
            const bet = parseInt(args[0], 10);
            if (!isFinite(bet) || bet <= 0) return toast('Uso: /tragarmonedas [cantidad]');
            let mine;
            try { mine = await getBalance(deviceId); } catch (e) { console.error(e); return toast('⚠️ No se pudo leer tu saldo'); }
            if (mine < bet) return toast(`💸 Te faltan monedas: tienes ${mine} y apuestas ${bet}`);
            const win = Math.random() < 0.45;
            try {
                await addCoins(deviceId, win ? bet : -bet);
            } catch (e) {
                console.error(e);
                return toast(isPermissionDenied(e) ? '🔒 Los permisos del servidor bloquean las apuestas' : '⚠️ La apuesta falló');
            }
            await say(win
                ? `🎰 ${getUser().name} apuesta ${bet}… ¡JACKPOT! +${bet} monedas 🪙`
                : `🎰 ${getUser().name} apuesta ${bet}… la ruleta se las traga 🕳️ −${bet}`);
        },

        async ruleta() {
            const u = getUser().name;
            const bullet = rand(6) === 0;
            if (bullet) applyMute(60000, 'Ruleta rusa');
            await say(bullet
                ? `🔫 ${u} aprieta el gatillo... 💥 ¡BANG! Muteado 1 minuto 🔇`
                : `🔫 ${u} aprieta el gatillo... *clic* 😮‍💨 ¡Se salva!`);
        },

        async '8ball'(rest) {
            if (!rest) return toast('Uso: /8ball [pregunta]');
            await say(`🎱 ${getUser().name} pregunta: «${trunc(rest, 60)}» ➜ ${pickOne(BALL_ANSWERS)}`);
        },

        async suerte() {
            const day = new Date().toISOString().slice(0, 10);
            const n = (hashStr(deviceId + day) % 100) + 1;
            const phrase = SUERTE_FRASES[Math.min(9, Math.floor((n - 1) / 10))];
            await say(`🍀 ${getUser().name} tiene ${n}/100 de suerte hoy: ${phrase}`);
        },

        async bateria() {
            const p = randInt(1, 100);
            const phrase = BATERIA_FRASES[Math.min(6, Math.floor(p / 15))];
            await say(`🔋 ${getUser().name}: ciber-energía ${p}% [${bar(p)}] ${phrase}`);
        },

        async ship(rest, args) {
            if (args.length < 2) return toast('Uso: /ship [nombre1] [nombre2]  (usa "comillas" si tienen espacios)');
            const p = randInt(0, 100);
            const a = trunc(args[0], 20), b = trunc(args[1], 20);
            await say(`💘 ${a} ❤ ${b} = ${p}% [${bar(p)}]`);
        },

        async hackear(rest) {
            if (!rest) return toast('Uso: /hackear [nombre]');
            const pass = pickOne(['123456', 'password', 'admin1234', 'qwerty', 'cocacola', 'iloveyou']);
            await say(`💻 ${getUser().name} hackea a ${trunc(rest, 24)}... ▓▓▓▓▓▓▓▓▓▓ 100% 🔓 ¡ACCESO CONCEDIDO! Pass: ${pass}`);
        },

        async amor(rest) {
            if (!rest) return toast('Uso: /amor [nombre]');
            const p = randInt(0, 100);
            await say(`💞 ${getUser().name} + ${trunc(rest, 24)} = ${p}% [${bar(p)}]`);
        },

        async abrazar(rest) {
            if (!rest) return toast('Uso: /abrazar [nombre]');
            await say(`🫂 ${getUser().name} le manda un ciber-abrazo a ${trunc(rest, 30)}`);
        },

        coca: () => say(`🥤 ${getUser().name} abre una Coca-Cola bien fría... *PSSSHH* 🧊 ¡Qué fresquita!`),
        refresco: () => say(`🥤 ${getUser().name} abre un refresco helado... *PSSSHH* 🫧 ¡Burbujas neón!`),

        async cartera() {
            try {
                const bal = await getBalance(deviceId);
                toast(`💰 Cartera · ${bar(Math.min(100, bal / 2))} ${bal} monedas`);
            } catch (e) {
                console.error(e);
                toast(isPermissionDenied(e)
                    ? '🔒 Las carteras están bloqueadas por los permisos del servidor (Realtime Database Rules)'
                    : '⚠️ No se pudo leer tu cartera');
            }
        },
        wallet() { return H.cartera(); },
        monedas() { return H.cartera(); },

        async robar(rest) {
            if (!rest) return toast('Uso: /robar [usuario]');
            const target = findUser(rest);
            if (!target) return toast(`No veo a "${trunc(rest, 20)}" en el chat reciente (tiene que haber escrito algo)`);
            if (!target.deviceId) return toast('Ese usuario no tiene dispositivo identificable');
            if (target.deviceId === deviceId) return toast('No puedes robarte a ti mismo 😅');
            const u = getUser().name;

            let mine, theirs;
            try {
                mine = await getBalance(deviceId);
                theirs = await getBalance(target.deviceId);
            } catch (e) { console.error(e); return toast('⚠️ No se pudo acceder a las carteras'); }

            if (theirs <= 0) return say(`🦹 ${u} intentó robar a ${target.name}, pero no tiene ni una moneda 🕸️`);

            if (Math.random() < 0.5) {
                const root = await resolveWalletRoot();
                let stolen = 0;
                let res;
                try {
                    res = await runTransaction(wref(root, target.deviceId), (cur) => {
                        const bal = readBalance(cur);
                        if (bal === null || bal <= 0) return;              // aborta
                        stolen = Math.min(randInt(10, 40), bal);
                        if (stolen <= 0) return;
                        return typeof cur === 'number' ? cur - stolen : { coins: bal - stolen };
                    });
                } catch (e) { console.error(e); return toast('⚠️ El robo ha fallado por la conexión'); }

                if (!res || !res.committed || stolen <= 0) {
                    return say(`🦹 ${u} intentó robar a ${target.name}, pero no tenía nada 🕸️`);
                }
                try { await addCoins(deviceId, stolen); } catch (e) { console.error(e); }
                await say(`🦹 ${u} le robó ${stolen} monedas a ${target.name} 💰`);
            } else {
                applyMute(30000, 'Ciber-cárcel');
                await say(`🚔 ${u} intentó robar a ${target.name} y acabó en la ciber-cárcel 30s ⛓️`);
            }
        },
        robos(rest) { return H.robar(rest); },

        /* ---------- matemáticas ---------- */
        async calcula(rest) {
            if (!rest) return toast('Uso: /calcula [expresión]  ·  ej: /calcula sqrt(144)+2^3');
            const r = chatEval(rest);
            if (r === null || !isFinite(r)) return toast('❌ Expresión no válida o indeterminada');
            const txt = chatFmt(r);
            return say(`🧮 ${getUser().name}: ${trunc(rest, 60)} = ${txt}`);
        },
        async derivada(rest, args) {
            const n = parseFloat((args[0] || '').replace(',', '.'));
            if (!isFinite(n)) return toast('Uso: /derivada [número]');
            const d = randInt(0, 9);
            return say(`😏 ${getUser().name} deriva ${n}… y la integral de ${n}x sale ${d}. Nadie entendió nada.`);
        },

        ppt: (rest) => challenge('ppt', rest),
        tresenraya: (rest) => challenge('tresenraya', rest),

        async anuncio(rest) {
            if (!rest) return toast('Uso: /anuncio [texto]');
            const txt = rest.slice(0, 120);
            await say('📢 ' + txt, 'anuncio', { anuncio: txt });
        },

        async limpiar() {
            const snap = await get(ref(db, 'messages')).catch((e) => { console.error(e); return null; });
            if (!snap || !snap.exists()) return toast('El chat ya está vacío');
            const keys = [];
            snap.forEach(c => keys.push(c.key));
            let borrados = 0;
            for (const k of keys) {
                try { await remove(ref(db, 'messages/' + k)); borrados++; }
                catch (e) { console.error(e); break; }
            }
            toast(`🧹 ${borrados} mensajes eliminados`);
            await say(`🧹 ${getUser().name} ha vaciado el chat`, 'limpiar');
        },

        async ban(rest) {
            if (!rest) return toast('Uso: /ban [usuario]');
            const target = findUser(rest);
            if (!target) return toast(`No veo a "${trunc(rest, 20)}" en el chat reciente`);
            if (target.deviceId === deviceId) return toast('No puedes banearte a ti mismo');
            try {
                await set(ref(db, 'banned_devices/' + target.deviceId), { banned: true, time: serverTimestamp(), por: getUser().name });
                await say(`🔒 ${getUser().name} ha baneado a ${target.name}`, 'ban');
                toast(`🔒 ${target.name} baneado`);
            } catch (e) {
                console.error(e);
                toast(isPermissionDenied(e) ? '🔒 Sin permisos para banear' : '⚠️ No se pudo completar el baneo');
            }
        },

        async unban(rest) {
            if (!rest) return toast('Uso: /unban [deviceId]');
            const id = rest.trim().split(/\s+/)[0];
            if (!DEVICE_RE.test(id)) return toast('Ese ID de dispositivo no es válido');
            try {
                await remove(ref(db, 'banned_devices/' + id));
                await say(`✅ ${getUser().name} ha levantado el baneo de un dispositivo`, 'unban');
                toast('✅ Baneo levantado');
            } catch (e) {
                console.error(e);
                toast(isPermissionDenied(e) ? '🔒 Sin permisos para desbanear' : '⚠️ No se pudo levantar el baneo');
            }
        },

        nuke() {
            fxNuke(() => {
                lastItems.forEach(({ id }) => hiddenIds.add(id));
                if (chatBox) chatBox.replaceChildren();
            });
        }
    };

    /* =================================================================
       EJECUCIÓN Y ESCUCHADORES DEL INPUT
       ================================================================= */
    let lastCmdAt = 0;
    const lastByCmd = {};

    async function execute(raw) {
        const m = raw.match(/^\/([^\s]+)\s*([\s\S]*)$/);
        if (!m) return;
        const name = m[1].toLowerCase();
        const rest = m[2].trim();
        const args = tokenize(rest);
        const meta = COMMAND_LIST.find(c => c.name === name);

        if (!meta) return toast(`❓ Comando desconocido: /${name}`);
        if (meta.admin && !getUser().isAdmin) return toast('🔒 Comando exclusivo del Dueño');
        if (isMuted() || isBanned()) return;

        const now = Date.now();
        if (now - lastCmdAt < 1200) return toast('⏱️ Más despacio, ciber-viajero...');
        if (LOCAL_COOLDOWNS[name] && now - (lastByCmd[name] || 0) < LOCAL_COOLDOWNS[name]) {
            return toast(`⏳ /${name} se puede usar cada ${LOCAL_COOLDOWNS[name] / 1000}s`);
        }
        lastCmdAt = now;
        lastByCmd[name] = now;

        try { await H[name](rest, args); } catch (e) { console.error(e); toast('⚠️ El comando ha fallado'); }
    }

    const isCommandText = (v) => /^\/[^\s\/]/.test(v);

    // Captura en window: se ejecuta ANTES que los listeners del chat principal
    window.addEventListener('keydown', (e) => {
        if (e.target !== input || e.key !== 'Enter' || e.isComposing) return;
        const v = input.value.trim();
        if (!isCommandText(v)) return; // mensaje normal: lo gestiona el script principal
        e.preventDefault();
        e.stopImmediatePropagation();
        dispatch(v);
    }, true);

    window.addEventListener('click', (e) => {
        if (!sendBtn.contains(e.target)) return;
        const v = input.value.trim();
        if (!isCommandText(v)) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        dispatch(v);
    }, true);

    function dispatch(v) {
        if (menu.isOpen()) {
            const sel = menu.current();
            if (sel && !(v.toLowerCase() === '/' + sel.name && !sel.args)) { menu.pick(sel); return; }
        }
        input.value = '';
        menu.hide();
        execute(v);
    }

    return { processMessages, execute, menu };
}
