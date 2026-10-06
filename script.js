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
            renderFullUI();
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
        renderFullUI();
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
    try {
        buildBracketEventsHTML();
        // ----------------------------------------------------
        // THIS RENDER HAPPENS INSTANTLY BEFORE THE CLOUD FETCH
        // SO THE APP NEVER FREEZES
        // ----------------------------------------------------
        renderFullUI();

        setCloudStatus("⏳ Connecting to Sheet...");
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
                    ⏹️️ STOP 1ST PLACE
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
    const actionsArea = document.getElementById('modal-actions-area');
    const clockControls = document.getElementById('modal-clock-controls');
    const btnContainer = document.getElementById('modal-winner-buttons');
    const actionsHeading = document.getElementById('modal-actions-heading');
    clockControls.style.display = 'none';

    const ctx = currentMatchContext;
    const name0 = getTeamNameDisplay(ctx.t0);
    const name1 = getTeamNameDisplay(ctx.t1);

    playAirhorn();
    launchConfetti();

    const diffSec = (Math.abs(dualRaceSplits[0] - dualRaceSplits[1]) / 1000).toFixed(2);

    displayArea.innerHTML = `
        <div class="flag-box">🏁</div>
        <div style="font-size:22px; font-weight:bold; color:var(--green); margin-bottom:5px;">RACE FINISHED!</div>
        <div style="display:flex; justify-content:center; gap:20px; font-size:16px; margin: 5px 0;">
            <div>🥇 1st Time: <strong style="color:var(--green); font-family:monospace;">${dualRaceSplitStrings[0]}</strong></div>
            <div>🥈 2nd Time: <strong style="color:#e67e22; font-family:monospace;">${dualRaceSplitStrings[1]}</strong></div>
        </div>
        <div style="font-size:13px; color:#555;">Margin of victory: +${diffSec}s</div>
    `;

    actionsHeading.innerText = "WHICH LANE CROSSED FIRST?";
    btnContainer.innerHTML = `
        <button class="modal-winner-btn modal-lane-blue" onclick="confirmDualRaceWinner(0)" style="font-size: 17px; padding: 14px;">
            🔵 BLUE LANE WON: ${name0}<br>
            <span style="font-size:12px; font-weight:normal; opacity:0.9;">Assigns 1st Place (${dualRaceSplitStrings[0]})</span>
        </button>
        <button class="modal-winner-btn modal-lane-red" onclick="confirmDualRaceWinner(1)" style="font-size: 17px; padding: 14px;">
            🔴 RED LANE WON: ${name1}<br>
            <span style="font-size:12px; font-weight:normal; opacity:0.9;">Assigns 1st Place (${dualRaceSplitStrings[0]})</span>
        </button>
    `;
    actionsArea.style.display = 'block';
}

function confirmDualRaceWinner(winnerIdx) {
    if (!currentMatchContext) return;
    const { eventId, classId, matchId } = currentMatchContext;
    const ev = getCleanOrExistingEvent(eventId, classId);
    if (!ev.times) ev.times = {};

    if (winnerIdx === 0) {
        ev.times[matchId] = { 0: dualRaceSplitStrings[0] || "", 1: dualRaceSplitStrings[1] || "" };
    } else {
        ev.times[matchId] = { 0: dualRaceSplitStrings[1] || "", 1: dualRaceSplitStrings[0] || "" };
    }

    advanceTeam(eventId, classId, matchId, winnerIdx);
    closeMatchModal();
}

function finishCountdownEarly(endTime) {
    if (modalTimerInterval) clearInterval(modalTimerInterval);
    const elapsed = 30000 - Math.max(0, endTime - Date.now());
    triggerCheckeredFlagPrompt((elapsed / 1000).toFixed(2) + "s");
}

function triggerCheckeredFlagPrompt(timeText) {
    const displayArea = document.getElementById('modal-display-area');
    const actionsArea = document.getElementById('modal-actions-area');
    const clockControls = document.getElementById('modal-clock-controls');
    const btnContainer = document.getElementById('modal-winner-buttons');
    const actionsHeading = document.getElementById('modal-actions-heading');
    clockControls.style.display = 'none';

    const ctx = currentMatchContext;
    const name0 = getTeamNameDisplay(ctx.t0);
    const name1 = getTeamNameDisplay(ctx.t1);

    playBeep(660, 0.4);
    displayArea.innerHTML = `
        <div class="flag-box">🏁</div>
        <div style="font-size:20px; font-weight:bold; color:var(--red);">MATCH FINISHED!</div>
        ${timeText ? `<div style="font-size:18px; font-weight:bold; color:#333; margin-top:5px;">Time: ${timeText}</div>` : ''}
    `;

    actionsHeading.innerText = "SELECT MATCH WINNER:";

    if (ctx.eventId === 'tug') {
        btnContainer.innerHTML = `
            <button class="modal-winner-btn modal-lane-blue" onclick="selectModalWinner(0)">🔵 BLUE LANE: ${name0}</button>
            <button class="modal-winner-btn modal-lane-red" onclick="selectModalWinner(1)">🔴 RED LANE: ${name1}</button>
        `;
    } else {
        btnContainer.innerHTML = `
            <button class="modal-winner-btn" onclick="selectModalWinner(0)">🏆 ${name0}</button>
            <button class="modal-winner-btn" onclick="selectModalWinner(1)">🏆 ${name1}</button>
        `;
    }
    actionsArea.style.display = 'block';
}

function selectModalWinner(slotIdx) {
    if (!currentMatchContext) return;
    const { eventId, classId, matchId } = currentMatchContext;
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

function isValidTeam(val) {
    if (!val || val === "" || val === "BYE" || val === "?") return false;
    if (Array.isArray(val)) return val.some(v => v !== "BYE" && v !== "" && v !== "?" && v !== undefined && v !== null);
    return true;
}

function isSlotDQ(ev, mId, slotIdx) {
    return !!(ev.dq && ev.dq[mId] && ev.dq[mId][slotIdx]);
}

function isSameTeam(a, b) {
    if (a === undefined || b === undefined) return false;
    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        return a.every(val => b.includes(val));
    }
    return JSON.stringify(a) === JSON.stringify(b);
}

