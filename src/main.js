import './style.css';
import { GameMode } from './game.js';
import { TimeService } from './time_service.js';
import { Random } from './random.js';
import { Solver } from './solver.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-analytics.js";

if (import.meta.env.VITE_FIREBASE_API_KEY) {
  try {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    };
    const app = initializeApp(firebaseConfig);
    getAnalytics(app);
  } catch (e) {
    console.warn("Analytics error:", e);
  }
}

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
        <div id="daily-countdown">Connecting to Time Service...</div>
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
      <div style="display: flex; flex-direction: column; gap: 10px; align-items: center; margin-top: 20px;">
        <button id="victory-share" style="background-color: var(--medium); width: 200px;">Share Result</button>
        <button id="victory-next" style="width: 200px;">Close</button>
      </div>
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
    victory.innerHTML = '<h2>Victory!</h2><div class="stats" id="tiktok-stats"></div><div class="challenge">Can you beat this?</div>';
    document.body.appendChild(victory);
}

const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const inventoryEl = document.getElementById('inventory');
const resetBtn = document.getElementById('reset-btn');
const timerEl = document.getElementById('timer');
const bestTimerEl = document.getElementById('best-timer');
const countdownEl = document.getElementById('daily-countdown');

const game = new GameMode(boardEl, statusEl, inventoryEl, timerEl, bestTimerEl);

document.querySelectorAll('.diff-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    const diff = e.target.dataset.diff;
    if (diff !== 'tutorial' && TimeService.currentUtcDateStr) {
        Random.setSeed(TimeService.currentUtcDateStr + "-v3-" + diff);
    } else {
        Random.setSeed(null);
    }
    game.init(diff);
  });
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
        }
    } catch (e) {
        console.warn("Could not fetch daily maps, falling back to local generation.", e);
    }
}

async function run() {
    countdownEl.textContent = "Loading puzzles...";
    await TimeService.fetchTime();
    await fetchDailyMaps();

    setInterval(() => {
        if (TimeService.checkNeedRefresh()) {
            countdownEl.textContent = "Loading new puzzles...";
            location.reload();
            return;
        }
        countdownEl.textContent = TimeService.getNextResetTimeStr();
    }, 1000);
    if (!TimeService.checkNeedRefresh()) {
        countdownEl.textContent = TimeService.getNextResetTimeStr();
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
    
    if (startDifficulty !== 'tutorial' && TimeService.currentUtcDateStr) {
        Random.setSeed(TimeService.currentUtcDateStr + "-v3-" + startDifficulty);
    } else {
        Random.setSeed(null);
    }
    game.init(startDifficulty);

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
