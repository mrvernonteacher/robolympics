// GOOGLE APPS SCRIPT BACKEND ENDPOINT
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
            bracketEvents.forEach(ev => { renderBracketUI(ev, 1); renderBracketUI(ev, 2); });
            renderAthalon();
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
        bracketEvents.forEach(ev => { renderBracketUI(ev, 1); renderBracketUI(ev, 2); });
        renderAthalon();
        renderGolf();
    }
}

// Canva Embeds
const canvaEmbeds = {
    'tug': `<div style="position: relative; width: 100%; height: 0; padding-top: 56.25%; margin-bottom: 0.9em; overflow: hidden; border-radius: 8px;"><iframe loading="lazy" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none;" src="https://www.canva.com/design/DAGPuw06Vbg/MofxFeGW2qlrcQ-WRj0Byw/view?embed" allowfullscreen></iframe></div>`,
    'dash': `<div style="position: relative; width: 100%; height: 0; padding-top: 56.25%; margin-bottom: 0.9em; overflow: hidden; border-radius: 8px;"><iframe loading="lazy" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none;" src="https://www.canva.com/design/DAGQY6uZjUo/Cj8F5p4lOJfDfDARLoPkpQ/view?embed" allowfullscreen></iframe></div>`,
    'relay': `<div style="position: relative; width: 100%; height: 0; padding-top: 56.25%; margin-bottom: 0.9em; overflow: hidden; border-radius: 8px;"><iframe loading="lazy" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none;" src="https://www.canva.com/design/DAGSPAOigYw/nyekGkUQcrwbQhUihX9tTg/view?embed" allowfullscreen></iframe></div>`,
    'athalon': `<div style="position: relative; width: 100%; height: 0; padding-top: 56.25%; margin-bottom: 0.9em; overflow: hidden; border-radius: 8px;"><iframe loading="lazy" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none;" src="https://www.canva.com/design/DAHVYHmP6Ws/JXAktKxThtY_arm3P2AeDA/view?embed" allowfullscreen></iframe></div>`,
    'golf': `<div style="position: relative; width: 100%; height: 0; padding-top: 56.25%; margin-bottom: 0.9em; overflow: hidden; border-radius: 8px;"><iframe loading="lazy" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none;" src="https://www.canva.com/design/DAGTlBnGYXk/94Mxt7VIN-O3aNTG-eO5IA/view?embed" allowfullscreen></iframe></div>`
};

const bracketConfig = [
    { id: 'tug', title: 'Tug-o-War', relay: false },
    { id: 'dash', title: 'X-Meter Dash', relay: false },
    { id: 'relay', title: 'Robo-Relay', relay: true }
];
const bracketEvents = ['tug', 'dash', 'relay'];