function getCleanOrExistingEvent(eventId, classId) {
    if (!data.events[classId]) data.events[classId] = {};
    let ev = data.events[classId][eventId];
    if (!ev || !ev.m1) {
        ev = {
            m1: ["", ""], m2: ["", ""], m3: ["", ""], m4: ["", ""],
            m5: ["", ""], m6: ["", ""], m7: ["", ""], m8: ["", ""],
            winners: {}, dq: {}, times: {}
        };
        data.events[classId][eventId] = ev;
    }
    ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8'].forEach(m => {
        if (!ev[m] || !Array.isArray(ev[m])) ev[m] = ["", ""];
    });
    if (!ev.dq) ev.dq = {};
    if (!ev.times) ev.times = {};
    if (!ev.winners) ev.winners = {};
    autoAdvanceCascade(ev);
    return ev;
}

function autoAdvanceCascade(ev) {
    if (!ev.dq) ev.dq = {};
    if (!ev.winners) ev.winners = {};

    function resolveMatch(mId) {
        const t0 = ev[mId][0], t1 = ev[mId][1];
        if (t0 === "?" || t1 === "?") return { winner: "", loser: "", pending: true };

        const valid0 = isValidTeam(t0), valid1 = isValidTeam(t1);
        const dq0 = isSlotDQ(ev, mId, 0), dq1 = isSlotDQ(ev, mId, 1);
        const active0 = valid0 && !dq0, active1 = valid1 && !dq1;

        if ((t0 === "" && !dq0) || (t1 === "" && !dq1)) {
            delete ev.winners[mId];
            return { winner: "", loser: "", pending: true };
        }
        if (active0 && active1) {
            const w = ev.winners[mId];
            if (w && isSameTeam(w, t0)) return { winner: t0, loser: t1, pending: false };
            if (w && isSameTeam(w, t1)) return { winner: t1, loser: t0, pending: false };
            delete ev.winners[mId];
            return { winner: "", loser: "", pending: true };
        }
        if (active0 && !active1) { ev.winners[mId] = t0; return { winner: t0, loser: "BYE", pending: false }; }
        if (!active0 && active1) { ev.winners[mId] = t1; return { winner: t1, loser: "BYE", pending: false }; }

        ev.winners[mId] = "BYE";
        return { winner: "BYE", loser: "BYE", pending: false };
    }

    const r1 = resolveMatch('m1'), r2 = resolveMatch('m2'), r3 = resolveMatch('m3'), r4 = resolveMatch('m4');
    ev.m5[0] = r1.winner; ev.m5[1] = r2.winner; ev.m6[0] = r3.winner; ev.m6[1] = r4.winner;
    const r5 = resolveMatch('m5'), r6 = resolveMatch('m6');
    ev.m7[0] = r5.winner; ev.m7[1] = r6.winner; 
    
    // Semifinal losers to 3rd place
    ev.m8[0] = (r5.loser && r5.loser !== "BYE") ? r5.loser : (r1.loser && r1.loser !== "BYE" ? r1.loser : (r2.loser || "BYE"));
    ev.m8[1] = (r6.loser && r6.loser !== "BYE") ? r6.loser : (r3.loser && r3.loser !== "BYE" ? r3.loser : (r4.loser || "BYE"));

    resolveMatch('m7'); resolveMatch('m8');
}

function isBracketPending(ev) {
    if (!ev || !ev.m1 || ev.isRevealing) return true;
    const matches = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8'];
    for (let mId of matches) {
        const t0 = ev[mId][0], t1 = ev[mId][1];
        if (t0 === "?" || t1 === "?") return true;
        const active0 = isValidTeam(t0) && !isSlotDQ(ev, mId, 0);
        const active1 = isValidTeam(t1) && !isSlotDQ(ev, mId, 1);
        if (active0 && active1) {
            const w = ev.winners?.[mId];
            if (!w || (!isSameTeam(w, t0) && !isSameTeam(w, t1))) return true;
        }
        if ((t0 === "" && !isSlotDQ(ev, mId, 0)) || (t1 === "" && !isSlotDQ(ev, mId, 1))) return true;
    }
    return false;
}

function getBracketMedals(ev) {
    if (!ev || !ev.winners || isBracketPending(ev)) return null;
    const first = ev.winners.m7;
    const second = isSameTeam(ev.m7[0], first) ? ev.m7[1] : ev.m7[0];
    const third = ev.winners.m8;

    return {
        gold: (isValidTeam(first) && !isSlotDQ(ev, 'm7', (isSameTeam(ev.m7[0], first) ? 0 : 1))) ? first : null,
        silver: (isValidTeam(second) && !isSlotDQ(ev, 'm7', (isSameTeam(ev.m7[0], first) ? 1 : 0))) ? second : null,
        bronze: (isValidTeam(third) && !isSlotDQ(ev, 'm8', (isSameTeam(ev.m8[0], third) ? 0 : 1))) ? third : null
    };
}

function getTeamMedals(teamId, classId) {
    let gold = 0, silver = 0, bronze = 0;
    const classAwards = data.awards ? (data.awards[classId] || {}) : {};
    const teamObj = data.teams.find(t => t.id === teamId);
    const teamName = teamObj ? teamObj.name : "";

    Object.values(classAwards).forEach(award => {
        if (!award) return;
        const matches = (awardId, awardName) => {
            if (awardId !== undefined && awardId !== null) {
                if (Array.isArray(awardId)) return awardId.includes(teamId);
                return awardId === teamId;
            }
            if (awardName && teamName && awardName !== "None") {
                return awardName.split(" & ").map(s => s.trim()).includes(teamName);
            }
            return false;
        };
        if (matches(award.firstId, award.first)) gold++;
        else if (matches(award.secondId, award.second)) silver++;
        else if (matches(award.thirdId, award.third)) bronze++;
    });
    return { gold, silver, bronze };
}

function handleKeyPress(event, classNum) {
    if (event.key === "Enter") {
        event.preventDefault();
        addTeam(classNum);
    }
}

function addTeam(classNum) {
    if (!isAdmin) return;
    const input = document.getElementById(`newTeam${classNum}`);
    if(input.value.trim() === '') return;
    data.teams.push({ name: input.value.trim(), classId: classNum, points: 0, id: Date.now() + Math.floor(Math.random()*1000) });
    input.value = '';
    saveData();
    input.focus();
}

function editTeam(id, newName) {
    if (!isAdmin) return;
    let team = data.teams.find(t => t.id === id);
    if(team && newName.trim() !== "") team.name = newName.trim();
    saveData();
}

