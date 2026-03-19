const express = require('express');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// 🌐 WEB MONITOR 
// ==========================================
app.get('/', (req, res) => {
    res.send(`
        <body style="background:#050510; color:#00ff9d; font-family:monospace; text-align:center; padding:50px;">
            <h2>🏛️ 𝐉𝐀𝐑𝐕𝐈𝐒 🤖 𝐈𝐍𝐒𝐓𝐈𝐓𝐔𝐓𝐈𝐎𝐍𝐀𝐋 𝐐𝐔𝐀𝐍𝐓 (𝐕𝟔.𝟎) 🏛️</h2>
            <p>Advanced PDF Trend Engine. Market Health Monitor Active.</p>
        </body>
    `);
});
app.listen(PORT, () => console.log(`🚀 JᴀʀᴠᎥຮ V6.0 Quant Algo listening on port ${PORT}`));

// ==========================================
// ⚙️ CONFIGURATION
// ==========================================
const TELEGRAM_BOT_TOKEN = "8155932977:AAGaXmv9U3pS9uovGV18pjOggB3VhLrBsjE"; 
const TARGET_CHATS = ["1669843747", "-1002613316641"];

let lastUpdateId = 0;

const WINGO_API = "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json?pageNo=1&pageSize=30";
const FUND_LEVELS = [33, 66, 130, 260, 550, 1100]; 

const HEADERS = { 
    "User-Agent": "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36", 
    "Accept": "application/json, text/plain, */*", 
    "Origin": "https://www.dmwin2.com", 
    "Referer": "https://www.dmwin2.com/",
    "Accept-Language": "en-US,en;q=0.9,hi;q=0.8",
    "Connection": "keep-alive"
}; 

// ==========================================
// 🧠 MEMORY & STATE
// ==========================================
const STATE_FILE = './jarvis_state.json'; 
let state = { 
    lastProcessedIssue: null, 
    activePrediction: null, 
    totalSignals: 0, 
    wins: 0, 
    lossStreak: 0,
    isStarted: false, 
    currentLevel: 0,
    waitCount: 0,
    skipStreak: 0,
    cooldownCycles: 0,
wasOverheated: false,
recoveryMode: false,
shockLockIssue: null,
cooldownLockIssue: null,
patternStats: {},
lastKiller: null,
patternRevenge: null,
marketMakerLockIssue: null,
liquidityLockIssue: null
};

function loadState() { 
    if (fs.existsSync(STATE_FILE)) { 
        try { state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } 
        catch(e) { console.log("Memory reset."); } 
    } 
} 
function saveState() { fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2)); } 
loadState(); 

async function sendTelegram(text) { 
    for (let chat_id of TARGET_CHATS) { 
        try { 
            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({
                    chat_id: chat_id,
                    text: text,
                    parse_mode: 'HTML',
                    reply_markup: {
                        keyboard: [
                            ["📊 Stats", "❤️ Health"],
                            ["🧠 Patterns", "⚙️ System"]
                        ],
                        resize_keyboard: true
                    }
                })
            }); 
        } catch(e) {} 
    } 
}

async function sendStats(chat_id){

    let msg = `🧠 <b>JARVIS AI STATISTICS TERMINAL</b>\n`;
    msg += dividerVersion();

    const accuracy = state.totalSignals > 0
        ? Math.round((state.wins/state.totalSignals)*100)
        : 100;

    msg += `📊 <b>System Performance</b>\n`;
    msg += `Signals : ${state.totalSignals}\n`;
    msg += `Wins    : ${state.wins}\n`;
    msg += `Accuracy: ${accuracy}%\n\n`;

    msg += `🧠 <b>Pattern Intelligence</b>\n`;

    const patterns = state.patternStats;

    if(Object.keys(patterns).length === 0){
        msg += `No pattern data yet.\n`;
    }else{

        for(const p in patterns){

            const s = patterns[p];
            const total = s.wins + s.losses;
            const winrate = total ? Math.round((s.wins/total)*100) : 0;

            msg += `\n<b>${p}</b>\n`;
            msg += `Wins        : ${s.wins}\n`;
            msg += `Losses      : ${s.losses}\n`;
            msg += `Winrate     : ${winrate}%\n`;
            msg += `LadderFails : ${s.ladderFails}\n`;
        }
    }

    msg += dividerOnline();
    msg += `⚙️ <i>Adaptive Learning Engine Active</i>`;

    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
    chat_id,
    text:msg,
    parse_mode:"HTML",
    reply_markup:{
        keyboard:[
            ["📊 Stats","❤️ Health"],
            ["🧠 Patterns","⚙️ System"]
        ],
        resize_keyboard:true
    }
})
    });
}