function buildBracketEventsHTML() {
    const container = document.getElementById('bracket-events-container');
    if (!container) return;

    let html = '';
    bracketConfig.forEach(ev => {
        const embedHTML = canvaEmbeds[ev.id] ? `<div class="event-embed">${canvaEmbeds[ev.id]}</div>` : '';
        html += `
        <div id="event-${ev.id}" class="tab-content">
            <h2 style="text-align: center; margin-bottom: 5px;">${ev.title} ${ev.relay ? "(Paired Teams)" : ""}</h2>
            ${ev.relay ? "<p style='text-align: center; margin-bottom: 20px;'><em>Teams compete in pairs. Points awarded will be given to BOTH teams in a paired slot.</em></p>" : ""}
            
            ${embedHTML}

            <div class="split-view">
                <!-- Class 1 -->
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

                <!-- Class 2 -->
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

    const athalonEmbed = document.getElementById('athalon-canva-embed');
    if (athalonEmbed && canvaEmbeds['athalon']) athalonEmbed.innerHTML = canvaEmbeds['athalon'];

    const golfEmbed = document.getElementById('golf-canva-embed');
    if (golfEmbed && canvaEmbeds['golf']) golfEmbed.innerHTML = canvaEmbeds['golf'];
}

let currentYear = "2026";

function createBlankTemplate() {
    return {
        class1Name: "Guiendon",
        class2Name: "Vernon",
        teams: [],
        events: {
            1: { tug: {}, dash: {}, relay: {}, athalon: { runs: {} } },
            2: { tug: {}, dash: {}, relay: {}, athalon: { runs: {} } }
        },
        awards: {
            1: { tug: null, dash: null, relay: null, athalon: null, golf: null },
            2: { tug: null, dash: null, relay: null, athalon: null, golf: null }
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
    setCloudStatus("⏳ Connecting to Sheet...");
    try {
        buildBracketEventsHTML();
        renderFullUI();

        fetch(`${APPS_SCRIPT_URL}?action=getYears`)
            .then(res => res.json())
            .then(res => populateYearsAndLoad(res.years))
            .catch(() => setCloudStatus("💾 Synced Locally (Offline)"));
    } catch (e) {
        console.error("Startup error:", e);
        setCloudStatus("⚠️ UI Render Error: " + e.message);
    }
};

function renderFullUI() {
    try {
        if (!data) data = createBlankTemplate();
        if (!data.teams) data.teams = [];
        if (!data.events) data.events = { 1: {}, 2: {} };
        if (!data.awards) data.awards = { 1: {}, 2: {} };
        if (!data.golfScores) data.golfScores = {};

        const c1 = document.getElementById('class1Name');
        const c2 = document.getElementById('class2Name');
        if (c1) c1.value = data.class1Name || "Guiendon";
        if (c2) c2.value = data.class2Name || "Vernon";
        
        updateClassTitles();
        renderSetup();
        renderLeaderboards();

        bracketEvents.forEach(ev => { 
            getCleanOrExistingEvent(ev, 1);
            getCleanOrExistingEvent(ev, 2);
            renderBracketUI(ev, 1); 
            renderBracketUI(ev, 2); 
            updateStatusDisplay(ev, 1);
            updateStatusDisplay(ev, 2);
        });

        renderAthalon();
        renderGolf();
        updateStatusDisplay('golf', 1);
        updateStatusDisplay('golf', 2);
    } catch (e) {
        console.error("Render error:", e);
    }
}

function populateYearsAndLoad(yearList) {
    const sel = document.getElementById('yearSelector');
    if (!sel) return;
    sel.innerHTML = "";
    if (!yearList || !Array.isArray(yearList) || yearList.length === 0) {
        yearList = ["2026"];
    }
    yearList.forEach(y => {
        const opt = document.createElement('option');
        opt.value = y;
        opt.innerText = y;
        sel.appendChild(opt);
    });

    currentYear = yearList[0] || "2026";
    sel.value = currentYear;
    loadCurrentYear();
}

function changeYear(selectedYear) {
    currentYear = selectedYear;
    loadCurrentYear();
}

function loadCurrentYear() {
    setCloudStatus(`⏳ Loading ${currentYear}...`);
    fetch(`${APPS_SCRIPT_URL}?action=loadYear&year=${encodeURIComponent(currentYear)}`)
        .then(res => res.json())
        .then(res => handleLoadedData(res))
        .catch(() => {
            setCloudStatus("💾 Synced Locally");
            renderFullUI();
        });
}

function handleLoadedData(res) {
    if (res.status === "success" && res.data) {
        data = res.data;
        setCloudStatus(`☁️ Synced to Sheet (${currentYear})`);
    } else {
        data = createBlankTemplate();
        setCloudStatus(`☁️ Initialized (${currentYear})`);
        saveData();
    }
    renderFullUI();
}

let saveTimeout = null;
function saveData() {
    if (!isAdmin) return;

    const c1 = document.getElementById('class1Name');
    const c2 = document.getElementById('class2Name');
    if (c1) data.class1Name = c1.value;
    if (c2) data.class2Name = c2.value;

    renderFullUI();

    setCloudStatus("⏳ Saving to Sheet...");
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        fetch(APPS_SCRIPT_URL, {
            method: "POST",
            body: JSON.stringify({ action: "saveYear", year: currentYear, data: data })
        })
        .then(res => res.json())
        .then(res => setCloudStatus(`☁️ Saved (${res.timestamp})`))
        .catch(() => setCloudStatus("💾 Saved Locally"));
    }, 800);
}

function promptArchiveYear() {
    const newYear = prompt("Enter the name for the new competition year (e.g. 2027):");
    if (!newYear || newYear.trim() === "") return;

    setCloudStatus("⏳ Creating archive tab...");
    fetch(APPS_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({ action: "archiveYear", year: newYear.trim(), data: createBlankTemplate() })
    })
    .then(res => res.json())
    .then(res => {
        if (res.status === "exists") {
            alert(res.message);
            setCloudStatus(`☁️ Synced to Sheet (${currentYear})`);
        } else {
            alert(`Created year ${res.year} successfully!`);
            populateYearsAndLoad(res.years);
        }
    })
    .catch(() => setCloudStatus("❌ Failed to create year"));
}

function formatMs(totalMs, includeMinutes = true) {
    if (totalMs < 0 || isNaN(totalMs)) totalMs = 0;
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

function parseTimeToMs(str) {
    if (!str || typeof str !== 'string') return null;
    str = str.trim().toLowerCase().replace('s', '');
    if (str === '' || str === 'dnf' || str === 'dq') return null;

    if (str.includes(':')) {
        const parts = str.split(':');
        const min = parseFloat(parts[0]) || 0;
        const sec = parseFloat(parts[1]) || 0;
        return Math.round((min * 60 + sec) * 1000);
    }
    const val = parseFloat(str);
    return isNaN(val) ? null : Math.round(val * 1000);
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
        ${isOverlay ? `<div class="podium-hover-hint">🔍 Hover cursor over table to reveal & edit</div>` : ''}
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
let dualRaceSplits = [];
let dualRaceSplitStrings = [];

function openMatchTimer(eventId, classId, matchId, matchTitle) {
    if (!isAdmin) return;
    const ev = getCleanOrExistingEvent(eventId, classId);
    const t0 = ev[matchId][0], t1 = ev[matchId][1];
    const valid0 = isValidTeam(t0) && !isSlotDQ(ev, matchId, 0);
    const valid1 = isValidTeam(t1) && !isSlotDQ(ev, matchId, 1);
    if (!valid0 && !valid1) return;

    currentMatchContext = { eventId, classId, matchId, matchTitle, t0, t1, valid0, valid1 };
    dualRaceSplits = [];
    dualRaceSplitStrings = [];
    clearConfetti();

    const modal = document.getElementById('match-modal');
    document.getElementById('modal-event-name').innerText = `${eventId.toUpperCase()} - ${matchTitle}`;
    
    const hasLanes = ['tug', 'dash', 'relay'].includes(eventId);
    if (valid0 && valid1) {
        if (hasLanes) {
            document.getElementById('modal-matchup-title').innerHTML = `
                <span style="color:var(--blue);">🔵 ${getTeamNameDisplay(t0)}</span>
                <span style="color:#666; font-size:16px;"> VS </span>
                <span style="color:var(--red);">🔴 ${getTeamNameDisplay(t1)}</span>
            `;
        } else {
            document.getElementById('modal-matchup-title').innerText = `${getTeamNameDisplay(t0)} VS ${getTeamNameDisplay(t1)}`;
        }
    } else {
        const soloTeam = valid0 ? t0 : t1;
        const laneColor = valid0 ? "var(--blue)" : "var(--red)";
        const laneIcon = valid0 ? "🔵" : "🔴";
        document.getElementById('modal-matchup-title').innerHTML = `
            <span style="color:${laneColor}; font-weight:bold;">${laneIcon} Solo Run: ${getTeamNameDisplay(soloTeam)}</span>
        `;
    }

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
        const isSolo = !currentMatchContext.valid0 || !currentMatchContext.valid1;
        const startTime = Date.now();
        dualRaceSplits = [];
        dualRaceSplitStrings = [];
        displayArea.innerHTML = `<div class="clock-active">00:00.00</div>`;

        if (isSolo) {
            const soloSlot = currentMatchContext.valid0 ? 0 : 1;
            clockControls.innerHTML = `
                <button id="btn-master-stop" class="btn-single-stop btn-stop-1st" onclick="handleSoloStopPress(${startTime}, ${soloSlot})">
                    ⏹️ STOP TIMER
                </button>
            `;
        } else {
            clockControls.innerHTML = `
                <button id="btn-master-stop" class="btn-single-stop btn-stop-1st" onclick="handleSingleStopPress(${startTime})">
                    ⏹️ STOP 1ST PLACE
                </button>
                <div style="margin-top: 14px;">
                    <button class="btn-early-stop" onclick="finishDualRaceEarly(${startTime})">🏁 End Race Early / DNF</button>
                </div>
            `;
        }

        modalTimerInterval = setInterval(() => {
            displayArea.innerHTML = `<div class="clock-active">${formatMs(Date.now() - startTime, true)}</div>`;
        }, 30);

    } else {
        // Tug-o-War countdown (30s)
        const endTime = Date.now() + 30000;
        displayArea.innerHTML = `<div class="clock-active">30.00s</div>`;
        clockControls.innerHTML = `<button class="btn-single-stop btn-stop-1st" onclick="finishCountdownEarly(${endTime})">⏹️ STOP / WINNER DECIDED</button>`;
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

function handleSingleStopPress(startTime) {
    const elapsed = Date.now() - startTime;
    if (dualRaceSplits.length === 0) {
        dualRaceSplits.push(elapsed);
        dualRaceSplitStrings.push(formatMs(elapsed, false));
        playBeep(620, 0.15);

        const btn = document.getElementById('btn-master-stop');
        if (btn) {
            btn.className = "btn-single-stop btn-stop-2nd";
            btn.innerHTML = `⏹️ STOP 2ND PLACE<br><span style="font-size:13px; font-weight:normal; opacity:0.9;">1st Place: <strong>${dualRaceSplitStrings[0]}</strong></span>`;
        }
    } else if (dualRaceSplits.length === 1) {
        dualRaceSplits.push(elapsed);
        dualRaceSplitStrings.push(formatMs(elapsed, false));
        playBeep(840, 0.2);
        if (modalTimerInterval) clearInterval(modalTimerInterval);

        triggerDualRaceWinnerSelection();
    }
}

function handleSoloStopPress(startTime, slotIdx) {
    if (modalTimerInterval) clearInterval(modalTimerInterval);
    const elapsed = Date.now() - startTime;
    const timeStr = formatMs(elapsed, false);
    playBeep(840, 0.2);

    const displayArea = document.getElementById('modal-display-area');
    const actionsArea = document.getElementById('modal-actions-area');
    const clockControls = document.getElementById('modal-clock-controls');
    const btnContainer = document.getElementById('modal-winner-buttons');
    const actionsHeading = document.getElementById('modal-actions-heading');
    clockControls.style.display = 'none';

    const ctx = currentMatchContext;
    const team = slotIdx === 0 ? ctx.t0 : ctx.t1;

    displayArea.innerHTML = `
        <div class="flag-box">🏁</div>
        <div style="font-size:22px; font-weight:bold; color:var(--green); margin-bottom:5px;">TIME RECORDED!</div>
        <div style="font-size:18px; font-weight:bold; color:#333; margin-top:5px;">Official Time: ${timeStr}</div>
    `;

    actionsHeading.innerText = "CONFIRM TIME & ADVANCE:";
    const laneClass = slotIdx === 0 ? "modal-lane-blue" : "modal-lane-red";
    const laneIcon = slotIdx === 0 ? "🔵" : "🔴";
    btnContainer.innerHTML = `
        <button class="modal-winner-btn ${laneClass}" onclick="confirmSoloRace(${slotIdx}, '${timeStr}')" style="font-size: 17px; padding: 14px;">
            ${laneIcon} Confirm ${getTeamNameDisplay(team)} (${timeStr})
        </button>
    `;
    actionsArea.style.display = 'block';
}

function confirmSoloRace(slotIdx, timeStr) {
    if (!currentMatchContext) return;
    const { eventId, classId, matchId } = currentMatchContext;
    const ev = getCleanOrExistingEvent(eventId, classId);
    if (!ev.times) ev.times = {};
    if (!ev.times[matchId]) ev.times[matchId] = {};
    ev.times[matchId][slotIdx] = timeStr;
    advanceTeam(eventId, classId, matchId, slotIdx);
    closeMatchModal();
}

function finishDualRaceEarly(startTime) {
    if (modalTimerInterval) clearInterval(modalTimerInterval);
    const currentMs = Date.now() - startTime;
    const currentStr = formatMs(currentMs, false);

    if (dualRaceSplits.length === 0) {
        dualRaceSplits = [currentMs, currentMs + 50];
        dualRaceSplitStrings = [currentStr, currentStr];
    } else if (dualRaceSplits.length === 1) {
        dualRaceSplits.push(currentMs);
        dualRaceSplitStrings.push(currentStr);
    }
    triggerDualRaceWinnerSelection();
}

function triggerDualRaceWinnerSelection() {
    const displayArea = document.getElementById('modal-display-area');
    const actionsArea