function removeTeam(id) {
    if (!isAdmin) return;
    data.teams = data.teams.filter(t => t.id !== id);
    saveData();
}

function renderSetup() {
    const createHTML = (cId) => data.teams.filter(t => t.classId === cId).map(t => `
        <div class="team-edit-row">
            <input type="text" value="${t.name}" ${isAdmin ? `onchange="editTeam(${t.id}, this.value)"` : 'readonly'}>
            ${isAdmin ? `<button onclick="removeTeam(${t.id})" class="btn-remove">X</button>` : ''}
        </div>`).join('');
    const c1El = document.getElementById('class1List');
    const c2El = document.getElementById('class2List');
    if (c1El) c1El.innerHTML = createHTML(1);
    if (c2El) c2El.innerHTML = createHTML(2);
}

function renderLeaderboards() {
    const buildBoard = (cId, tbodyId, podiumId) => {
        const classTeams = data.teams.filter(t => t.classId === cId);
        
        classTeams.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            const medA = getTeamMedals(a.id, cId);
            const medB = getTeamMedals(b.id, cId);
            if (medB.gold !== medA.gold) return medB.gold - medA.gold;
            if (medB.silver !== medA.silver) return medB.silver - medA.silver;
            return medB.bronze - medA.bronze;
        });

        const p1 = classTeams[0], p2 = classTeams[1], p3 = classTeams[2];
        const podiumEl = document.getElementById(podiumId);
        if (podiumEl) {
            podiumEl.innerHTML = buildPodiumHTML(
                { name: p1 ? p1.name : "—", sub: p1 ? `${p1.points} pts` : "" },
                { name: p2 ? p2.name : "—", sub: p2 ? `${p2.points} pts` : "" },
                { name: p3 ? p3.name : "—", sub: p3 ? `${p3.points} pts` : "" },
                `${cId === 1 ? data.class1Name : data.class2Name} Leaders`,
                false
            );
        }

        const tbody = document.getElementById(tbodyId);
        if (tbody) {
            tbody.innerHTML = classTeams.map((t, i) => {
                const medals = getTeamMedals(t.id, cId);
                return `
                <tr>
                    <td><strong>${i+1}</strong></td>
                    <td style="text-align:left; font-weight:600; padding-left:12px;">${t.name}</td>
                    <td class="medal-cell" style="color:#d4af37;">${medals.gold > 0 ? medals.gold : '-'}</td>
                    <td class="medal-cell" style="color:#7f8c8d;">${medals.silver > 0 ? medals.silver : '-'}</td>
                    <td class="medal-cell" style="color:#b87333;">${medals.bronze > 0 ? medals.bronze : '-'}</td>
                    <td><strong style="color:var(--blue); font-size:15px;">${t.points}</strong></td>
                </tr>`;
            }).join('');
        }
    };

    buildBoard(1, 'leaderboardBody1', 'standings-podium-1');
    buildBoard(2, 'leaderboardBody2', 'standings-podium-2');
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function clearBracket(eventId, classId) {
    if (!isAdmin) return;
    manualModes[`${eventId}-${classId}`] = false;
    data.events[classId][eventId] = {
        m1: ["", ""], m2: ["", ""], m3: ["", ""], m4: ["", ""],
        m5: ["", ""], m6: ["", ""], m7: ["", ""], m8: ["", ""],
        winners: {}, dq: {}, times: {}
    };
    saveData();
}

function triggerDramaticReveal(eventId, classId, finalEv) {
    data.events[classId][eventId] = {
        m1: ["?", "?"], m2: ["?", "?"], m3: ["?", "?"], m4: ["?", "?"],
        m5: ["", ""], m6: ["", ""], m7: ["", ""], m8: ["", ""],
        winners: {}, dq: {}, times: {}, isRevealing: true
    };
    saveData();

    const matches = ['m1', 'm2', 'm3', 'm4'];
    matches.forEach((mId, index) => {
        setTimeout(() => {
            data.events[classId][eventId][mId] = finalEv[mId];
            saveData(); 
        }, 1500 * (index + 1));
    });

    setTimeout(() => {
        data.events[classId][eventId].isRevealing = false;
        autoAdvanceCascade(data.events[classId][eventId]);
        saveData();
    }, 1500 * (matches.length + 1));
}

function randomizeBracket(eventId, classId) {
    if (!isAdmin) return;
    manualModes[`${eventId}-${classId}`] = false;
    let activeTeams = data.teams.filter(t => t.classId === classId).map(t => t.id);
    activeTeams = shuffleArray(activeTeams);
    let seeds = Array(8).fill("BYE");
    for(let i=0; i<activeTeams.length && i<8; i++) seeds[i] = activeTeams[i];

    triggerDramaticReveal(eventId, classId, {
        m1: [seeds[0], seeds[7]], m2: [seeds[3], seeds[4]],
        m3: [seeds[2], seeds[5]], m4: [seeds[1], seeds[6]],
        m5: ["", ""], m6: ["", ""], m7: ["", ""], m8: ["", ""],
        winners: {}, dq: {}, times: {}
    });
}

function randomizeRelayBracket(eventId, classId) {
    if (!isAdmin) return;
    manualModes[`${eventId}-${classId}`] = false;
    let activeTeams = data.teams.filter(t => t.classId === classId).map(t => t.id);
    activeTeams = shuffleArray(activeTeams);
    let pairs = [];
    for(let i=0; i<activeTeams.length; i+=2) {
        pairs.push(activeTeams[i+1] ? [activeTeams[i], activeTeams[i+1]] : [activeTeams[i], "BYE"]);
    }
    pairs = shuffleArray(pairs);

    let m = {
        m1: ["BYE", "BYE"],
        m2: ["BYE", "BYE"],
        m3: ["BYE", "BYE"],
        m4: ["BYE", "BYE"]
    };
    const order = [
        ['m1', 0], ['m1', 1],
        ['m3', 0], ['m3', 1],
        ['m2', 0], ['m2', 1],
        ['m4', 0], ['m4', 1]
    ];
    for (let i = 0; i < pairs.length && i < 8; i++) {
        const [mId, slot] = order[i];
        m[mId][slot] = pairs[i];
    }

    triggerDramaticReveal(eventId, classId, {
        m1: m.m1, m2: m.m2, m3: m.m3, m4: m.m4,
        m5: ["", ""], m6: ["", ""], m7: ["", ""], m8: ["", ""],
        winners: {}, dq: {}, times: {}
    });
}