async function sendHealth(chat_id){

    const heat = getHeatMeter();
    const market = getMarketHealth();

    let msg = `🧠 <b>JARVIS MARKET HEALTH TERMINAL</b>\n`;
    msg += dividerVersion();

    msg += `📊 <b>Market Status</b>\n`;
    msg += `Health : ${market}\n`;
    msg += `Heat   : ${heat.bars} (${heat.label})\n\n`;

    msg += `⚙️ <b>System State</b>\n`;
    msg += `Martingale Level : ${state.currentLevel + 1}\n`;
    msg += `Wait Cycles      : ${state.waitCount}\n`;
    msg += `Cooldown Cycles  : ${state.cooldownCycles}\n`;

    msg += dividerOnline();

    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
    chat_id,
    text:msg,
    parse_mode:"HTML",
    reply_markup:{
        keyboard:[
            ["📊 Stats","❤️ Health"],
            ["🧠 Patterns","⚙️ System"]
        ],
        resize_keyboard:true
    }
})
    });
}

async function sendPatterns(chat_id){

    let msg = `🧠 <b>JARVIS PATTERN INTELLIGENCE</b>\n`;
    msg += dividerVersion();

    const patterns = state.patternStats;

    if(Object.keys(patterns).length === 0){
        msg += `No patterns recorded yet.\n`;
    } else {

        for(const p in patterns){

            const s = patterns[p];
            const total = s.wins + s.losses;
            const winrate = total ? Math.round((s.wins/total)*100) : 0;

            msg += `\n<b>${p}</b>\n`;
            msg += `Winrate : ${winrate}%\n`;
            msg += `Trades  : ${total}\n`;
            msg += `Fails   : ${s.ladderFails}\n`;
        }
    }

    msg += dividerOnline();

    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
    chat_id,
    text:msg,
    parse_mode:"HTML",
    reply_markup:{
        keyboard:[
            ["📊 Stats","❤️ Health"],
            ["🧠 Patterns","⚙️ System"]
        ],
        resize_keyboard:true
    }
})
    });
}

async function sendSystem(chat_id){

    let msg = `⚙️ <b>JARVIS SYSTEM CORE</b>\n`;
    msg += dividerVersion();

    msg += `Active Prediction : ${state.activePrediction ? "YES" : "NONE"}\n`;
    msg += `Current Level     : ${state.currentLevel + 1}\n`;
    msg += `Loss Streak       : ${state.lossStreak}\n`;
    msg += `Skip Streak       : ${state.skipStreak}\n`;
    msg += `Recovery Mode     : ${state.recoveryMode ? "ON" : "OFF"}\n`;

    msg += dividerOnline();

    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
    chat_id,
    text:msg,
    parse_mode:"HTML",
    reply_markup:{
        keyboard:[
            ["📊 Stats","❤️ Health"],
            ["🧠 Patterns","⚙️ System"]
        ],
        resize_keyboard:true
    }
})
    });
}

function dividerCore(){
    return `<pre>⟡ ════════ 💀 𝐉𝐀𝐑𝐕𝐈𝐒 𝐂𝐎𝐑𝐄 ════════ ⟡</pre>\n`;
}

function dividerOnline(){
    return `<pre>⟡ ════════ 🤖 𝐉𝐀𝐑𝐕𝐈𝐒 𝐎𝐍𝐋𝐈𝐍𝐄 ════════ ⟡</pre>\n`;
}

function dividerVersion(){
    return `<pre>⟡ ════════════ 🚀 𝐕𝟗.𝟎 ════════════ ⟡</pre>\n`;
}

if (!state.isStarted) { 
    state.isStarted = true; 
    saveState(); 
    let bootMsg = `⚙️ <b>𝐉𝐀𝐑𝐕𝐈𝐒 𝐂𝐎𝐑𝐄 : 𝐈𝐍𝐈𝐓𝐈𝐀𝐋𝐈𝐙𝐈𝐍𝐆</b> ⚙️\n⟡ ═══════ 🤖 𝐉𝐀𝐑𝐕𝐈𝐒 𝐎𝐍𝐋𝐈𝐍𝐄 ═══════ ⟡\n\n🛡️ <i>Market Health Monitor Active.</i>\n📏 <i>Size-Only Quantitative Logic Loaded.</i>\n📈 <i>11/11 Master Trends Calibrated.</i>\n\n⟡ ════════════🚀 𝐕𝟗.𝟎 ════════════ ⟡`; 
    sendTelegram(bootMsg); 
} 

// ==========================================
// 📊 MARKET HEALTH MONITOR
// ==========================================
function getMarketHealth() {
    if (state.currentLevel === 0 || state.currentLevel === 1) return "STABLE ♻️";
    if (state.currentLevel === 2 || state.currentLevel === 3) return "VOLATILE 🌕";
    return "DANGEROUS 🩸";
}

