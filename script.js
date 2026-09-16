const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbylTS6d_ZhPsDYmUqkVglkBPrS2dJVBNwDSehM2oCIqAb-FVXLC5AHRcTqPfJZF7G9m/exec";

const TEACHER_PIN = "111114";
let isAdmin = false;

function toggleAdmin() {
    if (!isAdmin) {
        const entered = prompt("Enter Teacher PIN to unlock controls:");
        if (entered === TEACHER_PIN) {
            isAdmin = true;
            document.body.classList.add('is-admin');
            document.getElementById('adminBtn').innerText = "🔓 Lock Admin";
            document.getElementById('adminBtn').classList.add('logged-in');
            document.getElementById('class1Name').removeAttribute('readonly');
            document.getElementById('class2Name').removeAttribute('readonly');
            renderSetup();
            eventNames.forEach(ev => { renderBracketUI(ev, 1); renderBracketUI(ev, 2); });
            renderGolf();
        } else if (entered !== null) {
            alert("Incorrect PIN.");
        }
    } else {
        isAdmin = false;
        document.body.classList.remove('is-admin');
        document.getElementById('adminBtn').innerText = "🔒 Teacher Mode";
        document.getElementById('adminBtn').classList.remove('logged-in');
        document.getElementById('class1Name').setAttribute('readonly', 'readonly');
        document.getElementById('class2Name').setAttribute('readonly', 'readonly');
        renderSetup();
        eventNames.forEach(ev => { renderBracketUI(ev, 1); renderBracketUI(ev, 2); });
        renderGolf();
    }
}

const canvaEmbeds = {
    'tug': `<div style="position: relative; width: 100%; height: 0; padding-top: 56.25%; margin-bottom: 0.9em; overflow: hidden; border-radius: 8px;"><iframe loading="lazy" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none;" src="https://www.canva.com/design/DAGPuw06Vbg/MofxFeGW2qlrcQ-WRj0Byw/view?embed" allowfullscreen></iframe></div>`,
    'dash': `<div style="position: relative; width: 100%; height: 0; padding-top: 56.25%; margin-bottom: 0.9em; overflow: hidden; border-radius: 8px;"><iframe loading="lazy" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none;" src="https://www.canva.com/design/DAGQY6uZjUo/Cj8F5p4lOJfDfDARLoPkpQ/view?embed" allowfullscreen></iframe></div>`,
    'relay': `<div style="position: relative; width: 100%; height: 0; padding-top: 56.25%; margin-bottom: 0.9em; overflow: hidden; border-radius: 8px;"><iframe loading="lazy" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none;" src="https://www.canva.com/design/DAGSPAOigYw/nyekGkUQcrwbQhUihX9tTg/view?embed" allowfullscreen></iframe></div>`,
    'athalon': `<div style="position: relative; width: 100%; height: 0; padding-top: 56.25%; margin-bottom: 0.9em; overflow: hidden; border-radius: 8px;"><iframe loading="lazy" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none;" src="https://www.canva.com/design/DAHVYHmP6Ws/JXAktKxThtY_arm3P2AeDA/view?embed" allowfullscreen></iframe></div>`,
    'golf': `<div style="position: relative; width: 100%; height: 0; padding-top: 56.25%; margin-bottom: 0.9em; overflow: hidden; border-radius: 8px;"><iframe loading="lazy" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none;" src="https://www.canva.com/design/DAGTlBnGYXk/94Mxt7VIN-O3aNTG-eO5IA/view?embed" allowfullscreen></iframe></div>`
};

const eventConfig = [
    { id: 'tug', title: 'Tug-o-War', relay: false },
    { id: 'dash', title: 'X-Meter Dash', relay: false },
    { id: 'relay', title: 'Robo-Relay', relay: true },
    { id: 'athalon', title: 'Robathalon', relay: false }
];

