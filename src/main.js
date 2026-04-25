import './style.css';
import { GameMode } from './game.js';
import { TimeService } from './time_service.js';
import { Random } from './random.js';
import { Solver } from './solver.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-analytics.js";

let analytics; // Declare analytics outside try so it can be used later

// Meta-Cipher System (IDL Timezone)
window.getDailyCypher = function(gameIndex) {
    function mulberry32(a) {
        return function() {
          var t = a += 0x6D2B79F5;
          t = Math.imul(t ^ t >>> 15, t | 1);
          t ^= t + Math.imul(t ^ t >>> 7, t | 61);
          return ((t ^ t >>> 14) >>> 0) / 4294967296;
        }
    }
    function getSeed(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) { hash = str.charCodeAt(i) + ((hash << 5) - hash); }
        return hash;
    }
    const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Pacific/Kiritimati', year: 'numeric', month: '2-digit', day: '2-digit' });
    const dateStr = formatter.format(new Date());
    let seed = getSeed(dateStr);
    let rand = mulberry32(seed);
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let cyphers = [];
    for(let k=0; k<3; k++) {
        let str = "";
        for(let j=0; j<4; j++) { str += chars.charAt(Math.floor(rand() * chars.length)); }
        cyphers.push(str);
    }
    let assignment = [0,1,2];
    for (var i = assignment.length - 1; i > 0; i--) {
        var j = Math.floor(rand() * (i + 1));
        var temp = assignment[i];
        assignment[i] = assignment[j];
        assignment[j] = temp;
    }
    let result = ["","",""];
    result[assignment[0]] = cyphers[0];
    result[assignment[1]] = cyphers[1];
    result[assignment[2]] = cyphers[2];
    return result[gameIndex];
};
if (import.meta.env.VITE_FIREBASE_API_KEY) {
  try {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: "G-BJLK9339LN",
    };
    const app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
  } catch (e) {
    console.warn("Analytics error:", e);
  }
}

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
});