function toggleManualAssign(eventId, classId) {
    if (!isAdmin) return;
    manualModes[`${eventId}-${classId}`] = !manualModes[`${eventId}-${classId}`];
    renderBracketUI(eventId, classId);
}

function lockInManualBracket(eventId, classId, isRelay) {
    if (!isAdmin) return;
    const getVal = (id) => {
        const el = document.getElementById(id);
        if (!el) return "";
        const v = el.value;
        return (v === "BYE" || v === "") ? v : parseInt(v);
    };
    const ev = {
        m1: ["", ""], m2: ["", ""], m3: ["", ""], m4: ["", ""],
        m5: ["", ""], m6: ["", ""], m7: ["", ""], m8: ["", ""],
        winners: {}, dq: {}, times: {}
    };
    for (let i = 1; i <= 4; i++) {
        const mId = `m${i}`;
        if (!isRelay) {
            ev[mId] = [getVal(`sel-${eventId}-${classId}-${mId}-0`), getVal(`sel-${eventId}-${classId}-${mId}-1`)];
        } else {
            const p1a = getVal(`sel-${eventId}-${classId}-${mId}-0-a`), p1b = getVal(`sel-${eventId}-${classId}-${mId}-0-b`);
            const p2a = getVal(`sel-${eventId}-${classId}-${mId}-1-a`), p2b = getVal(`sel-${eventId}-${classId}-${mId}-1-b`);
            ev[mId] = [
                (p1a === "BYE" && p1b === "BYE") ? "BYE" : ((p1a === "" && p1b === "") ? "" : [p1a || "BYE", p1b || "BYE"]),
                (p2a === "BYE" && p2b === "BYE") ? "BYE" : ((p2a === "" && p2b === "") ? "" : [p2a || "BYE", p2b || "BYE"])
            ];
        }
    }
    autoAdvanceCascade(ev);
    data.events[classId][eventId] = ev;
    manualModes[`${eventId}-${classId}`] = false;
    saveData();
}

function advanceTeam(eventId, classId, matchId, teamIndex) {
    if (!isAdmin) return;
    const ev = data.events[classId][eventId];
    if(!ev || !ev[matchId] || ev.isRevealing || manualModes[`${eventId}-${classId}`]) return;
    const winner = ev[matchId][teamIndex];
    if(!isValidTeam(winner)) return;

    ev.winners[matchId] = winner;
    autoAdvanceCascade(ev);
    saveData();
}

function toggleDQ(event, eventId, classId, matchId, slotIdx) {
    event.stopPropagation();
    if (!isAdmin) return;
    const ev = data.events[classId][eventId];
    if (!ev || !ev[matchId]) return;

    if (!ev.dq) ev.dq = {};
    if (!ev.dq[matchId]) ev.dq[matchId] = {};
    ev.dq[matchId][slotIdx] = !ev.dq[matchId][slotIdx];
    if (!ev.dq[matchId][slotIdx]) delete ev.dq[matchId][slotIdx];

    autoAdvanceCascade(ev);
    saveData();
}