function buildBracketEventsHTML() {
    const container = document.getElementById('bracket-events-container');
    if (!container) return;

    let html = '';
    eventConfig.forEach(ev => {
        const embedHTML = canvaEmbeds[ev.id] ? `<div class="event-embed">${canvaEmbeds[ev.id]}</div>` : '';
        html += `
        <div id="event-${ev.id}" class="tab-content">
            <h2 style="text-align: center; margin-bottom: 5px;">${ev.title} ${ev.relay ? "(Paired Teams)" : ""}</h2>
            ${ev.relay ? "<p style='text-align: center; margin-bottom: 20px;'><em>Teams compete in pairs. Points awarded at the end will be given to BOTH teams in a paired slot.</em></p>" : ""}
            
            ${embedHTML}

            <div class="split-view">
                <!-- Class 1 (Guiendon) -->
                <div class="class-section c1-border">
                    <h3 class="title-c1">Guiendon</h3>
                    
                    <div class="timer-controls">
                        <strong>Bracket Timer:</strong>
                        <input type="number" id="min-${ev.id}-1" placeholder="Min" style="width: 55px;" min="0"> : 
                        <input type="number" id="sec-${ev.id}-1" placeholder="Sec" style="width: 55px;" min="0" max="59">
                        <button onclick="startBracketTimer('${ev.id}-1')" style="background-color: var(--green); padding: 5px 10px;">▶</button>
                        <button onclick="stopBracketTimer('${ev.id}-1')" style="background-color: var(--red); padding: 5px 10px;">■</button>
                        <div id="display-${ev.id}-1" class="timer-display">00:00.00</div>
                    </div>

                    <div class="controls" id="controls-${ev.id}-1"></div>
                    
                    <div class="bracket-wrapper" id="bracket-wrapper-${ev.id}-1">
                        <div id="bracket-${ev.id}-1" class="bracket"></div>
                        <div id="podium-overlay-${ev.id}-1" class="event-podium-overlay" style="display:none;"></div>
                    </div>
                    
                    <div id="status-${ev.id}-1" class="award-status">Points Not Awarded</div>
                    <div class="points-action-bar admin-only">
                        <button onclick="awardPoints('${ev.id}', 1)" class="points-btn">Award Points (5-3-1)</button>
                        <button onclick="revokePoints('${ev.id}', 1)" class="btn-warning">Rescore / Reset Points</button>
                    </div>
                </div>

                <!-- Class 2 (Vernon) -->
                <div class="class-section c2-border">
                    <h3 class="title-c2">Vernon</h3>
                    
                    <div class="timer-controls">
                        <strong>Bracket Timer:</strong>
                        <input type="number" id="min-${ev.id}-2" placeholder="Min" style="width: 55px;" min="0"> : 
                        <input type="number" id="sec-${ev.id}-2" placeholder="Sec" style="width: 55px;" min="0" max="59">
                        <button onclick="startBracketTimer('${ev.id}-2')" style="background-color: var(--green); padding: 5px 10px;">▶</button>
                        <button onclick="stopBracketTimer('${ev.id}-2')" style="background-color: var(--red); padding: 5px 10px;">■</button>
                        <div id="display-${ev.id}-2" class="timer-display">00:00.00</div>
                    </div>

                    <div class="controls" id="controls-${ev.id}-2"></div>
                    
                    <div class="bracket-wrapper" id="bracket-wrapper-${ev.id}-2">
                        <div id="bracket-${ev.id}-2" class="bracket"></div>
                        <div id="podium-overlay-${ev.id}-2" class="event-podium-overlay" style="display:none;"></div>
                    </div>
                    
                    <div id="status-${ev.id}-2" class="award-status">Points Not Awarded</div>
                    <div class="points-action-bar admin-only">
                        <button onclick="awardPoints('${ev.id}', 2)" class="points-btn">Award Points (5-3-1)</button>
                        <button onclick="revokePoints('${ev.id}', 2)" class="btn-warning">Rescore / Reset Points</button>
                    </div>
                </div>
            </div>
        </div>`;
    });

    container.innerHTML = html;
    const golfEmbed = document.getElementById('golf-canva-embed');
    if (golfEmbed && canvaEmbeds['golf']) {
        golfEmbed.innerHTML = canvaEmbeds['golf'];
    }
}

let currentYear = "2026";
const eventNames = ['tug', 'dash', 'athalon', 'relay'];

function createBlankTemplate() {
    return {
        class1Name: "Guiendon",
        class2Name: "Vernon",
        teams: [],
        events: {
            1: { tug: {}, dash: {}, athalon: {}, relay: {} },
            2: { tug: {}, dash: {}, athalon: {}, relay: {} }
        },
        awards: {
            1: { tug: null, dash: null, athalon: null, relay: null, golf: null },
            2: { tug: null, dash: null, athalon: null, relay: null, golf: null }
        },
        golfScores: {}
    };
}