document.querySelector('#app').innerHTML = `
  <div id="game-container">
    <header id="game-header">
      <div id="collapsible-menu">
        <h1>Go Rabbit - Daily Puzzles</h1>
        <div class="controls">
          <button class="diff-btn" data-diff="tutorial">Tutorial</button>
          <button class="diff-btn" data-diff="small">S</button>
          <button class="diff-btn" data-diff="medium">M</button>
          <button class="diff-btn" data-diff="large">L</button>
          <button class="diff-btn" data-diff="extra_large">XL</button>
          <button id="reset-btn">↻</button>
        </div>
        <div id="daily-countdown" style="display: flex; justify-content: space-between; align-items: center;">
            <span id="countdown-text">Connecting to Time Service...</span>
            <button id="btn-binge-play" style="display: none; padding: 4px 10px; font-size: 0.9rem; background: linear-gradient(135deg, #e91e63 0%, #ff6090 100%); color: white; border-radius: 12px; border: 1px solid white;">🎟️ <span id="binge-count">0</span> Sets</button>
        </div>
      </div>
      <div id="hud-panel">
        <div id="status">Select a difficulty to start!</div>
        <div id="inventory">Eggs: 0 | Lettuce: 0 | Moves: 0</div>
        <div class="timer-wrapper">
          <div class="timer-title">Set and beat your best time.</div>
          <div class="timer-display-group">
              <div class="current-time-box">
                  <div class="time-label">Current</div>
                  <div id="timer">00:00.0</div>
              </div>
              <div class="best-time-box">
                  <div class="time-label">Best Today</div>
                  <div id="best-timer">--:--.-</div>
              </div>
          </div>
          <button id="hud-share" style="display: none; background-color: var(--medium); margin-top: 10px; width: 100%;">Share Stats</button>
        </div>
      </div>
    </header>
    <div class="board-wrapper">
      <main id="board"></main>
    </div>
  </div>
  <div id="tutorial-modal" class="modal" style="display: none;">
    <div class="modal-content">
      <p id="tutorial-text"></p>
      <button id="tutorial-ok">OK</button>
    </div>
  </div>
  <div id="choice-modal" class="modal" style="display: none;">
    <div class="modal-content victory-content">
      <h2 class="victory-title" style="margin-bottom: 20px;">Choose Action</h2>
      <p style="margin-bottom: 25px; line-height: 1.5;">Do you want to move here, or throw lettuce?</p>
      <div style="display: flex; gap: 15px; justify-content: center;">
        <button id="choice-move" style="padding: 12px 20px; font-size: 16px; background-color: #38bdf8; border: none; border-radius: 8px; color: white; cursor: pointer; font-weight: bold;">🐇 Move Here</button>
        <button id="choice-throw" style="padding: 12px 20px; font-size: 16px; background-color: #4ade80; border: none; border-radius: 8px; color: white; cursor: pointer; font-weight: bold;">🥬 Throw Lettuce</button>
      </div>
      <button id="choice-cancel" style="margin-top: 20px; background: transparent; color: #999; border: none; cursor: pointer;">Cancel</button>
    </div>
  </div>
  <div id="victory-modal" class="modal" style="display: none;">
    <div class="modal-content victory-content">
      <h2 class="victory-title">Level Complete!</h2>
      <p id="victory-text"></p>
      
      <!-- Regular Next Map Button -->
      <div id="victory-regular-actions" style="display: flex; flex-direction: column; gap: 10px; align-items: center; margin-top: 20px;">
        <button id="victory-next" class="primary-btn" style="width: 100%;">Next Map</button>
        <div class="cross-promo" style="margin-top: 15px; border-top: 1px dashed #ccc; padding-top: 15px; width: 100%; text-align: center;">
            <p style="margin-bottom: 10px;">Play a different game</p>
            <a href="https://oops-games-hub.web.app" class="promo-btn" style="display: block; padding: 10px; background: #9c27b0; color: white; border-radius: 10px; text-decoration: none;">🎮 Go to Games Hub</a>
        </div>
      </div>
      
      <!-- Grand Binge UI (Map 5) -->
      <div id="victory-grand-actions" style="display: none; flex-direction: column; gap: 10px; align-items: center; margin-top: 20px;">
        <button id="btn-remind-tomorrow" class="primary-btn" style="width: 100%;">📲 Add to Device</button>
        <button id="btn-share-free" class="primary-btn" style="width: 100%;">📤 Brag and get free puzzles</button>
        <button id="btn-buy-binge" class="premium-btn" style="width: 100%; background: linear-gradient(135deg, #e91e63 0%, #ff6090 100%);">🎟️ Binge Sets ($0.99)</button>
        
        <div class="cross-promo" style="margin-top: 15px; border-top: 1px dashed #ccc; padding-top: 15px; width: 100%; text-align: center;">
            <p style="margin-bottom: 10px;">Play a different game</p>
            <a href="https://oops-games-hub.web.app" class="promo-btn" style="display: block; padding: 10px; background: #9c27b0; color: white; border-radius: 10px; text-decoration: none;">🎮 Go to Games Hub</a>
        </div>
      </div>
      
      <p id="victory-cypher" style="font-size: 1.5rem; font-family: monospace; letter-spacing: 4px; color: #333; margin: 15px auto; font-weight: bold; background: #eee; padding: 10px; border-radius: 10px; border: 2px dashed #ccc; width: fit-content;"></p>
    </div>
  </div>
  <div id="ios-install-modal" class="modal" style="display: none;">
    <div class="modal-content victory-content">
      <h2 style="color: #4CAF50; margin-bottom: 15px;">Free Binge Sets!</h2>
      <p style="font-size: 1.2rem; line-height: 1.5; margin-bottom: 20px;">
        Apple doesn't let us install apps automatically. 😢<br><br>
        But if you tap the <strong>Share</strong> icon below, and then <strong>Add to Home Screen</strong>, we'll give you a free Binge Set when you open the app!
      </p>
      <button id="btn-close-ios-modal" style="padding: 12px 20px; font-size: 16px; background-color: #38bdf8; border: none; border-radius: 8px; color: white; cursor: pointer; font-weight: bold; width: 100%;">Got it!</button>
    </div>
  </div>
`;

const urlParams = new URLSearchParams(window.location.search);
const isTikTok = urlParams.get('tiktok') === 'true';