function getHeatMeter(){

    let heat = 0;

    // Loss escalation increases heat
    heat += state.currentLevel * 1.5;

    // Waiting cools heat
    heat -= Math.min(state.waitCount, 3);

    // Clamp
    heat = Math.max(0, Math.min(5, Math.round(heat)));

    const bars = "█".repeat(heat) + "░".repeat(5 - heat);

    let label = "Calm";

    if(heat >= 4) label = "Overheated";
    else if(heat >= 2) label = "Trend Building";

    // ==========================
    // 🔥 HEAT MEMORY TRACKING
    // ==========================
    if(label === "Overheated"){
        state.wasOverheated = true;
        state.cooldownCycles = 0;
    }

    if(state.wasOverheated && label !== "Overheated"){
        state.cooldownCycles++;
    }

    return {
        bars,
        label
    };
}

function heatLock(){

    const heat = getHeatMeter();

    if(heat.label === "Overheated"){
        return {
            blocked: true,
            reason: "Heat Lock Active"
        };
    }

    return { blocked:false };
}

function cooldownGate(){

    const heat = getHeatMeter();

    if(state.wasOverheated){

        if(state.cooldownCycles < 2){
            return {
                blocked:true,
                reason:"Cooldown Stabilizing"
            };
        }

        state.wasOverheated = false;
        state.cooldownCycles = 0;
    }

    return { blocked:false };
}

function shockTrap(sizesFull){

    if(sizesFull.length < 6){
        return { trapped:false };
    }

    let sizes = sizesFull.slice(0,6);

    let last = sizes[0];
    let prevStreak = 1;

    for(let i=1;i<5;i++){
    if(sizes[i] === sizes[i-1]) prevStreak++;
    else break;
}

    const heat = getHeatMeter();

    // FAKE BREAKOUT CONDITIONS

    // Calm market but sudden spike
    if(heat.label === "Calm" && prevStreak >= 4){
        if(sizes[0] !== sizes[1]){
            return { trapped:true, reason:"𝐒𝐔𝐃𝐃𝐄𝐍 𝐒𝐏𝐈𝐊𝐄 𝐀𝐅𝐓𝐄𝐑 𝐂𝐀𝐋𝐌" };
        }
    }

    // Overheated market reversal spike
    if(heat.label === "Overheated" && sizes[0] !== sizes[1]){
        return { trapped:true, reason:"Heat Reversal Trap" };
    }

    return { trapped:false };
}

function liquidityTrap(sizesFull){

    if(sizesFull.length < 6){
        return { trapped:false };
    }

    let sizes = sizesFull.slice(0,8);

    const pattern = sizes.slice(0,5).join('');
    const prev = sizes[5];

    if(pattern === "BBBBBS" && prev === 'B'){
        return { trapped:true, reason:"Liquidity Trap (BBBB→S)" };
    }

    if(pattern === "SSSSSB" && prev === 'S'){
        return { trapped:true, reason:"Liquidity Trap (SSSS→B)" };
    }

    return { trapped:false };
}

function getConfidence(patternName, patternLength, regime, gravityAligned){

    let score = 50;

    // Pattern strength
    if(patternLength >= 5) score += 20;
    else if(patternLength >= 4) score += 10;

    // Market regime
    if(regime === "TREND") score += 20;
    if(regime === "STABLE") score += 5;
    if(regime === "CHOP") score -= 25;

    // Gravity alignment
    if(gravityAligned) score += 10;

    // ==========================
    // 🧠 SELF LEARNING PATTERN AI
    // ==========================

    
    const stats = state.patternStats[patternName];

    if(stats){

        const total = stats.wins + stats.losses;

        if(total >= 15){

            const winrate = stats.wins / total;

            // Bad pattern
            if(winrate < 0.45){
                score -= 15;
            }

            // Good pattern
            if(winrate > 0.65){
                score += 10;
            }
        }
    }

    return Math.max(40, Math.min(95, score));
}

function regimeShield(sizesFull){

    let sizes = sizesFull.slice(0,13);

    // -------- FLIP DENSITY --------
    let flips = 0;
    for(let i = 0; i < sizes.length - 1; i++){
    if(sizes[i] !== sizes[i+1]) flips++;
}

    // -------- ALT DETECTION --------
    let altCount = 0;
for(let i = 0; i < sizes.length - 2; i++){
    if(sizes[i] !== sizes[i+1] && sizes[i+1] !== sizes[i+2]) altCount++;
}

    // -------- MOMENTUM CHECK --------
    let streak = 1;
    for(let i=1;i<6;i++){
        if(sizes[i] === sizes[0]) streak++;
        else break;
    }

    // -------- EXPANSION CHECK --------
    let expansion = false;
    if(
        sizes.slice(0,5).join('') === 'BBBBS' ||
        sizes.slice(0,5).join('') === 'SSSSB'
    ){
        expansion = true;
    }

    // -------- DECISION --------
    if(flips >= 7){
    return { tradable:false, reason:"Flip Storm" };
}

if(altCount >= 4){
    return { tradable:false, reason:"Alternation Trap" };
}

    if(expansion){
        return { tradable:false, reason:"Expansion Chaos" };
    }

    if(streak >= 5){
        return { tradable:true, reason:"Strong Trend" };
    }

    return { tradable:true, reason:"Stable Flow" };
}