let data = createBlankTemplate();
const activeTimers = {}; 
const manualModes = {}; 

function setCloudStatus(msg) {
    const el = document.getElementById('cloud-indicator');
    if (el) el.innerHTML = msg;
}

window.onload = function() {
    try {
        buildBracketEventsHTML();
        renderFullUI();

        const yInput = document.getElementById('yearInput');
        if (yInput) currentYear = yInput.value.trim() || "2026";

        setCloudStatus("⏳ Connecting to Sheet...");
        loadCurrentYear();
    } catch (e) {
        console.error("Startup error:", e);
    }
};

function renderFullUI() {
    try {
        const c1 = document.getElementById('class1Name');
        const c2 = document.getElementById('class2Name');
        if (c1) c1.value = data.class1Name || "Guiendon";
        if (c2) c2.value = data.class2Name || "Vernon";
        
        updateClassTitles();
        renderSetup();
        renderLeaderboards();
        eventNames.forEach(ev => { 
            getCleanOrExistingEvent(ev, 1);
            getCleanOrExistingEvent(ev, 2);
            renderBracketUI(ev, 1); 
            renderBracketUI(ev, 2); 
            updateStatusDisplay(ev, 1);
            updateStatusDisplay(ev, 2);
        });
        renderGolf();
        updateStatusDisplay('golf', 1);
        updateStatusDisplay('golf', 2);
    } catch (e) {
        console.error("Render error:", e);
    }
}

function loadCustomYear() {
    const yInput = document.getElementById('yearInput');
    if (!yInput || !yInput.value.trim()) return;
    currentYear = yInput.value.trim();
    loadCurrentYear();
}

function loadCurrentYear() {
    setCloudStatus(`⏳ Loading ${currentYear}...`);
    fetch(`${APPS_SCRIPT_URL}?action=loadYear&year=${encodeURIComponent(currentYear)}`)
        .then(res => res.json())
        .then(res => {
            if (res.status === "success" && res.data) {
                data = res.data;
                setCloudStatus(`💾 Last Saved: Synced (${currentYear})`);
            } else {
                data = createBlankTemplate();
                setCloudStatus(`💾 Last Saved: Initialized (${currentYear})`);
                triggerCloudSave(true);
            }
            renderFullUI();
        })
        .catch(() => {
            setCloudStatus("💾 Last Saved: Local cache");
            renderFullUI();
        });
}

let saveTimeout = null;
function saveData() {
    if (!isAdmin) return;
    const c1 = document.getElementById('class1Name');
    const c2 = document.getElementById('class2Name');
    if (c1) data.class1Name = c1.value;
    if (c2) data.class2Name = c2.value;
    renderFullUI();
    triggerCloudSave(false);
}

function triggerCloudSave(isManual = false) {
    if (!isAdmin) return;
    setCloudStatus(isManual ? "⏳ Saving now..." : "⏳ Autosaving...");

    if (saveTimeout) clearTimeout(saveTimeout);

    const execute = () => {
        fetch(APPS_SCRIPT_URL, {
            method: "POST",
            body: JSON.stringify({ action: "saveYear", year: currentYear, data: data })
        })
        .then(res => res.json())
        .then(res => {
            setCloudStatus(`💾 Last Saved: ${res.timestamp}`);
        })
        .catch(() => {
            setCloudStatus("💾 Last Saved: Synced locally");
        });
    };

    if (isManual) {
        execute();
    } else {
        saveTimeout = setTimeout(execute, 800);
    }
}

function forceSaveData() {
    if (!isAdmin) return;
    triggerCloudSave(true);
}

function promptArchiveYear() {
    const newYear = prompt("Enter the name for the new competition year tab (e.g. 2027):");
    if (!newYear || newYear.trim() === "") return;

    currentYear = newYear.trim();
    const yInput = document.getElementById('yearInput');
    if (yInput) yInput.value = currentYear;
    data = createBlankTemplate();

    setCloudStatus("⏳ Creating archive tab...");
    fetch(APPS_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({ action: "archiveYear", year: currentYear, data: data })
    })
    .then(res => res.json())
    .then(res => {
        alert(`Created and loaded year tab '${currentYear}' successfully!`);
        setCloudStatus(`💾 Last Saved: New Tab Created`);
        renderFullUI();
    })
    .catch(() => {
        setCloudStatus("💾 Last Saved: Failed archive");
    });
}