if (isTikTok) {
    document.body.classList.add('tiktok-mode');
    
    const bg = document.createElement('div');
    bg.className = 'tiktok-bg';
    document.body.appendChild(bg);
    
    const header = document.createElement('div');
    header.className = 'tiktok-header';
    header.innerHTML = '<h1 class="tiktok-title">Go Rabbit</h1><div class="tiktok-subtitle">Daily Puzzle</div>';
    document.body.appendChild(header);
    
    const footer = document.createElement('div');
    footer.className = 'tiktok-footer';
    footer.innerHTML = '<div class="tiktok-link">go-rabbit-4af82.web.app</div><div class="tiktok-bio">Play Free Now!</div>';
    document.body.appendChild(footer);
    
    const victory = document.createElement('div');
    victory.id = 'tiktok-victory-display';
    victory.className = 'tiktok-victory';
    victory.innerHTML = `
        <h2>Victory!</h2>
        <div class="stats" id="tiktok-stats"></div>
        <div class="challenge" style="margin-bottom: 20px;">Play all our games for free!</div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 15px; background: linear-gradient(135deg, #ff416c, #ff4b2b); padding: 20px 40px; border-radius: 40px; font-weight: bold; font-size: 1.8rem; box-shadow: 0 8px 16px rgba(0,0,0,0.4); animation: pulseCTA 1s infinite alternate; color: white;">
             <span style="font-size: 2.5rem;">🔗</span>
             <span>LINK IN BIO TO PLAY</span>
        </div>
        <style>@keyframes pulseCTA { 0% { transform: scale(1); box-shadow: 0 8px 16px rgba(255, 65, 108, 0.4); } 100% { transform: scale(1.05); box-shadow: 0 15px 30px rgba(255, 65, 108, 0.7); } }</style>
    `;
    document.body.appendChild(victory);
}

const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const inventoryEl = document.getElementById('inventory');
const resetBtn = document.getElementById('reset-btn');
const timerEl = document.getElementById('timer');
const bestTimerEl = document.getElementById('best-timer');
const countdownEl = document.getElementById('countdown-text');

const game = new GameMode(boardEl, statusEl, inventoryEl, timerEl, bestTimerEl);

window.currentMapIndex = 0;
let bingeSetsCount = parseInt(localStorage.getItem("bingeSetsCount") || "0");

const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
if (isStandalone && !localStorage.getItem('pwaBountyClaimed')) {
    localStorage.setItem('pwaBountyClaimed', 'true');
    bingeSetsCount += 1;
    localStorage.setItem('bingeSetsCount', bingeSetsCount);
    setTimeout(() => {
        const statusEl = document.getElementById('status');
        if (statusEl) {
            const oldStatus = statusEl.textContent;
            statusEl.textContent = "Bounty Claimed: +1 Binge Set!";
            setTimeout(() => statusEl.textContent = oldStatus, 3000);
        }
    }, 1000);
}

function updateBingeUI() {
    const btn = document.getElementById("btn-binge-play");
    const countEl = document.getElementById("binge-count");
    if (bingeSetsCount > 0) {
        countEl.textContent = bingeSetsCount;
        btn.style.display = "inline-block";
    } else {
        btn.style.display = "none";
    }
}
updateBingeUI();

document.querySelectorAll('.diff-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    const diff = e.target.dataset.diff;
    window.currentMapIndex = 0;
    if (diff !== 'tutorial' && TimeService.currentUtcDateStr) {
        Random.setSeed(TimeService.currentUtcDateStr + "-v3-" + diff + "-" + window.currentMapIndex);
    } else {
        Random.setSeed(null);
    }
    game.init(diff);
  });
});

const DIFF_PROGRESSION = ['small', 'medium', 'large', 'extra_large'];