function renderBracketUI(eventId, classId) {
    const container = document.getElementById(`bracket-${eventId}-${classId}`);
    const controlsContainer = document.getElementById(`controls-${eventId}-${classId}`);
    const overlay = document.getElementById(`podium-overlay-${eventId}-${classId}`);
    const ev = getCleanOrExistingEvent(eventId, classId);
    const isRelay = eventId === 'relay';
    const isManual = !!manualModes[`${eventId}-${classId}`];
    const isRevealing = ev.isRevealing === true;
    const hasLanes = ['tug', 'dash', 'relay'].includes(eventId);

    if (controlsContainer) {
        if (isManual) {
            controlsContainer.innerHTML = `
                <button onclick="lockInManualBracket('${eventId}', ${classId}, ${isRelay})" style="background-color: var(--green);">✓ Lock In Seeds</button>
                <button onclick="toggleManualAssign('${eventId}', ${classId})" class="btn-remove">Cancel</button>
            `;
        } else {
            controlsContainer.innerHTML = `
                <button class="admin-only" onclick="${isRelay ? 'randomizeRelayBracket' : 'randomizeBracket'}('${eventId}', ${classId})">Randomize Bracket</button>
                <button class="admin-only" onclick="toggleManualAssign('${eventId}', ${classId})" style="background-color: #5c6bc0;">Manual Assign</button>
                <button class="admin-only btn-remove" onclick="clearBracket('${eventId}', ${classId})">Clear</button>
            `;
        }
    }

    const medals = getBracketMedals(ev);
    const award = data.awards ? data.awards[classId]?.[eventId] : null;

    if (overlay) {
        if (!isManual && !isRevealing && ((medals && medals.gold) || (award && award.first !== "None"))) {
            const gName = award ? award.first : getTeamNameDisplay(medals.gold);
            const sName = award ? award.second : (medals.silver ? getTeamNameDisplay(medals.silver) : "—");
            const bName = award ? award.third : (medals.bronze ? getTeamNameDisplay(medals.bronze) : "—");
            const titleMap = { 'tug': 'Tug-o-War', 'dash': 'X-Meter Dash', 'relay': 'Robo-Relay' };
            overlay.innerHTML = buildPodiumHTML(
                { name: gName, sub: "5 pts" },
                { name: sName, sub: sName !== "—" && sName !== "None" ? "3 pts" : "" },
                { name: bName, sub: bName !== "—" && bName !== "None" ? "1 pt" : "" },
                `${titleMap[eventId] || eventId.toUpperCase()} Champions`,
                true
            );
            overlay.style.display = "flex";
        } else {
            overlay.style.display = "none";
        }
    }

    const buildSelectOptions = (selectedVal) => {
        const classTeams = data.teams.filter(t => t.classId === classId);
        let optHTML = `<option value="">-- Empty --</option><option value="BYE" ${selectedVal === 'BYE' ? 'selected' : ''}>BYE</option>`;
        classTeams.forEach(t => optHTML += `<option value="${t.id}" ${selectedVal === t.id ? 'selected' : ''}>${t.name}</option>`);
        return optHTML;
    };

    const renderTeamSlot = (mId, slotIdx) => {
        const currentVal = ev[mId][slotIdx];
        const isDQ = isSlotDQ(ev, mId, slotIdx);
        const hasTeam = isValidTeam(currentVal);

        if (isManual && ['m1', 'm2', 'm3', 'm4'].includes(mId)) {
            if (!isRelay) {
                return `<div class="team locked"><select id="sel-${eventId}-${classId}-${mId}-${slotIdx}">${buildSelectOptions(currentVal)}</select></div>`;
            } else {
                const valA = Array.isArray(currentVal) ? currentVal[0] : (currentVal === 'BYE' ? 'BYE' : '');
                const valB = Array.isArray(currentVal) ? currentVal[1] : (currentVal === 'BYE' ? 'BYE' : '');
                return `
                <div class="team locked">
                    <div class="relay-pair">
                        <select id="sel-${eventId}-${classId}-${mId}-${slotIdx}-a">${buildSelectOptions(valA)}</select>
                        <span>&</span>
                        <select id="sel-${eventId}-${classId}-${mId}-${slotIdx}-b">${buildSelectOptions(valB)}</select>
                    </div>
                </div>`;
            }
        }

        const isMatchDecided = ev.winners && ev.winners[mId] !== undefined && ev.winners[mId] !== "";
        const didWinThisMatch = isMatchDecided && isSameTeam(ev.winners[mId], currentVal);
        const didLoseThisMatch = isMatchDecided && !didWinThisMatch && hasTeam;

        let classes = "team";
        if (currentVal === "?") classes += " suspense";
        if (isRevealing || currentVal === "BYE" || currentVal === "" || isManual || isDQ || !isAdmin) classes += " locked";

        if (hasLanes && hasTeam && !isDQ) {
            classes += slotIdx === 0 ? " lane-blue" : " lane-red";
        }

        let medalTag = "";
        let winnerCheck = "";

        if (isDQ) {
            classes += " dq-active";
        } else if (medals && hasTeam) {
            const isGold = isSameTeam(currentVal, medals.gold);
            const isSilver = isSameTeam(currentVal, medals.silver);
            const isBronze = isSameTeam(currentVal, medals.bronze);

            if (mId === 'm7') {
                if (isGold) { classes += " medal-gold"; medalTag = '<span class="medal-badge-tag">🥇 1st</span>'; }
                else if (isSilver) { classes += " medal-silver"; medalTag = '<span class="medal-badge-tag">🥈 2nd</span>'; }
            } else if (mId === 'm8') {
                if (isBronze) { classes += " medal-bronze"; medalTag = '<span class="medal-badge-tag">🥉 3rd</span>'; }
                else if (didLoseThisMatch) classes += " lost-team";
            } else {
                if (didWinThisMatch) {
                    classes += " winner";
                    winnerCheck = '<span class="winner-check">✓</span>';
                } else if (didLoseThisMatch) classes += " lost-team";
            }
        } else {
            if (didWinThisMatch) {
                classes += " winner";
                winnerCheck = '<span class="winner-check">✓</span>';
            }
            if (didLoseThisMatch) classes += " lost-team";
        }

        const showFlag = !isRevealing && !isManual && hasTeam && isAdmin;
        const recordedTime = ev.times?.[mId]?.[slotIdx] || "";
        const showTimeBox = hasTeam && !isManual && !isRevealing && ['dash', 'relay'].includes(eventId);

        return `
        <div class="${classes}" ${(!isRevealing && !isManual && !isDQ && isAdmin) ? `onclick="advanceTeam('${eventId}', ${classId}, '${mId}', ${slotIdx})"` : ''}>
            <span class="team-name-text">
                ${isDQ ? '<span class="dq-badge">DQ</span>' : ''}
                ${medalTag}
                ${winnerCheck}
                ${getTeamNameDisplay(currentVal)}
            </span>
            ${showTimeBox ? `
                <input type="text" class="match-time-input" value="${recordedTime}" placeholder="--:--" ${isAdmin ? '' : 'readonly'} onclick="event.stopPropagation()" onchange="updateMatchTime('${eventId}', ${classId}, '${mId}', ${slotIdx}, this.value)">
            ` : ''}
            ${showFlag ? `
                <button class="dq-flag-btn ${isDQ ? 'is-dq' : ''}" onclick="toggleDQ(event, '${eventId}', ${classId}, '${mId}', ${slotIdx})" title="${isDQ ? 'Overturn DQ' : 'DQ team'}">🚩</button>
            ` : ''}
        </div>`;
    };

    const renderMatch = (mId, title) => {
        const t0 = ev[mId][0], t1 = ev[mId][1];
        const valid0 = isValidTeam(t0) && !isSlotDQ(ev, mId, 0);
        const valid1 = isValidTeam(t1) && !isSlotDQ(ev, mId, 1);
        const hasTwoTeams = valid0 && valid1;
        const canTimeMatch = hasTwoTeams || (valid0 && t1 === "BYE") || (valid1 && t0 === "BYE");
        const showMatchTimer = !isRevealing && !isManual && canTimeMatch && isAdmin;

        return `
        <div class="match">
            <div class="match-title">
                <span>${title}</span>
                ${showMatchTimer ? `<button class="match-timer-btn" onclick="openMatchTimer('${eventId}',${classId}, '${mId}', '${title}')">⏱️ Start</button>` : ''}
            </div>
            ${renderTeamSlot(mId, 0)}
            ${renderTeamSlot(mId, 1)}
        </div>`;
    };

    if (container) {
        container.innerHTML = `
            <div class="round">${renderMatch('m1', 'Q1')} ${renderMatch('m2', 'Q2')} ${renderMatch('m3', 'Q3')} ${renderMatch('m4', 'Q4')}</div>
            <div class="round" style="justify-content: space-around;">${renderMatch('m5', 'Semi 1')} ${renderMatch('m6', 'Semi 2')}</div>
            <div class="round" style="justify-content: center; gap: 20px;">${renderMatch('m7', '1st/2nd FINAL')} ${renderMatch('m8', '3rd Place')}</div>
        `;
    }
}

// ==========================================
// ROBATHALON (EVENT 4 - TIMED TRIAL LOGIC)
// ==========================================
function getCleanAthalon(classId) {
    if (!data.events[classId]) data.events[classId] = {};
    if (!data.events[classId].athalon || typeof data.events[classId].athalon !== 'object') {
        data.events[classId].athalon = { runs: {} };
    }
    if (!data.events[classId].athalon.runs) {
        data.events[classId].athalon.runs = {};
    }
    return data.events[classId].athalon;
}