function formatMs(totalMs, includeMinutes = true) {
    if (totalMs < 0) totalMs = 0;
    const minutes = Math.floor(totalMs / 60000);
    const seconds = Math.floor((totalMs % 60000) / 1000);
    const hundredths = Math.floor((totalMs % 1000) / 10);
    const sStr = seconds.toString().padStart(2, '0');
    const msStr = hundredths.toString().padStart(2, '0');
    if (includeMinutes) {
        return `${minutes.toString().padStart(2, '0')}:${sStr}.${msStr}`;
    }
    return `${sStr}.${msStr}s`;
}

function playBeep(freq = 440, duration = 0.15) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
        osc.stop(ctx.currentTime + duration);
    } catch(e) { }
}

function playAirhorn() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const blasts = [
            { start: 0.0, dur: 0.12 }, { start: 0.16, dur: 0.12 },
            { start: 0.32, dur: 0.12 }, { start: 0.48, dur: 0.42 }
        ];
        blasts.forEach(b => {
            [466.16, 471.0, 700.0, 932.33].forEach(freq => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(freq, ctx.currentTime + b.start);
                osc.frequency.exponentialRampToValueAtTime(freq * 0.96, ctx.currentTime + b.start + b.dur);
                gain.gain.setValueAtTime(0.18, ctx.currentTime + b.start);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + b.start + b.dur);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + b.start);
                osc.stop(ctx.currentTime + b.start + b.dur);
            });
        });
    } catch(e) { }
}

let confettiAnimationId = null;
function launchConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
    const colors = ['#e31837', '#0033a0', '#009639', '#ffb81c', '#9b59b6', '#e67e22'];
    const particles = [];
    for (let i = 0; i < 65; i++) {
        particles.push({
            x: canvas.width / 2, y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 14, vy: (Math.random() - 0.8) * 12,
            size: Math.random() * 8 + 4, color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360, vRot: (Math.random() - 0.5) * 10
        });
    }
    if (confettiAnimationId) cancelAnimationFrame(confettiAnimationId);
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let activeCount = 0;
        particles.forEach(p => {
            p.x += p.vx; p.y += p.vy; p.vy += 0.28; p.vx *= 0.98; p.rotation += p.vRot;
            if (p.y < canvas.height + 20) {
                activeCount++;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                ctx.restore();
            }
        });
        if (activeCount > 0) confettiAnimationId = requestAnimationFrame(draw);
        else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    draw();
}