function survivalReset(regime, confidence){

    if(regime === "CHOP" && state.currentLevel >= 2){
    state.currentLevel = 0;
    sendTelegram("🛡️ <b>SURVIVAL RESET</b> – Chop detected. Level cleared.");
    return true;
}

    if(confidence < 50 && state.currentLevel >= 2){
    state.currentLevel = 1; // reduce risk instead of reset
    return true;
}

    return false;
}

function recordPattern(pattern, win){

    if(!pattern) return;

    // Create pattern record if not exist
    if(!state.patternStats[pattern]){
        state.patternStats[pattern] = {
            wins: 0,
            losses: 0,
            ladderFails: 0,
            cooldown: 0,
            lastSeen: Date.now()
        };
    }

    const stats = state.patternStats[pattern];

    // Update win/loss
    if(win){
        stats.wins++;
    }else{
        stats.losses++;
    }

    // Update last seen time
    stats.lastSeen = Date.now();

    // Reduce cooldown gradually
    if(stats.cooldown && stats.cooldown > 0){
        stats.cooldown--;
    }

    saveState();
}

function detectKillerPattern(){

    let killer = null;
    let worstRate = 1;

    for(const p in state.patternStats){

        const s = state.patternStats[p];
        const total = s.wins + s.losses;

        if(total < 10) continue;

        const rate = s.wins / total;

        if(rate < worstRate){
            worstRate = rate;
            killer = p;
        }
    }

    return killer;
}

function evolvePattern(pattern, confidence){

    const stats = state.patternStats[pattern];

    if(!stats) return confidence;

    const total = stats.wins + stats.losses;

    if(total < 12) return confidence;

    const winrate = stats.wins / total;

    if(winrate >= 0.65){
        confidence += 12;
    }
    else if(winrate < 0.50){
        confidence -= 15;
    }

    if(winrate < 0.35){

        if(stats.cooldown === 0){

            stats.cooldown = 30;

            sendTelegram(
`☠️ <b>PATTERN DISABLED</b>

Pattern: ${pattern}

Winrate: ${Math.round(winrate*100)}%

System cooling this pattern.`
            );

            saveState();
        }

        return 0;
    }

    return confidence;
}

// 🔥 ADD THIS RIGHT HERE
function patternBooster(patternName, confidence){

    const stats = state.patternStats[patternName];

    if(!stats) return confidence;

    const total = stats.wins + stats.losses;

    if(total < 10) return confidence;

    const winrate = stats.wins / total;

    if(winrate >= 0.70){
        confidence += 10;
    }

    if(winrate >= 0.80){
        confidence += 20;
    }

    return confidence;
}

function quantumPatternEngine(patternName, sizes){

    // last 3 momentum
    const last3 = sizes.slice(0,3).join('');

    // pattern alignment score
    let score = 0;

    // trend continuation bias
    if(patternName === "SSSBB" && last3 === "BBB"){
        score += 12;
    }

    if(patternName === "BBBSS" && last3 === "SSS"){
        score += 12;
    }

    // reversal exhaustion
    if(patternName === "BBSS" && last3 === "SSB"){
        score += 8;
    }

    if(patternName === "SSBB" && last3 === "BBS"){
        score += 8;
    }

    // alternating stabilization
    if(patternName === "BSBS" && last3 === "SBS"){
        score += 6;
    }

    if(patternName === "SBSB" && last3 === "BSB"){
        score += 6;
    }

    return score;
}

function patternStrengthEngine(patternName, sizes){

    let score = 0;

    const last5 = sizes.slice(0,5).join('');
    const last3 = sizes.slice(0,3).join('');

    // trend continuation boost
    if(patternName === "SSSBB" && last3 === "BBB"){
        score += 10;
    }

    if(patternName === "BBBSS" && last3 === "SSS"){
        score += 10;
    }

    // exhaustion detection
    if(patternName === "BBSS" && last3 === "SSB"){
        score += 6;
    }

    if(patternName === "SSBB" && last3 === "BBS"){
        score += 6;
    }

    // alternating stabilization
    if(patternName === "BSBS" && last3 === "SBS"){
        score += 5;
    }

    if(patternName === "SBSB" && last3 === "BSB"){
        score += 5;
    }

    return score;
}

function marketMakerTrap(sizesFull){

    let sizes = sizesFull.slice(0,10);

    let flips = 0;

    for(let i = 0; i < sizes.length - 1; i++){
    if(sizes[i] !== sizes[i+1]) flips++;
}

    if(flips >= 9){
        return { trapped:true, reason:"Market Maker Flip Storm" };
    }

    return { trapped:false };
}