function updateAthalonTeamDropdown(classId) {
    const roundSel = document.getElementById(`athalon-round-select-${classId}`);
    const teamSel = document.getElementById(`athalon-team-select-${classId}`);
    if (!roundSel || !teamSel) return;

    const roundNum = parseInt(roundSel.value) || 1;
    const ath = getCleanAthalon(classId);
    const classTeams = data.teams.filter(t => t.classId === classId);

    teamSel.innerHTML = "";

    if (roundNum === 1) {
        classTeams.forEach(t => {
            const rData = ath.runs[t.id];
            const hasRun = rData && (rData.r1 || rData.r1Ms !== null);
            const opt = document.createElement('option');
            opt.value = t.id;
            opt.innerText = `${t.name} ${hasRun ? `(✓ ${rData.r1})` : '(Pending)'}`;
            teamSel.appendChild(opt);
        });
    } else {
        const rankedR1 = getAthalonRankedTeams(classId, 1);
        const top3 = rankedR1.slice(0, 3);
        if (top3.length === 0) {
            const opt = document.createElement('option');
            opt.value = "";
            opt.innerText = "-- Complete Round 1 First --";
            teamSel.appendChild(opt);
        } else {
            top3.forEach(t => {
                const rData = ath.runs[t.id];
                const hasRun = rData && (rData.r2 || rData.r2Ms !== null);
                const opt = document.createElement('option');
                opt.value = t.id;
                opt.innerText = `${t.name} ${hasRun ? `(✓ ${rData.r2})` : '(Pending Final)'}`;
                teamSel.appendChild(opt);
            });
        }
    }
}

function launchAthalonRun(classId) {
    if (!isAdmin) return;
    const roundSel = document.getElementById(`athalon-round-select-${classId}`);
    const teamSel = document.getElementById(`athalon-team-select-${classId}`);
    if (!teamSel || !teamSel.value) {
        alert("Please select a team to run.");
        return;
    }

    const teamId = parseInt(teamSel.value);
    const roundNum = parseInt(roundSel.value) || 1;
    openAthalonModalTimer(classId, teamId, roundNum);
}

function openAthalonModalTimer(classId, teamId, roundNum) {
    const team = data.teams.find(t => t.id === teamId);
    if (!team) return;

    currentMatchContext = { eventId: 'athalon', classId, teamId, roundNum, teamName: team.name };
    clearConfetti();

    const modal = document.getElementById('match-modal');
    document.getElementById('modal-event-name').innerText = `ROBATHALON - ROUND ${roundNum}`;
    document.getElementById('modal-matchup-title').innerHTML = `🏃 Running: <span style="color:var(--blue); font-weight:bold;">${team.name}</span>`;
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
        else {
            clearInterval(cdInterval);
            startActiveAthalonClock();
        }
    }, 1000);
}

function startActiveAthalonClock() {
    const displayArea = document.getElementById('modal-display-area');
    const clockControls = document.getElementById('modal-clock-controls');
    clockControls.style.display = 'block';

    const startTime = Date.now();
    displayArea.innerHTML = `<div class="clock-active">00:00.00</div>`;
    clockControls.innerHTML = `
        <button class="btn-single-stop btn-stop-1st" onclick="stopAthalonRun(${startTime})">
            ⏹️ STOP TIMER
        </button>
    `;

    if (modalTimerInterval) clearInterval(modalTimerInterval);
    modalTimerInterval = setInterval(() => {
        displayArea.innerHTML = `<div class="clock-active">${formatMs(Date.now() - startTime, true)}</div>`;
    }, 30);
}

function stopAthalonRun(startTime) {
    if (modalTimerInterval) clearInterval(modalTimerInterval);
    const elapsed = Date.now() - startTime;
    const timeStr = formatMs(elapsed, false);
    playAirhorn();
    launchConfetti();

    const displayArea = document.getElementById('modal-display-area');
    const actionsArea = document.getElementById('modal-actions-area');
    const clockControls = document.getElementById('modal-clock-controls');
    const btnContainer = document.getElementById('modal-winner-buttons');
    const actionsHeading = document.getElementById('modal-actions-heading');
    clockControls.style.display = 'none';

    displayArea.innerHTML = `
        <div class="flag-box">🏁</div>
        <div style="font-size:22px; font-weight:bold; color:var(--green); margin-bottom:5px;">RUN FINISHED!</div>
        <div style="font-size:20px; font-weight:bold; color:#333; margin-top:5px;">Official Time: <strong style="color:var(--blue); font-family:monospace;">${timeStr}</strong></div>
    `;

    actionsHeading.innerText = "CONFIRM & SAVE TIME:";
    btnContainer.innerHTML = `
        <button class="modal-winner-btn" onclick="saveAthalonRunTime(${elapsed}, '${timeStr}')">
            ✓ Confirm Time for ${currentMatchContext.teamName} (${timeStr})
        </button>
    `;
    actionsArea.style.display = 'block';
}

function saveAthalonRunTime(elapsedMs, timeStr) {
    if (!currentMatchContext) return;
    const { classId, teamId, roundNum } = currentMatchContext;
    const ath = getCleanAthalon(classId);

    if (!ath.runs[teamId]) ath.runs[teamId] = { r1Ms: null, r1: "", r2Ms: null, r2: "", dq: false };

    if (roundNum === 1) {
        ath.runs[teamId].r1Ms = elapsedMs;
        ath.runs[teamId].r1 = timeStr;
    } else {
        ath.runs[teamId].r2Ms = elapsedMs;
        ath.runs[teamId].r2 = timeStr;
    }

    closeMatchModal();
    renderAthalon();
    saveData();
}

function updateAthalonManualTime(classId, teamId, roundNum, val) {
    if (!isAdmin) return;
    const ath = getCleanAthalon(classId);
    if (!ath.runs[teamId]) ath.runs[teamId] = { r1Ms: null, r1: "", r2Ms: null, r2: "", dq: false };

    const parsedMs = parseTimeToMs(val);
    if (roundNum === 1) {
        ath.runs[teamId].r1 = val.trim();
        ath.runs[teamId].r1Ms = parsedMs;
    } else {
        ath.runs[teamId].r2 = val.trim();
        ath.runs[teamId].r2Ms = parsedMs;
    }
    renderAthalon();
    saveData();
}