function clearConfetti() {
    if (confettiAnimationId) cancelAnimationFrame(confettiAnimationId);
    const canvas = document.getElementById('confetti-canvas');
    if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

function buildPodiumHTML(gold, silver, bronze, title = "Event Champions", isOverlay = false) {
    return `
        <div style="text-align: center; margin-bottom: 4px;">
            <h4 style="margin: 0; color: var(--blue); font-size: 15px; text-transform: uppercase;">🏆 ${title} 🏆</h4>
        </div>
        <div class="podium-container">
            <div class="podium-step step-silver">
                <div class="podium-team-title" title="${silver.name}">
                    ${silver.name}
                    ${silver.sub ? `<span class="podium-team-sub">${silver.sub}</span>` : ''}
                </div>
                <div class="podium-block">2</div>
            </div>
            <div class="podium-step step-gold">
                <div class="podium-team-title" title="${gold.name}" style="border-color: #cca000; background: #fffdf0;">
                    ${gold.name}
                    ${gold.sub ? `<span class="podium-team-sub" style="font-weight:bold; color:#cca000;">${gold.sub}</span>` : ''}
                </div>
                <div class="podium-block">1</div>
            </div>
            <div class="podium-step step-bronze">
                <div class="podium-team-title" title="${bronze.name}">
                    ${bronze.name}
                    ${bronze.sub ? `<span class="podium-team-sub">${bronze.sub}</span>` : ''}
                </div>
                <div class="podium-block">3</div>
            </div>
        </div>
        ${isOverlay ? `<div class="podium-hover-hint">🔍 Hover cursor over bracket to reveal & edit/rescore</div>` : ''}
    `;
}

function getTeamNameDisplay(idData) {
    if (idData === "?") return "???"; 
    if (idData === 'BYE' || idData === '') return idData === '' ? '...' : 'BYE';
    if (Array.isArray(idData)) {
        return idData.map(i => i === 'BYE' ? 'BYE' : (data.teams.find(t => t.id === i)?.name || "Deleted")).join(' & ');
    }
    return data.teams.find(t => t.id === idData)?.name || "Deleted";
}

let currentMatchContext = null;
let modalTimerInterval = null;
let dualSplitTimes = { 0: null, 1: null };
let dualSplitStrings = { 0: "", 1: "" };

function openMatchTimer(eventId, classId, matchId, matchTitle) {
    if (!isAdmin) return;
    const ev = getCleanOrExistingEvent(eventId, classId);
    const t1 = ev[matchId][0], t2 = ev[matchId][1];
    if (!isValidTeam(t1) || !isValidTeam(t2)) return;

    currentMatchContext = { eventId, classId, matchId, matchTitle, t1, t2 };
    dualSplitTimes = { 0: null, 1: null };
    dualSplitStrings = { 0: "", 1: "" };
    clearConfetti();

    const modal = document.getElementById('match-modal');
    document.getElementById('modal-event-name').innerText = `${eventId.toUpperCase()} - ${matchTitle}`;
    document.getElementById('modal-matchup-title').innerText = `${getTeamNameDisplay(t1)} VS ${getTeamNameDisplay(t2)}`;
    document.getElementById('modal-actions-area').style.display = 'none';
    document.getElementById('modal-clock-controls').style.display = 'none';
    modal.style.display = 'flex';

    let step = 3;
    const displayArea = document.getElementById('modal-display-area');
    displayArea.innerHTML = `<div class="countdown-num cd-3">3</div>`;
    playBeep(440, 0.2);

    const cdInterval = setInterval(() => {
        step--;
        if (step === 2) { displayArea.innerHTML = `<div class="countdown-num cd-2">2</div>`; playBeep(440, 0.2); }
        else if (step === 1) { displayArea.innerHTML = `<div class="countdown-num cd-1">1</div>`; playBeep(440, 0.2); }
        else if (step === 0) { displayArea.innerHTML = `<div class="countdown-num cd-go">GO!</div>`; playBeep(880, 0.4); }
        else { clearInterval(cdInterval); startActiveMatchClock(eventId); }
    }, 1000);
}

function startActiveMatchClock(eventId) {
    const displayArea = document.getElementById('modal-display-area');
    const clockControls = document.getElementById('modal-clock-controls');
    clockControls.style.display = 'block';

    if (modalTimerInterval) clearInterval(modalTimerInterval);
    const isDualRace = ['dash', 'relay'].includes(eventId);

    if (isDualRace) {
        const startTime = Date.now();
        displayArea.innerHTML = `<div class="clock-active">00:00.00</div>`;
        clockControls.innerHTML = `
            <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                <button id="btn-stop-0" class="btn-stop-team" onclick="recordTeamSplit(0, ${startTime})">⏹️ Stop ${getTeamNameDisplay(currentMatchContext.t1)}</button>
                <button id="btn-stop-1" class="btn-stop-team" onclick="recordTeamSplit(1, ${startTime})">⏹️ Stop ${getTeamNameDisplay(currentMatchContext.t2)}</button>
            </div>
            <div style="margin-top: 12px;"><button class="btn-early-stop" onclick="finishDualRaceEarly(${startTime})">🏁 End Race Early</button></div>
        `;
        modalTimerInterval = setInterval(() => {
            displayArea.innerHTML = `<div class="clock-active">${formatMs(Date.now() - startTime, true)}</div>`;
        }, 30);

    } else if (eventId === 'athalon') {
        const startTime = Date.now();
        displayArea.innerHTML = `<div class="clock-active">00:00.00</div>`;
        clockControls.innerHTML = `
            <button class="btn-stop-team" style="font-size:18px; padding:12px 28px;" onclick="stopSingleAthalon(${startTime})">⏹️ STOP TIMER</button>
            <div style="margin-top: 10px;"><button class="btn-early-stop" onclick="stopSingleAthalon(${startTime})">🏁 End Match Early</button></div>
        `;
        modalTimerInterval = setInterval(() => {
            displayArea.innerHTML = `<div class="clock-active">${formatMs(Date.now() - startTime, true)}</div>`;
        }, 30);

    } else {
        const endTime = Date.now() + 30000;
        displayArea.innerHTML = `<div class="clock-active">30.00s</div>`;
        clockControls.innerHTML = `<button class="btn-early-stop" style="font-size: 14px; padding: 10px 20px;" onclick="finishCountdownEarly(${endTime})">🏁 End Match Early</button>`;
        modalTimerInterval = setInterval(() => {
            const remaining = endTime - Date.now();
            if (remaining <= 0) {
                clearInterval(modalTimerInterval);
                triggerCheckeredFlagPrompt("30.00s (Full Time)");
            } else {
                displayArea.innerHTML = `<div class="clock-active">${(remaining / 1000).toFixed(2)}s</div>`;
                if (remaining <= 5000 && remaining >= 4950) playBeep(520, 0.1);
            }
        }, 30);
    }
}

function recordTeamSplit(slotIdx, startTime) {
    if (dualSplitTimes[slotIdx] !== null) return;
    const splitMs = Date.now() - startTime;
    dualSplitTimes[slotIdx] = splitMs;
    dualSplitStrings[slotIdx] = formatMs(splitMs, false);
    playBeep(580, 0.2);

    const btn = document.getElementById(`btn-stop-${slotIdx}`);
    const teamName = getTeamNameDisplay(slotIdx === 0 ? currentMatchContext.t1 : currentMatchContext.t2);
    if (btn) {
        btn.className = "btn-stop-team btn-team-stopped";
        btn.innerText = `✓ ${teamName}: ${dualSplitStrings[slotIdx]}`;
    }
    if (dualSplitTimes[0] !== null && dualSplitTimes[1] !== null) {
        if (modalTimerInterval) clearInterval(modalTimerInterval);
        setTimeout(() => triggerCheckeredFlagPrompt(null, true), 250);
    }
}

function finishDualRaceEarly(startTime) {
    if (modalTimerInterval) clearInterval(modalTimerInterval);
    const currentMs = Date.now() - startTime;
    const currentElapsed = formatMs(currentMs, false);
    if (dualSplitTimes[0] === null && dualSplitTimes[1] === null) {
        dualSplitTimes[0] = currentMs; dualSplitTimes[1] = currentMs + 10;
        dualSplitStrings[0] = currentElapsed; dualSplitStrings[1] = currentElapsed;
    } else if (dualSplitTimes[0] === null) {
        dualSplitTimes[0] = currentMs; dualSplitStrings[0] = currentElapsed;
    } else if (dualSplitTimes[1] === null) {
        dualSplitTimes[1] = currentMs; dualSplitStrings[1] = currentElapsed;
    }
    triggerCheckeredFlagPrompt(null, true);
}

function stopSingleAthalon(startTime) {
    if (modalTimerInterval) clearInterval(modalTimerInterval);
    triggerCheckeredFlagPrompt(formatMs(Date.now() - startTime, true));
}

function finishCountdownEarly(endTime) {
    if (modalTimerInterval) clearInterval(modalTimerInterval);
    const elapsed = 30000 - Math.max(0, endTime - Date.now());
    triggerCheckeredFlagPrompt((elapsed / 1000).toFixed(2) + "s");
}

function triggerCheckeredFlagPrompt(timeText, isDualRace = false) {
    const displayArea = document.getElementById('modal-display-area');
    const actionsArea = document.getElementById('modal-actions-area');
    const clockControls = document.getElementById('modal-clock-controls');
    const btnContainer = document.getElementById('modal-winner-buttons');
    clockControls.style.display = 'none';

    const ctx = currentMatchContext;
    const name1 = getTeamNameDisplay(ctx.t1);
    const name2 = getTeamNameDisplay(ctx.t2);

    let timesSummaryHTML = "";
    let autoWinnerIdx = null;

    if (isDualRace && dualSplitTimes[0] !== null && dualSplitTimes[1] !== null) {
        autoWinnerIdx = dualSplitTimes[0] <= dualSplitTimes[1] ? 0 : 1;
        const diffSec = (Math.abs(dualSplitTimes[0] - dualSplitTimes[1]) / 1000).toFixed(2);
        const winnerName = autoWinnerIdx === 0 ? name1 : name2;
        playAirhorn();
        launchConfetti();
        timesSummaryHTML = `
            <div class="fanfare-banner">🎉 WINNER: ${winnerName}! 🎉<div class="fanfare-sub">Margin of victory: +${diffSec}s</div></div>
            <div style="display: flex; justify-content: space-around; width: 100%; margin: 6px 0; font-size: 15px;">
                <div>${name1}: <strong style="color:var(--blue); font-family:monospace;">${dualSplitStrings[0]}</strong></div>
                <div>${name2}: <strong style="color:var(--blue); font-family:monospace;">${dualSplitStrings[1]}</strong></div>
            </div>`;
    } else if (timeText) {
        playBeep(660, 0.4);
        timesSummaryHTML = `<div style="font-size:18px; font-weight:bold; color:#333; margin-top:5px;">Time: ${timeText}</div>`;
    }

    displayArea.innerHTML = `<div class="flag-box">🏁</div><div style="font-size:20px; font-weight:bold; color:var(--red);">MATCH FINISHED!</div>${timesSummaryHTML}`;

    const isWin0 = autoWinnerIdx === 0;
    const isWin1 = autoWinnerIdx === 1;
    btnContainer.innerHTML = `
        <button class="modal-winner-btn ${isWin0 ? 'auto-champion' : ''}" onclick="selectModalWinner(0, ${isDualRace})">
            ${isWin0 ? '⭐ [WINNER CONFIRMED] ' : ''}🏆 ${name1} ${isDualRace && dualSplitStrings[0] ? `(${dualSplitStrings[0]})` : ''}
        </button>
        <button class="modal-winner-btn ${isWin1 ? 'auto-champion' : ''}" onclick="selectModalWinner(1, ${isDualRace})">
            ${isWin1 ? '⭐ [WINNER CONFIRMED] ' : ''}🏆 ${name2} ${isDualRace && dualSplitStrings[1] ? `(${dualSplitStrings[1]})` : ''}
        </button>
    `;
    actionsArea.style.display = 'block';
}

function selectModalWinner(slotIdx, isDualRace = false) {
    if (!currentMatchContext) return;
    const { eventId, classId, matchId } = currentMatchContext;
    if (isDualRace) {
        const ev = getCleanOrExistingEvent(eventId, classId);
        if (!ev.times) ev.times = {};
        ev.times[matchId] = { 0: dualSplitStrings[0] || "", 1: dualSplitStrings[1] || "" };
    }
    advanceTeam(eventId, classId, matchId, slotIdx);
    closeMatchModal();
}

function closeMatchModal() {
    if (modalTimerInterval) clearInterval(modalTimerInterval);
    clearConfetti();
    document.getElementById('match-modal').style.display = 'none';
    currentMatchContext = null;
}

function updateMatchTime(eventId, classId, matchId, slotIdx, newTimeVal) {
    if (!isAdmin) return;
    const ev = getCleanOrExistingEvent(eventId, classId);
    if (!ev.times) ev.times = {};
    if (!ev.times[matchId]) ev.times[matchId] = {};
    ev.times[matchId][slotIdx] = newTimeVal.trim();
    saveData();
}

function startBracketTimer(id) {
    if (!isAdmin) return;
    if (activeTimers[id]) clearInterval(activeTimers[id]);
    let min = parseInt(document.getElementById(`min-${id}`).value) || 0;
    let sec = parseInt(document.getElementById(`sec-${id}`).value) || 0;
    let totalMs = ((min * 60) + sec) * 1000;
    let display = document.getElementById(`display-${id}`);
    display.style.color = "var(--black)";
    if (totalMs <= 0) return;

    const targetTime = Date.now() + totalMs;
    display.innerText = formatMs(totalMs, true);
    activeTimers[id] = setInterval(() => {
        const remaining = targetTime - Date.now();
        if (remaining <= 0) {
            clearInterval(activeTimers[id]);
            display.innerText = "00:00.00";
            display.style.color = "var(--red)";
        } else {
            display.innerText = formatMs(remaining, true);
        }
    }, 30);
}

function stopBracketTimer(id) {
    if (!isAdmin) return;
    if (activeTimers[id]) {
        clearInterval(activeTimers[id]);
        document.getElementById(`display-${id}`).innerText = "00:00.00";
        document.getElementById(`display-${id}`).style.color = "var(--black)";
    }
}
