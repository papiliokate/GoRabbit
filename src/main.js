import './style.css';
import { GameMode } from './game.js';

document.querySelector('#app').innerHTML = `
  <div id="game-container">
    <header>
      <h1>Go Rabbit - Puzzles</h1>
      <div class="controls">
        <button class="diff-btn" data-diff="small">Small</button>
        <button class="diff-btn" data-diff="medium">Medium</button>
        <button class="diff-btn" data-diff="large">Large</button>
        <button class="diff-btn" data-diff="extra_large">Extra Large</button>
        <button id="reset-btn">Reset</button>
      </div>
      <div id="status">Select a difficulty to start!</div>
      <div id="inventory">Eggs: 0 | Moves: 0</div>
    </header>
    <main id="board"></main>
  </div>
`;

const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const inventoryEl = document.getElementById('inventory');
const resetBtn = document.getElementById('reset-btn');

const game = new GameMode(boardEl, statusEl, inventoryEl);

document.querySelectorAll('.diff-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const diff = e.target.dataset.diff;
    game.init(diff);
  });
});

resetBtn.addEventListener('click', () => {
  game.reset();
});

// Start with small by default
game.init('small');
