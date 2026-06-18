// FIFA Match Predictor Logic & Sound effects

let allClubs = [];
let allNations = [];
let soundEnabled = true;

// Web Audio API Synth Sounds
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound(type) {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        const now = audioCtx.currentTime;

        if (type === 'click') {
            // Short wooden button click sound
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(10, now + 0.08);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
            osc.start(now);
            osc.stop(now + 0.08);
        } else if (type === 'goal') {
            // Level up / Firework sound (arpeggio of notes)
            osc.type = 'square';
            const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
            const duration = 0.08;
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
            
            notes.forEach((freq, index) => {
                osc.frequency.setValueAtTime(freq, now + index * duration);
            });
            osc.start(now);
            osc.stop(now + notes.length * duration + 0.1);
        } else if (type === 'whistle') {
            // Classic referee whistle sound (high frequency modulation)
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, now);
            osc.frequency.linearRampToValueAtTime(1250, now + 0.1);
            osc.frequency.linearRampToValueAtTime(1200, now + 0.2);
            osc.frequency.linearRampToValueAtTime(1250, now + 0.3);
            
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
        }
    } catch (e) {
        console.error("Audio error:", e);
    }
}

// Populate selectors and handle search
function populateDropdown(selectEl, searchEl, typeEl, ratingValEl, isHome) {
    const list = typeEl.value === 'club' ? allClubs : allNations;
    const filter = searchEl.value.toLowerCase();
    
    // Store selected value to keep it if possible
    const prevVal = selectEl.value;

    selectEl.innerHTML = '';
    
    const filteredList = list.filter(team => team.name.toLowerCase().includes(filter));
    
    filteredList.forEach(team => {
        const option = document.createElement('option');
        option.value = team.name;
        option.textContent = team.name;
        option.dataset.rating = team.rating;
        selectEl.appendChild(option);
    });

    // Restore selected value or select first
    if (filteredList.length > 0) {
        if (prevVal && filteredList.some(t => t.name === prevVal)) {
            selectEl.value = prevVal;
        } else {
            selectEl.selectedIndex = 0;
        }
        ratingValEl.textContent = selectEl.options[selectEl.selectedIndex].dataset.rating;
    } else {
        ratingValEl.textContent = '--';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // Setup references
    const homeType = document.getElementById('home-type');
    const homeSearch = document.getElementById('home-search');
    const homeTeam = document.getElementById('home-team');
    const homeRatingVal = document.getElementById('home-rating-val');

    const awayType = document.getElementById('away-type');
    const awaySearch = document.getElementById('away-search');
    const awayTeam = document.getElementById('away-team');
    const awayRatingVal = document.getElementById('away-rating-val');

    const audioToggle = document.getElementById('audio-toggle');
    const predictBtn = document.getElementById('predict-btn');
    const resetBtn = document.getElementById('reset-btn');
    const rematchBtn = document.getElementById('rematch-btn');
    const setupScreen = document.getElementById('setup-screen');
    const simScreen = document.getElementById('sim-screen');
    const outcomePanel = document.getElementById('outcome-panel');

    // Audio Toggle Listener
    audioToggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        audioToggle.textContent = soundEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
        playSound('click');
    });

    // Generic button click sounds
    document.querySelectorAll('.mc-button').forEach(btn => {
        btn.addEventListener('mousedown', () => playSound('click'));
    });

    // Load Teams list from API
    try {
        const resp = await fetch('/api/teams');
        const data = await resp.json();
        if (data.success) {
            allClubs = data.clubs;
            allNations = data.nations;
            
            // Initial render
            populateDropdown(homeTeam, homeSearch, homeType, homeRatingVal, true);
            populateDropdown(awayTeam, awaySearch, awayType, awayRatingVal, false);
        } else {
            alert('Failed to load teams from database.');
        }
    } catch (err) {
        console.error("Error loading teams list:", err);
    }

    // Dropdown change and search events
    homeType.addEventListener('change', () => {
        homeSearch.value = '';
        populateDropdown(homeTeam, homeSearch, homeType, homeRatingVal, true);
    });
    homeSearch.addEventListener('input', () => {
        populateDropdown(homeTeam, homeSearch, homeType, homeRatingVal, true);
    });
    homeTeam.addEventListener('change', () => {
        if (homeTeam.selectedIndex !== -1) {
            homeRatingVal.textContent = homeTeam.options[homeTeam.selectedIndex].dataset.rating;
        }
    });

    awayType.addEventListener('change', () => {
        awaySearch.value = '';
        populateDropdown(awayTeam, awaySearch, awayType, awayRatingVal, false);
    });
    awaySearch.addEventListener('input', () => {
        populateDropdown(awayTeam, awaySearch, awayType, awayRatingVal, false);
    });
    awayTeam.addEventListener('change', () => {
        if (awayTeam.selectedIndex !== -1) {
            awayRatingVal.textContent = awayTeam.options[awayTeam.selectedIndex].dataset.rating;
        }
    });

    // Predict simulation triggers
    let cachedPrediction = null;

    predictBtn.addEventListener('click', async () => {
        const homeName = homeTeam.value;
        const awayName = awayTeam.value;

        if (!homeName || !awayName) {
            alert('Please select two teams.');
            return;
        }
        if (homeName === awayName) {
            alert('A team cannot play against itself!');
            return;
        }

        setupScreen.classList.add('hidden');
        simScreen.classList.remove('hidden');
        outcomePanel.classList.add('hidden');

        await startSimulation(homeName, awayName);
    });

    resetBtn.addEventListener('click', () => {
        simScreen.classList.add('hidden');
        setupScreen.classList.remove('hidden');
    });

    rematchBtn.addEventListener('click', async () => {
        outcomePanel.classList.add('hidden');
        await startSimulation(homeTeam.value, awayTeam.value);
    });

    async function startSimulation(teamA, teamB) {
        // Reset scoreboard views
        document.getElementById('sim-home-name').textContent = teamA;
        document.getElementById('sim-away-name').textContent = teamB;
        document.getElementById('sim-home-score').textContent = '0';
        document.getElementById('sim-away-score').textContent = '0';
        
        const homeRating = homeTeam.options[homeTeam.selectedIndex].dataset.rating;
        const awayRating = awayTeam.options[awayTeam.selectedIndex].dataset.rating;
        document.getElementById('sim-home-rating').textContent = `Rating: ${homeRating}`;
        document.getElementById('sim-away-rating').textContent = `Rating: ${awayRating}`;

        const xpFill = document.getElementById('xp-fill');
        const xpText = document.getElementById('xp-text');
        const chatMessages = document.getElementById('chat-messages');

        xpFill.style.width = '0%';
        xpText.textContent = '0%';
        chatMessages.innerHTML = '';

        // Fetch prediction from backend
        try {
            const res = await fetch(`/api/predict?team_a=${encodeURIComponent(teamA)}&team_b=${encodeURIComponent(teamB)}`);
            const data = await res.json();
            if (data.success) {
                cachedPrediction = data.prediction;
                runVisualSimulation(cachedPrediction);
            } else {
                chatMessages.innerHTML = `<div class="chat-row chat-foul">[Error] ${data.error}</div>`;
            }
        } catch (e) {
            chatMessages.innerHTML = `<div class="chat-row chat-foul">[Error] Failed to connect to prediction engine.</div>`;
        }
    }

    function runVisualSimulation(pred) {
        const events = pred.events;
        const chatMessages = document.getElementById('chat-messages');
        const xpFill = document.getElementById('xp-fill');
        const xpText = document.getElementById('xp-text');

        // Play whistle start sound
        playSound('whistle');

        let currentEventIdx = 0;
        const totalDuration = 5000; // 5 seconds simulation duration
        const startTime = Date.now();

        const simInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(100, (elapsed / totalDuration) * 100);
            
            xpFill.style.width = `${progress}%`;
            xpText.textContent = `${Math.round(progress)}%`;

            // Calculate active game minute based on simulation progress
            const gameMinute = Math.min(90, Math.floor((progress / 100) * 90));

            // Print events that occurred up to the current game minute
            while (currentEventIdx < events.length && events[currentEventIdx].minute <= gameMinute) {
                const event = events[currentEventIdx];
                const chatRow = document.createElement('div');
                chatRow.className = 'chat-row';

                let timeTag = `<span class="chat-time">[Min ${event.minute}]</span> `;
                let message = event.description;

                if (event.type.startsWith('goal')) {
                    chatRow.classList.add('chat-goal');
                    playSound('goal');
                    // Update score live
                    document.getElementById('sim-home-score').textContent = event.score_a;
                    document.getElementById('sim-away-score').textContent = event.score_b;
                } else if (event.type === 'yellow' || event.type === 'foul') {
                    chatRow.classList.add('chat-foul');
                } else if (event.type === 'start' || event.type === 'half_time' || event.type === 'full_time') {
                    chatRow.classList.add('chat-system');
                }

                chatRow.innerHTML = timeTag + message;
                chatMessages.appendChild(chatRow);
                chatMessages.scrollTop = chatMessages.scrollHeight;

                currentEventIdx++;
            }

            if (progress >= 100) {
                clearInterval(simInterval);
                playSound('whistle');
                showStats(pred);
            }
        }, 100);
    }

    function showStats(pred) {
        const outcomePanel = document.getElementById('outcome-panel');
        outcomePanel.classList.remove('hidden');

        // Populate names on stats
        document.getElementById('prob-home-name').textContent = `${pred.team_a.name} Win`;
        document.getElementById('prob-away-name').textContent = `${pred.team_b.name} Win`;

        // Set probability bar widths and values
        document.getElementById('prob-home-val').textContent = `${pred.team_a.win_probability}%`;
        document.getElementById('prob-draw-val').textContent = `${pred.draw_probability}%`;
        document.getElementById('prob-away-val').textContent = `${pred.team_b.win_probability}%`;

        document.getElementById('prob-home-bar').style.width = `${pred.team_a.win_probability}%`;
        document.getElementById('prob-draw-bar').style.width = `${pred.draw_probability}%`;
        document.getElementById('prob-away-bar').style.width = `${pred.team_b.win_probability}%`;
    }
});