function getAthalonRankedTeams(classId, roundNum = 1) {
    const ath = getCleanAthalon(classId);
    const classTeams = data.teams.filter(t => t.classId === classId);

    if (roundNum === 1) {
        return classTeams.slice().sort((a, b) => {
            const ra = ath.runs[a.id];
            const rb = ath.runs[b.id];
            const msA = ra && ra.r1Ms !== null && !ra.dq ? ra.r1Ms : Infinity;
            const msB = rb && rb.r1Ms !== null && !rb.dq ? rb.r1Ms : Infinity;
            return msA - msB;
        });
    } else {
        const top3R1 = getAthalonRankedTeams(classId, 1).slice(0, 3);
        return top3R1.slice().sort((a, b) => {
            const ra = ath.runs[a.id];
            const rb = ath.runs[b.id];
            const msA = ra && ra.r2Ms !== null && !ra.dq ? ra.r2Ms : (ra && ra.r1Ms ? ra.r1Ms : Infinity);
            const msB = rb && rb.r2Ms !== null && !rb.dq ? rb.r2Ms : (rb && rb.r1Ms ? rb.r1Ms : Infinity);
            return msA - msB;
        });
    }
}

function renderAthalon() {
    [1, 2].forEach(cId => {
        const tbody = document.getElementById(`athalonBody${cId}`);
        const overlay = document.getElementById(`podium-overlay-athalon-${cId}`);
        if (!tbody) return;

        const ath = getCleanAthalon(cId);
        const rankedR1 = getAthalonRankedTeams(cId, 1);
        const top3Ids = rankedR1.slice(0, 3).map(t => t.id);
        const rankedR2 = getAthalonRankedTeams(cId, 2);

        tbody.innerHTML = rankedR1.map((t, index) => {
            const rData = ath.runs[t.id] || { r1: "", r2: "", r1Ms: null, r2Ms: null, dq: false };
            const isTop3 = top3Ids.includes(t.id) && rData.r1Ms !== null;

            let medalBadge = "";
            let medalRowClass = "";
            if (isTop3) {
                const finalIdx = rankedR2.findIndex(x => x.id === t.id);
                if (finalIdx === 0 && rData.r2Ms !== null) { medalBadge = '🥇 1st'; medalRowClass = 'medal-gold'; }
                else if (finalIdx === 1 && rData.r2Ms !== null) { medalBadge = '🥈 2nd'; medalRowClass = 'medal-silver'; }
                else if (finalIdx === 2 && rData.r2Ms !== null) { medalBadge = '🥉 3rd'; medalRowClass = 'medal-bronze'; }
                else { medalBadge = '<span class="qualifier-badge">⭐ Qualifier</span>'; }
            }

            return `
            <tr class="${medalRowClass}">
                <td><strong>${index + 1}</strong></td>
                <td style="text-align:left; font-weight:600; padding-left:10px;">${t.name}</td>
                <td>
                    <input type="text" class="match-time-input" value="${rData.r1 || ''}" placeholder="--:--" ${isAdmin ? '' : 'readonly'} onchange="updateAthalonManualTime(${cId}, ${t.id}, 1, this.value)">
                </td>
                <td>
                    ${isTop3 ? `
                        <input type="text" class="match-time-input" value="${rData.r2 \vert{}\vert{} ''}" placeholder="--:--" ${isAdmin ? '' : 'readonly'} onchange="updateAthalonManualTime(${cId},${t.id}, 2, this.value)">
                    ` : `<span style="color:#aaa; font-size:11px;">—</span>`}
                </td>
                <td><strong>${medalBadge || '—'}</strong></td>
            </tr>`;
        }).join('');

        updateAthalonTeamDropdown(cId);

        if (overlay) {
            const award = data.awards ? data.awards[cId]?.['athalon'] : null;
            const r2Finals = rankedR2.filter(t => ath.runs[t.id] && ath.runs[t.id].r2Ms !== null);

            if ((r2Finals.length >= 3 && !award) || (award && award.first !== "None")) {
                const gName = award ? award.first : rankedR2[0]?.name;
                const sName = award ? award.second : rankedR2[1]?.name;
                const bName = award ? award.third : rankedR2[2]?.name;

                overlay.innerHTML = buildPodiumHTML(
                    { name: gName, sub: "5 pts" },
                    { name: sName || "—", sub: sName ? "3 pts" : "" },
                    { name: bName || "—", sub: bName ? "1 pt" : "" },
                    "Robathalon Champions",
                    true
                );
                overlay.style.display = "flex";
            } else {
                overlay.style.display = "none";
            }
        }
        updateStatusDisplay('athalon', cId);
    });
}

function awardAthalonPoints(classId) {
    if (!isAdmin) return;
    const rankedR2 = getAthalonRankedTeams(classId, 2);
    const ath = getCleanAthalon(classId);

    const validTop = rankedR2.filter(t => ath.runs[t.id] && (ath.runs[t.id].r2Ms !== null || ath.runs[t.id].r1Ms !== null));
    if (validTop.length === 0) {
        alert("Please complete at least one race run before awarding points.");
        return;
    }

    if (data.awards[classId]?.['athalon']) undoEventPoints('athalon', classId);

    let historyList = [];
    let first = validTop[0] || null;
    let second = validTop[1] || null;
    let third = validTop[2] || null;

    if (first) { first.points += 5; historyList.push({ id: first.id, pts: 5 }); }
    if (second) { second.points += 3; historyList.push({ id: second.id, pts: 3 }); }
    if (third) { third.points += 1; historyList.push({ id: third.id, pts: 1 }); }

    data.awards[classId]['athalon'] = {
        history: historyList,
        first: first ? first.name : "None",
        second: second ? second.name : "None",
        third: third ? third.name : "None",
        firstId: first ? first.id : null,
        secondId: second ? second.id : null,
        thirdId: third ? third.id : null
    };

    saveData();
}

function revokeAthalonPoints(classId) {
    if (!isAdmin) return;
    if (!data.awards[classId]?.['athalon']) return;
    if (confirm("Reset Robathalon points for this class?")) {
        undoEventPoints('athalon', classId);
        saveData();
    }
}