window.loadNextMapInSet = function(diff) {
    let diffIdx = DIFF_PROGRESSION.indexOf(diff);
    if (diffIdx === -1 && diff !== 'extra_large') diffIdx = -1; // e.g. tutorial

    let nextDiff = diff;
    if (diffIdx >= 0 && diffIdx < DIFF_PROGRESSION.length - 1) {
        nextDiff = DIFF_PROGRESSION[diffIdx + 1];
    } else if (diffIdx === -1) {
        nextDiff = 'small';
    }
    
    // Update active UI button
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
    const activeBtn = document.querySelector(`.diff-btn[data-diff="${nextDiff}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    window.currentMapIndex++;
    if (TimeService.currentUtcDateStr) {
        Random.setSeed(TimeService.currentUtcDateStr + "-v3-" + nextDiff + "-" + window.currentMapIndex);
    }
    game.init(nextDiff);
};

window.consumeBingeSetAndPlay = function(diff) {
    if (bingeSetsCount > 0) {
        bingeSetsCount--;
        localStorage.setItem("bingeSetsCount", bingeSetsCount);
        updateBingeUI();
        window.currentMapIndex = 0;
        // completely randomize seed for binge sets
        Random.setSeed(Date.now() + "-" + Math.random() + "-" + diff);
        game.init(diff);
    }
};

document.getElementById("btn-binge-play").addEventListener("click", () => {
    const activeBtn = document.querySelector('.diff-btn.active');
    if (!activeBtn) return;
    window.consumeBingeSetAndPlay(activeBtn.dataset.diff);
});

resetBtn.addEventListener('click', () => {
  game.reset();
});

const headerEl = document.getElementById('game-header');

window.dailyMaps = null;

async function fetchDailyMaps() {
    try {
        const res = await fetch('/daily_maps.json?v=' + Date.now());
        if (res.ok) {
            window.dailyMaps = await res.json();
            console.log("Loaded daily maps from server.");
            if (window.dailyMaps._date) {
                TimeService.currentUtcDateStr = window.dailyMaps._date;
            }
            return true;
        }
    } catch (e) {
        console.warn("Could not fetch daily maps, falling back to local generation.", e);
    }
    return false;
}

async function run() {
    countdownEl.textContent = "Loading puzzles...";
    await TimeService.fetchTime();
    await fetchDailyMaps();

    let nextCheckTime = 0;
    setInterval(async () => {
        if (TimeService.checkNeedRefresh()) {
            const now = Date.now();
            countdownEl.textContent = "Generating new puzzles... Stand by.";
            if (now > nextCheckTime) {
                try {
                    const res = await fetch('/daily_maps.json?v=' + Date.now());
                    if (res.ok) {
                        const newData = await res.json();
                        if (newData._date && newData._date === TimeService.getLiveUtcDateStr()) {
                            countdownEl.textContent = "Loading new puzzles...";
                            location.reload();
                            return;
                        }
                    }
                } catch (e) {}
                nextCheckTime = now + 60000; // Poll every 60s
            }
        } else {
            countdownEl.textContent = TimeService.getNextResetTimeStr();
        }
    }, 1000);

    if (!TimeService.checkNeedRefresh()) {
        countdownEl.textContent = TimeService.getNextResetTimeStr();
    } else {
        countdownEl.textContent = "Generating new puzzles... Stand by.";
    }

    // Start with small by default
    const autoplayMode = urlParams.get('autoplay');
    let startDifficulty = urlParams.get('diff') || 'small';
    if (['tutorial', 'small', 'medium', 'large', 'extra_large'].includes(autoplayMode)) {
        startDifficulty = autoplayMode;
    } else if (autoplayMode) {
        startDifficulty = 'small'; // Lock non-standard modes to small
    }
    
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
    
    const activeBtn = document.querySelector(`.diff-btn[data-diff="${startDifficulty}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    
    window.currentMapIndex = 0;
    if (startDifficulty !== 'tutorial' && TimeService.currentUtcDateStr) {
        Random.setSeed(TimeService.currentUtcDateStr + "-v3-" + startDifficulty + "-0");
    } else {
        Random.setSeed(null);
    }
    game.init(startDifficulty);

    document.getElementById("victory-next").addEventListener("click", () => {
        document.getElementById("victory-modal").style.display = "none";
        const currentDiff = game.difficulty || 'small';
        window.loadNextMapInSet(currentDiff);
    });

    document.getElementById("btn-remind-tomorrow").addEventListener("click", () => {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        if (isIOS) {
            document.getElementById('ios-install-modal').style.display = 'flex';
        } else {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                    }
                    deferredPrompt = null;
                });
            } else {
                alert("Added to device!");
            }
        }
    });

    document.getElementById("btn-close-ios-modal").addEventListener("click", () => {
        document.getElementById('ios-install-modal').style.display = 'none';
    });

    document.getElementById("btn-share-free").addEventListener("click", () => {
        const currentDiff = game.difficulty || 'small';
        const bestTimeStr = document.getElementById('best-timer').innerText || "00:00.0";
        const grid = Array(5).fill("").map(() => Math.random() > 0.3 ? "🟩" : "🥬").join("");
        
        const text = `Go Rabbit 🐇 Map: ${currentDiff.toUpperCase()} | Best: ${bestTimeStr}\n${grid}\n\nPlay free at https://go-rabbit-4af82.web.app`;
        if (navigator.share) {
            navigator.share({ title: 'Go Rabbit', text }).then(() => {
                bingeSetsCount++;
                localStorage.setItem("bingeSetsCount", bingeSetsCount);
                updateBingeUI();
                setTimeout(() => window.consumeBingeSetAndPlay(currentDiff), 1000);
            }).catch(e => console.warn(e));
        } else {
            navigator.clipboard.writeText(text).then(() => {
                bingeSetsCount++;
                localStorage.setItem("bingeSetsCount", bingeSetsCount);
                updateBingeUI();
                alert("Copied to clipboard! Enjoy 1 Free Binge Set.");
                setTimeout(() => window.consumeBingeSetAndPlay(currentDiff), 1000);
            });
        }
    });

    document.getElementById("btn-buy-binge").addEventListener("click", () => {
        if (analytics) {
            logEvent(analytics, 'binge_presale_click');
        }
        window.location.href = 'https://oops-games-hub.web.app/presale.html';
    });
    
    // TEST HARNESS HOOKS
    window.addEventListener("message", (e) => {
        try {
            if (!e.data || !e.data.type) return;
            switch (e.data.type) {
                case "MOCK_PURCHASE":
                    console.log("Mock purchase event received in main.js");
                    bingeSetsCount += 5;
                    localStorage.setItem("bingeSetsCount", bingeSetsCount);
                    updateBingeUI();
                    console.log("victory modal style:", document.getElementById("victory-modal").style.display);
                    if (document.getElementById("victory-modal").style.display !== "none") {
                        document.getElementById("victory-modal").style.display = "none";
                        const activeBtn = document.querySelector('.diff-btn.active');
                        if (activeBtn) window.consumeBingeSetAndPlay(activeBtn.dataset.diff);
                    }
                    if (window.parent && window.parent !== window) window.parent.postMessage({ type: 'PURCHASE_SUCCESS' }, "*");
                    break;
                case "FORCE_WIN":
                    console.log("Force win event received in main.js", { game, state: game ? game.state : null });
                    if (game && game.state) {
                        game.state.gameOver = true;
                        game.state.win = true;
                        game.stopTimer();
                        game.showVictoryBanner();
                        game.render();
                        if (window.parent && window.parent !== window) window.parent.postMessage({ type: 'LOG', message: `Force Win Triggered` }, "*");
                    }
                    break;
                case "ADD_POINTS":
                    if (game && game.state) {
                        game.state.lettuce += 50;
                        game.state.eggs += 50;
                        game.updateStatus("Cheat Activated!");
                        if (window.parent && window.parent !== window) window.parent.postMessage({ type: 'LOG', message: `Ammo updated` }, "*");
                    }
                    break;
                case "RESET_DATA":
                    localStorage.clear();
                    if (window.parent && window.parent !== window) window.parent.postMessage({ type: 'LOG', message: `Local Storage Wiped. Reloading...` }, "*");
                    setTimeout(() => location.reload(), 500);
                    break;
            }
        } catch (err) {
            console.error("TEST HARNESS ERROR:", err);
            if (window.parent && window.parent !== window) window.parent.postMessage({ type: 'LOG', message: `ERROR: ${err.message}` }, "*");
        }
    });

    if (autoplayMode) {
        // Wait for visual initialization and then start solving
        setTimeout(() => {
            const solution = Solver.solve(game.state, 20000);
            if (solution) {
                if (autoplayMode === 'fail') {
                    // Generate a bad path: 3 correct moves, then back-and-forth
                    const badPath = [];
                    for(let i=0; i<Math.min(3, solution.length); i++) badPath.push(solution[i]);
                    if (solution.length > 0 && solution[0].type === 'MOVE') {
                        const m = solution[0];
                        badPath.push({ type: 'MOVE', dx: -m.dx, dy: -m.dy });
                        badPath.push(m);
                        badPath.push({ type: 'MOVE', dx: -m.dx, dy: -m.dy });
                    }
                    game.actionQueue = badPath;
                } else if (autoplayMode === 'interactive') {
                    game.actionQueue = solution.slice(0, -1);
                } else {
                    game.actionQueue = solution;
                }

                let phase = autoplayMode === 'fail' ? 'failing' : 'standard';

                // Add a delay between moves for better visual capture
                game.processNextAction = function() {
                  if (this.actionQueue && this.actionQueue.length > 0 && !this.state.gameOver && !this.state.win) {
                      const nextAction = this.actionQueue.shift();
                      setTimeout(() => {
                         this.applyAction(nextAction);
                      }, phase === 'recovery' ? 80 : 130);
                  } else if (this.state.win) {
                      window._GAME_WON = true;
                      // Explicit hold for video ending capture
                      if (!window._VIDEO_RECORDING_DONE_TIMEOUT_SET) {
                          window._VIDEO_RECORDING_DONE_TIMEOUT_SET = true;
                          setTimeout(() => window._VIDEO_RECORDING_DONE = true, 4000);
                      }
                  } else if (phase === 'failing' && this.actionQueue.length === 0) {
                      // We finished the bad path. Force game over visually.
                      this.state.gameOver = true;
                      this.updateStatus("Game Over!");
                      this.render();
                      
                      setTimeout(() => {
                          game.reset();
                          setTimeout(() => {
                              phase = 'recovery';
                              game.actionQueue = Solver.solve(game.state, 20000);
                              game.processNextAction();
                          }, 1000);
                      }, 2000);
                  } else if (autoplayMode === 'interactive' && this.actionQueue.length === 0 && !this.state.win) {
                      const overlay = document.createElement('div');
                      overlay.style.position = 'absolute';
                      overlay.style.top = '50%'; overlay.style.left = '50%';
                      overlay.style.transform = 'translate(-50%, -50%)';
                      overlay.style.backgroundColor = 'rgba(0,0,0,0.8)';
                      overlay.style.color = 'white';
                      overlay.style.padding = '30px';
                      overlay.style.borderRadius = '15px';
                      overlay.style.fontSize = '36px';
                      overlay.style.fontWeight = 'bold';
                      overlay.style.textAlign = 'center';
                      overlay.style.zIndex = '1000';
                      overlay.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
                      
                      const finalMove = solution[solution.length - 1];
                      const labels = { '0,-1': 'UP', '0,1': 'DOWN', '-1,0': 'LEFT', '1,0': 'RIGHT' };
                      const correctLabel = finalMove.type === 'MOVE' ? labels[`${finalMove.dx},${finalMove.dy}`] : 'THROW';
                      const badLabels = Object.values(labels).filter(l => l !== correctLabel);
                      const badLabel = badLabels[Math.floor(Math.random() * badLabels.length)];
                      const isA = Math.random() > 0.5;
                      
                      overlay.innerHTML = `Which move wins?<br/><br/><span style="color:#4ade80">A: ${isA ? correctLabel : badLabel}</span><br/><span style="color:#f87171">B: ${!isA ? correctLabel : badLabel}</span>`;
                      document.querySelector('.board-wrapper').appendChild(overlay);

                      let timerCount = 5;
                      const timerEl = document.createElement('div');
                      timerEl.style.marginTop = '20px';
                      timerEl.style.color = '#facc15';
                      timerEl.textContent = timerCount;
                      overlay.appendChild(timerEl);

                      const countdown = setInterval(() => {
                          timerCount--;
                          timerEl.textContent = timerCount;
                          if (timerCount <= 0) {
                              clearInterval(countdown);
                              overlay.remove();
                              game.actionQueue = [finalMove];
                              game.processNextAction();
                          }
                      }, 1000);
                  }
                };
                
                game.processNextAction();
            } else {
                console.error("Autoplay failed to solve the map.");
            }
        }, 1500);
    }
}

run();