function flowPressure(sizesFull){

    let sizes = sizesFull.slice(0,10);

    let small = 0;
    let big = 0;

    for(let s of sizes){
        if(s === 'S') small++;
        else big++;
    }

    if(small >= 6) return "SELL_PRESSURE";
if(big >= 6) return "BUY_PRESSURE";

    return "NEUTRAL";
}

function elitePressure(sizesFull){

    let sizes = sizesFull.slice(0,9);

    let small = 0;
    let big = 0;

    for(let i=2;i<8;i++){
        if(sizes[i] === 'S') small++;
        else big++;
    }

    if(small >= 4) return "SELL";
    if(big >= 4) return "BUY";

    return "NEUTRAL";
}

function institutionalFlow(sizesFull){

    let sizes = sizesFull.slice(0,21);

    let small = 0;
    let big = 0;

    for(let s of sizes){

        if(s === 'S') small++;
        else big++;
    }

    if(big >= 13) return "INSTITUTIONAL_BUY";

    if(small >= 13) return "INSTITUTIONAL_SELL";

    return "BALANCED";
}

function blackSwanDetector(sizesFull){

    let sizes = sizesFull.slice(0,11);

    let small = 0;
    let big = 0;

    for(let s of sizes){

        if(s === 'S') small++;
        else big++;
    }

    if(big >= 8) return "EXTREME_BUY";

    if(small >= 8) return "EXTREME_SELL";

    return "NORMAL";
}

function entropyFilter(sizesFull){

    let sizes = sizesFull.slice(0,11);

    let flips = 0;

    for(let i = 0; i < sizes.length - 1; i++){
    if(sizes[i] !== sizes[i+1]) flips++;
}

    let small = sizes.filter(s=>s==='S').length;
    let big = sizes.filter(s=>s==='B').length;

    // randomness score
    let entropyScore = flips + Math.abs(small-big);

    if(entropyScore >= 13){
        return {
            blocked:true,
            reason:"High Entropy Market"
        };
    }

    return { blocked:false };
}

// ==========================================
// 📈 SMART 11-PATTERN ALGORITHM (V6.0 DEEP SCAN)
// ==========================================

function analyzeTrendsV2(sizesFull){

if(sizesFull.length < 6){
    return {
        action:"WAIT",
        regime:"NO_DATA",
        confidence:0,
        reason:"Insufficient Data"
    };
}

    let sizes = sizesFull.slice(0,6);
    
    // 🚫 OVEREXTENSION BLOCK (ANTI TREND TRAP)
let sameCount = 1;

for(let i=1;i<6;i++){
    if(sizes[i] === sizes[0]) sameCount++;
    else break;
}

if(sameCount >= 5){
    return {
        action:"WAIT",
        regime:"OVEREXTENDED",
        confidence:0,
        reason:"Trend Exhausted (5 streak)"
    };
}

    const last5 = sizes.slice(0,5).join('');

    let decision = null;
    let pattern = null;

    // 🔥 PATTERN ENGINE

// REVERSAL / HYBRID (MAIN)
if(last5 === "SSSBB" || last5 === "SSBB" || last5 === "SBB"){
    decision = "BIG";
    pattern = "SSSBB";
}
else if(last5 === "BBBSS" || last5 === "BBSS" || last5 === "BSS"){
    decision = "SMALL";
    pattern = "BBBSS";
}


// ⚡ MICRO REVERSAL (SAFE ENTRY)
else if(last5 === "BBBSB"){
    decision = "SMALL";
    pattern = "BBBSB";
}
else if(last5 === "SSSBS"){
    decision = "BIG";
    pattern = "SSSBS";
}

    if(!decision){
        return {
            action:"WAIT",
            regime:"NO_PATTERN",
            confidence:0,
            reason:"No Clean Pattern"
        };
    }

    let last = sizes[0];
    let prev = sizes[1];

    let confidence = 65;

// ⚡ MOMENTUM (NO BLOCK)
if(decision === "BIG"){
    if(last !== 'B' && prev !== 'B'){
        confidence -= 15;
    }
}

if(decision === "SMALL"){
    if(last !== 'S' && prev !== 'S'){
        confidence -= 15;
    }
}

// 💧 LIQUIDITY TRAP
if(last5 === "BBBBS" || last5 === "SSSSB"){
    return {
        action:"WAIT",
        regime:"LIQUIDITY_TRAP",
        confidence:0,
        reason:"Trap Detected"
    };
}

// ==========================
// 🧠 AI BOOST ENGINES HERE
// ==========================
confidence += quantumPatternEngine(pattern, sizes);
confidence += patternStrengthEngine(pattern, sizes);
confidence = patternBooster(pattern, confidence);
confidence = evolvePattern(pattern, confidence);

// 🎯 FINAL CLAMP (VERY IMPORTANT)
confidence = Math.max(40, Math.min(95, confidence));

// ==========================

return {
    action: decision,
    regime:"STABLE",
    confidence,
    reason: pattern
};
}


