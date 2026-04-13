import './style.css';
import { GameMode } from './game.js';
import { TimeService } from './time_service.js';
import { Random } from './random.js';

document.querySelector('#app').innerHTML = `
  <div id="game-container">
    <header id="game-header">
      <div id="collapsible-menu">
        <h1>Go Rabbit - Daily Puzzles</h1>
        <div class="controls">
          <button class="diff-btn" data-diff="tutorial">Tutorial</button>
          <button class="diff-btn" data-diff="small">Small</button>
          <button class="diff-btn" data-diff="medium">Medium</button>
          <button class="diff-btn" data-diff="large">Large</button>
          <button class="diff-btn" data-diff="extra_large">Extra Large</button>
          <button id="reset-btn">Reset</button>
        </div>
        <div id="daily-countdown">Connecting to Time Service...</div>
      </div>
      <div id="hud-panel">
        <button id="menu-toggle">▼ Menu</button>
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
      <button id="victory-next">Close</button>
    </div>
  </div>
`;

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
        Random.setSeed(TimeService.currentUtcDateStr + "-" + diff);
    } else {
        Random.setSeed(null);
    }
    game.init(diff);
  });
});

resetBtn.addEventListener('click', () => {
  game.reset();
});

const menuToggle = document.getElementById('menu-toggle');
const headerEl = document.getElementById('game-header');
menuToggle.addEventListener('click', () => {
  headerEl.classList.remove('collapsed');
  setTimeout(() => game.adjustScale(), 10);
});

async function run() {
    await TimeService.fetchTime();
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
    document.querySelector('.diff-btn[data-diff="small"]').classList.add('active');
    if (TimeService.currentUtcDateStr) {
        Random.setSeed(TimeService.currentUtcDateStr + "-small");
    }
    game.init('small');
}

run();