function updateStatusDisplay(eventId, classId) {
    const el = document.getElementById(`status-${eventId}-${classId}`);
    if (!el) return;
    const award = data.awards ? data.awards[classId]?.[eventId] : null;
    if (award) {
        el.className = "award-status status-awarded";
        const parts = [];
        if (award.first !== "None") parts.push(`🥇 1st: ${award.first}`);
        if (award.second !== "None") parts.push(`🥈 2nd: ${award.second}`);
        if (award.third !== "None") parts.push(`🥉 3rd: ${award.third}`);
        el.innerHTML = "✅ Points Awarded: " + (parts.length > 0 ? parts.join(", ") : "None");
    } else {
        el.className = "award-status";
        el.innerHTML = "⚪ Points Not Awarded";
    }
}

function awardPoints(eventId, classId) {
    if (!isAdmin) return;
    const ev = data.events[classId][eventId];
    if (!ev || isBracketPending(ev)) {
        alert("Please complete all active matches before awarding points.");
        return;
    }

    if (data.awards[classId]?.[eventId]) undoEventPoints(eventId, classId);

    const first = ev.winners['m7'];
    const second = isSameTeam(ev.m7[0], first) ? ev.m7[1] : ev.m7[0];
    const third = ev.winners['m8'];

    const validFirst = isValidTeam(first) && !isSlotDQ(ev, 'm7', (isSameTeam(ev.m7[0], first) ? 0 : 1));
    const validSecond = isValidTeam(second) && !isSlotDQ(ev, 'm7', (isSameTeam(ev.m7[0], first) ? 1 : 0));
    const validThird = isValidTeam(third) && !isSlotDQ(ev, 'm8', (isSameTeam(ev.m8[0], third) ? 0 : 1));

    let historyList = [];
    const applyPts = (idData, pts) => {
        if (!isValidTeam(idData)) return;
        if (Array.isArray(idData)) { idData.forEach(i => applyPts(i, pts)); return; }
        let team = data.teams.find(t => t.id === idData);
        if (team) { team.points += pts; historyList.push({ id: team.id, pts: pts }); }
    };

    if (validFirst) applyPts(first, 5);
    if (validSecond) applyPts(second, 3);
    if (validThird) applyPts(third, 1);

    data.awards[classId][eventId] = {
        history: historyList,
        first: validFirst ? getTeamNameDisplay(first) : "None",
        second: validSecond ? getTeamNameDisplay(second) : "None",
        third: validThird ? getTeamNameDisplay(third) : "None",
        firstId: validFirst ? first : null,
        secondId: validSecond ? second : null,
        thirdId: validThird ? third : null
    };
    saveData();
}

function undoEventPoints(eventId, classId) {
    const award = data.awards[classId]?.[eventId];
    if (award && award.history) {
        award.history.forEach(h => {
            let team = data.teams.find(t => t.id === h.id);
            if (team) team.points -= h.pts;
        });
        data.awards[classId][eventId] = null;
    }
}

function revokePoints(eventId, classId) {
    if (!isAdmin) return;
    if (!data.awards[classId]?.[eventId]) return;
    if (confirm("Reset points for this event? Points will be subtracted from the leaderboard.")) {
        undoEventPoints(eventId, classId);
        saveData();
    }
}

function renderGolf() {
    const buildGolfTable = (cId, tbodyId, overlayId) => {
        const tbody = document.getElementById(tbodyId);
        if (!tbody) return;
        tbody.innerHTML = data.teams.filter(t => t.classId === cId).map(t => `
            <tr>
                <td>${t.name}</td>
                <td><input type="number" value="${data.golfScores[t.id] ?? ''}" ${isAdmin ? `onchange="updateGolfScore(${t.id}, this.value)"` : 'readonly'} style="width: 80px;"></td>
            </tr>
        `).join('');

        const overlay = document.getElementById(overlayId);
        if (overlay) {
            const award = data.awards ? data.awards[cId]?.['golf'] : null;
            if (award && award.first !== "None") {
                overlay.innerHTML = buildPodiumHTML(
                    { name: award.first, sub: "10 pts (Double)" },
                    { name: award.second, sub: award.second !== "None" ? "6 pts" : "" },
                    { name: award.third, sub: award.third !== "None" ? "2 pts" : "" },
                    "Bot-Bot Golf Champions",
                    true
                );
                overlay.style.display = "flex";
            } else {
                overlay.style.display = "none";
            }
        }
    };
    buildGolfTable(1, 'golfBody1', 'podium-overlay-golf-1');
    buildGolfTable(2, 'golfBody2', 'podium-overlay-golf-2');
}

function updateGolfScore(id, val) {
    if (!isAdmin) return;
    if(val === "") delete data.golfScores[id];
    else data.golfScores[id] = parseInt(val);
    saveData();
}

function awardGolfPoints(classId) {
    if (!isAdmin) return;
    let scores = [];
    data.teams.filter(t => t.classId === classId).forEach(t => {
        if(data.golfScores[t.id] !== undefined) scores.push({ id: t.id, name: t.name, score: data.golfScores[t.id] });
    });
    scores.sort((a, b) => a.score - b.score);
    if(scores.length === 0) { alert("Please enter at least one score."); return; }

    if (data.awards[classId]?.['golf']) undoEventPoints('golf', classId);

    let historyList = [];
    let first = null, second = null, third = null;
    if (scores[0]) { first = data.teams.find(t => t.id === scores[0].id); first.points += 10; historyList.push({ id: first.id, pts: 10 }); }
    if (scores[1]) { second = data.teams.find(t => t.id === scores[1].id); second.points += 6; historyList.push({ id: second.id, pts: 6 }); }
    if (scores[2]) { third = data.teams.find(t => t.id === scores[2].id); third.points += 2; historyList.push({ id: third.id, pts: 2 }); }

    data.awards[classId]['golf'] = {
        history: historyList,
        first: first ? first.name : "None",
        second: second ? second.name : "None",
        third: third ? third.name : "None",
        firstId: first ? first.id : null,
        secondId: second ? second.id : null,
        thirdId: third ? third.id : null
    };
    saveData();
}

function revokeGolfPoints(classId) {
    if (!isAdmin) return;
    if (!data.awards[classId]?.['golf']) return;
    if (confirm("Reset golf points for this class?")) {
        undoEventPoints('golf', classId);
        saveData();
    }
}

function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active-tab'));
    const target = document.getElementById(tabId);
    if (target) target.classList.add('active-tab');
}

function updateClassTitles() {
    document.querySelectorAll('.title-c1').forEach(el => el.innerText = data.class1Name || "Guiendon");
    document.querySelectorAll('.title-c2').forEach(el => el.innerText = data.class2Name || "Vernon");
}