// ========================================== 
// ⚙️ SERVER MAIN LOOP 
// ========================================== 
let isProcessing = false; 

function getSize(n) { return n <= 4 ? "SMALL" : "BIG"; } 

async function tick() { 
    if(isProcessing) return; 
    isProcessing = true; 
    
    try { 
        const res = await fetch(WINGO_API + "&_t=" + Date.now(), { headers: HEADERS, timeout: 8000 }); 
        const rawText = await res.text();
        let data;
        
        try {
            data = JSON.parse(rawText);
        } catch (parseError) {
            console.log(`\n[FIREWALL BLOCKED] The casino returned a security page instead of JSON.`);
            throw new Error("Casino Firewall Blocked Connection.");
        }

        if(!data.data || !data.data.list) throw new Error("Empty API List"); 
        
        const list = data.data.list;
        const sizesFull = list.map(i => Number(i.number) <= 4 ? 'S' : 'B');
        const latestIssue = list[0].issueNumber; 
        const targetIssue = (BigInt(latestIssue) + 1n).toString(); 
        
        if(state.activePrediction && BigInt(latestIssue) >= BigInt(state.activePrediction.period) + 2n) { 
            state.activePrediction = null; saveState(); 
        } 
        
        if(state.activePrediction) { 
            let timeElapsed = Date.now() - state.activePrediction.timestamp;
            if (timeElapsed > 4 * 60 * 1000) { 
                state.activePrediction = null; saveState();
                return;
            }

            if(BigInt(latestIssue) >= BigInt(state.activePrediction.period)) { 
                const resultItem = list.find(i => i.issueNumber === state.activePrediction.period); 
                if(resultItem) { 
    let actualNum = Number(resultItem.number); 
    let actualResult = getSize(actualNum); 
    let isWin = (actualResult === state.activePrediction.pred); 

    recordPattern(state.activePrediction.pattern, isWin);
                    
    state.totalSignals++;

    if(isWin){

    state.wins++;
    state.currentLevel = 0;
    state.lossStreak = 0;

    state.patternRevenge = null;

}else{

    state.currentLevel++;
    state.lossStreak++;

    state.patternRevenge = state.activePrediction.pattern;

    // 🛡 Martingale protection
    if(state.lossStreak >= 3){
    state.waitCount += 2;
}

}

    if(state.currentLevel >= FUND_LEVELS.length - 1){

        if(state.activePrediction && state.activePrediction.pattern){

            const p = state.activePrediction.pattern;

            if(state.patternStats[p]){
                state.patternStats[p].ladderFails++;
            }
        }

        state.currentLevel = Math.floor(FUND_LEVELS.length / 2);
        state.recoveryMode = true;
        state.wasOverheated = true;
        state.cooldownCycles = 0;

        await sendTelegram(`🛡️ <b>RECOVERY MODE ACTIVATED</b>
Post-loss survival engaged.
Cooling before next entry.`);
    }

    let currentAccuracy = state.totalSignals > 0 
        ? Math.round((state.wins / state.totalSignals) * 100) 
        : 100; 

    let marketHealth = getMarketHealth();
    const heat = getHeatMeter();
                    
    let resMsg = isWin 
        ? `✅ <b>𝐏𝐑𝐎𝐅𝐈𝐓 𝐒𝐄𝐂𝐔𝐑𝐄𝐃</b> ✅\n` 
        : `❌ <b>𝐓𝐀𝐑𝐆𝐄𝐓 𝐌𝐈𝐒𝐒𝐄𝐃</b> ❌\n`; 

    resMsg += dividerVersion(); 
    resMsg += `🎯 <b>𝐏𝐞𝐫𝐢𝐨𝐝 :</b> <code>${state.activePrediction.period.slice(-4)}</code>\n`; 
    resMsg += `🎲 <b>𝐑𝐞𝐬𝐮𝐥𝐭 :</b> ${actualNum} (${actualResult})\n`; 
    resMsg += `📈 <b>𝐌𝐚𝐫𝐤𝐞𝐭 𝐇𝐞𝐚𝐥𝐭𝐡 :</b> ${marketHealth}\n`;
    resMsg += `🔥 <b>𝐌𝐚𝐫𝐤𝐞𝐭 𝐇𝐞𝐚𝐭 :</b> ${heat.bars} (${heat.label})\n`;
                    
    if(!isWin) {
        resMsg += `🛡️ <b>𝐒𝐭𝐚𝐭𝐮𝐬 :</b> 𝐄𝐒𝐂𝐀𝐋𝐀𝐓𝐈𝐍𝐆 (𝐋𝐞𝐯𝐞𝐥 ${state.currentLevel + 1})\n`; 
    }

    resMsg += `🏆 <b>𝐖𝐢𝐧 𝐑𝐚𝐭𝐞 :</b> ${currentAccuracy}%\n`;
    resMsg += dividerOnline(); 
                    
    await sendTelegram(resMsg);

    const killer = detectKillerPattern();

    if(killer && state.lastKiller !== killer){

        state.lastKiller = killer;
        saveState();

        await sendTelegram(
`🧠 <b>PATTERN ANALYSIS</b>

⚠️ Weak Pattern Detected

${killer}

Winrate below system average.
Consider disabling this pattern.`
        );
    }

}   // ✅ CLOSE if(resultItem) HERE
                state.activePrediction = null; saveState(); 
            } 
        } 
        
        if(state.lastProcessedIssue !== latestIssue) {


    if(!state.activePrediction) {

    // 🚫 ENTROPY BLOCK
const entropy = entropyFilter(sizesFull);
if(entropy.blocked){

    if(state.cooldownLockIssue !== latestIssue){
        state.cooldownLockIssue = latestIssue;

        await sendTelegram(`🧠 <b>ENTROPY BLOCK</b>\n⚠️ ${entropy.reason}`);
    }

    state.waitCount++;
    return;
}

// ⚡ SHOCK TRAP
const shock = shockTrap(sizesFull);
if(shock.trapped){

    if(state.shockLockIssue !== latestIssue){
        state.shockLockIssue = latestIssue;

        await sendTelegram(`⚡ <b>SHOCK TRAP DETECTED</b>\n🧠 ${shock.reason}`);
    }

    state.waitCount++;
    return;
}

// 💧 LIQUIDITY TRAP
const liq = liquidityTrap(sizesFull);
if(liq.trapped){

    if(state.liquidityLockIssue !== latestIssue){
        state.liquidityLockIssue = latestIssue;

        await sendTelegram(`💧 <b>LIQUIDITY TRAP</b>\n🧠 ${liq.reason}`);
    }

    state.waitCount++;
    return;
}

// 🏦 MARKET MAKER TRAP
const mm = marketMakerTrap(sizesFull);
if(mm.trapped){

    if(state.marketMakerLockIssue !== latestIssue){
        state.marketMakerLockIssue = latestIssue;

        await sendTelegram(`🏦 <b>MARKET MAKER DETECTED</b>\n🧠 ${mm.reason}`);
    }

    state.waitCount++;
    return;
}

// ✅ THEN analyze
const signal = analyzeTrendsV2(sizesFull);


if(signal.action !== "WAIT"){

    if(survivalReset(signal.regime, signal.confidence)){
        console.log("🛡️ Survival Reset Triggered");
    }

    if(signal.regime === "CHOP"){
        state.skipStreak++;
        if(state.skipStreak < 3){
            return;
        }
    } else {
        state.skipStreak = 0;
    }
}
                let marketHealth = getMarketHealth();
                const heat = getHeatMeter();
                
                console.log(`\n[${new Date().toLocaleTimeString()}] 🎯 Period ${targetIssue.slice(-4)} | ALGO DECISION:`, signal);
                
                if(signal && signal.action === "WAIT") {

   

    state.waitCount++;

    if (state.waitCount === 1 || state.waitCount % 15 === 0) {

        let msg = `📡 <b>𝐉𝐀𝐑𝐕𝐈𝐒 𝐌𝐀𝐑𝐊𝐄𝐓 𝐒𝐂𝐀𝐍</b> 📡\n`;
        msg += dividerVersion();
        msg += `🎯 𝐏𝐞𝐫𝐢𝐨𝐝: <code>${targetIssue.slice(-4)}</code>\n`;
        msg += `🎬 <b>𝐀𝐜𝐭𝐢𝐨𝐧:</b> SKIP\n`;
        msg += `🛡️ <b>𝐑𝐞𝐠𝐢𝐦𝐞:</b> ${signal.regime}\n`;
        msg += `🔥 <b>𝐌𝐚𝐫𝐤𝐞𝐭 𝐇𝐞𝐚𝐭 :</b> ${heat.bars} (${heat.label})\n`;
        msg += `🧠 <b>𝐑𝐞𝐚𝐬𝐨𝐧:</b> <i>${signal.reason}</i>\n`;
        msg += `🤫 <i>(Silencing further scans to prevent spam)</i>`;
        msg += dividerOnline();

        await sendTelegram(msg);
    }

    saveState();
} else if(signal && signal.action !== "WAIT") {

    const heatBlock = heatLock();

    if(heatBlock.blocked){

    state.waitCount++;

    let msg = `📛 <b>𝐇𝐄𝐀𝐓 𝐋𝐎𝐂𝐊 𝐀𝐂𝐓𝐈𝐕𝐄</b> 📛\n`;
    msg += dividerVersion();
    msg += `🎯 𝐏𝐞𝐫𝐢𝐨𝐝: <code>${targetIssue.slice(-4)}</code>\n`;
    msg += `🔥 <b>Market Status:</b> OVERHEATED\n`;
    msg += `🛡️ <b>Protection:</b> Trade Blocked\n`;
    msg += `📉 <i>Cooling required before next entry</i>`;
    msg += dividerOnline();

    await sendTelegram(msg);

    saveState();
    return;
}

state.waitCount = 0;
                    if(state.recoveryMode){
    state.currentLevel = Math.max(1, Math.floor(FUND_LEVELS.length / 2));
    state.recoveryMode = false;
}

let betAmount = FUND_LEVELS[state.currentLevel]; 
                    
                    // 🏛️ V6.0 TERMINAL UI UPDATE
                    let msg = `👾 <b>𝐉𝐀𝐑𝐕𝐈𝐒 𝐒𝐈𝐆𝐍𝐀𝐋 : 𝐃𝐄𝐓𝐄𝐂𝐓𝐄𝐃</b> 👾\n`; 
                    msg += dividerOnline(); 
                    msg += `🎯 <b>𝐓𝐚𝐫𝐠𝐞𝐭 𝐏𝐞𝐫𝐢𝐨𝐝 :</b> <code>${targetIssue.slice(-4)}</code>\n`; 
                    msg += `📈 <b>𝐌𝐚𝐫𝐤𝐞𝐭 𝐇𝐞𝐚𝐥𝐭𝐡 :</b> ${marketHealth}\n`;
                    msg += `🔥 <b>𝐌𝐚𝐫𝐤𝐞𝐭 𝐇𝐞𝐚𝐭 :</b> ${heat.bars} (${heat.label})\n`;
                    msg += `📊 <b>𝐌𝐞𝐭𝐫𝐢𝐜 :</b> SIZE ONLY 📏\n`; 
                    msg += `🛡️ <b>𝐑𝐞𝐠𝐢𝐦𝐞 :</b> ${signal.regime}\n`;
                    msg += dividerVersion();
                    msg += `🔮 <b>𝐐𝐮𝐚𝐧𝐭 𝐒𝐢𝐠𝐧𝐚𝐥 : ${signal.action}</b>\n`;
                    msg += `💎 <b>𝐄𝐧𝐭𝐫𝐲 𝐋𝐞𝐯𝐞𝐥 :</b> Level ${state.currentLevel + 1}\n`; 
                    msg += `💰 <b>𝐈𝐧𝐯𝐞𝐬𝐭𝐦𝐞𝐧𝐭 :</b> Rs. ${betAmount}\n`; 
                    msg += `🧠 <b>𝐂𝐡𝐚𝐫𝐭 𝐋𝐨𝐠𝐢𝐜 :</b> <i>${signal.reason}</i>\n`;
msg += `📊 <b>𝐂𝐨𝐧𝐟𝐢𝐝𝐞𝐧𝐜𝐞 :</b> ${signal.confidence}%`; 
                    msg += dividerCore();
                    await sendTelegram(msg); 
                    state.activePrediction = {
    period: targetIssue,
    pred: signal.action,
    pattern: signal.reason,
    type: "SIZE",
    conf: 100,
    timestamp: Date.now()
}; 
                    saveState(); 
                } 
            } 
            state.shockLockIssue = null;
state.cooldownLockIssue = null;
state.marketMakerLockIssue = null;
state.liquidityLockIssue = null;
state.lastProcessedIssue = latestIssue;
saveState();
        } 
    } catch (e) {
        console.log(`[API ERROR] ${e.message}`);
    } finally { 
        isProcessing = false; 
    } 
} 

// ==========================
// 🧠 TELEGRAM COMMAND HANDLER
// ==========================
async function checkCommands(){

    try{

        const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=${lastUpdateId+1}`);
        const data = await res.json();

        if(!data.result) return;

        for(const update of data.result){

            lastUpdateId = update.update_id;

            if(!update.message || !update.message.text) continue;

            const chat_id = update.message.chat.id;
            const text = (update.message.text || "").trim();

            if(text === "/stats" || text === "📊 Stats"){
    await sendStats(chat_id);
}

if(text === "/health" || text === "❤️ Health"){
    await sendHealth(chat_id);
}

if(text === "🧠 Patterns"){
    await sendPatterns(chat_id);
}

if(text === "⚙️ System"){
    await sendSystem(chat_id);
}
        }

    }catch(e){}
}


// ==========================================
// ⚙️ SYSTEM LOOPS
// ==========================================

setInterval(checkCommands,5000);   // listen for /stats
setInterval(tick,3000);            // main trading engine
tick();
