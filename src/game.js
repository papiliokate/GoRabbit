import { Engine, DIRS } from './engine.js';
import { Solver } from './solver.js';
import { Generator } from './generator.js';

export class GameMode {
  constructor(boardEl, statusEl, inventoryEl, hintEl) {
    this.boardEl = boardEl;
    this.statusEl = statusEl;
    this.inventoryEl = inventoryEl;
    this.hintEl = hintEl;

    this.state = null;

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleBoardClick = this.handleBoardClick.bind(this);
    this.handleRightClick = this.handleRightClick.bind(this);
  }

  init(difficulty = 'easy') {
    const { map, solution } = Generator.generate(difficulty);
    this.initialMap = map; // Store for reset
    this.state = Generator.mapToState(map);
    this.solution = solution;

    this.boardEl.style.gridTemplateColumns = `repeat(${this.state.width}, var(--cell-size))`;
    this.updateStatus(`Go! Target moves: ${this.solution?.length || '?'}`);
    this.render();

    if (!this.boundEvents) {
      window.addEventListener("keydown", this.handleKeyDown);
      this.boardEl.addEventListener("click", this.handleBoardClick);
      this.boardEl.addEventListener("contextmenu", this.handleRightClick);
      this.boundEvents = true;
    }
  }

  handleKeyDown(event) {
    if (this.state.gameOver) return;

    let dx = 0, dy = 0;
    switch (event.key.toLowerCase()) {
      case 'w': dy = -1; break;
      case 's': dy = 1; break;
      case 'a': dx = -1; break;
      case 'd': dx = 1; break;
      default: return;
    }

    this.applyAction({ type: 'MOVE', dx, dy });
  }

  handleRightClick(e) {
    e.preventDefault();
    this.handleInteraction(e.target);
  }

  handleBoardClick(e) {
    // If it's a mobile touch/click, handle interaction
    this.handleInteraction(e.target);
  }

  handleInteraction(target) {
    if (this.state.gameOver) return;
    const cellEl = target.closest('.cell');
    if (!cellEl) return;

    const tx = parseInt(cellEl.dataset.x);
    const ty = parseInt(cellEl.dataset.y);

    this.applyAction({ type: 'THROW', tx, ty });
  }

  applyAction(action) {
    const nextState = Engine.getNextState(this.state, action);
    if (nextState.moveCount > this.state.moveCount || nextState.gameOver !== this.state.gameOver) {
      this.state = nextState;
      this.render();
      this.updateStatus(this.state.win ? "Victory!" : this.state.gameOver ? "Game Over!" : "Keep going...");
    }
  }

  reset() {
    if (!this.initialMap) return;
    this.state = Generator.mapToState(this.initialMap);
    this.render();
    this.updateStatus(`Level Reset! Target moves: ${this.solution?.length || '?'}`);
  }

  updateStatus(msg) {
    this.statusEl.textContent = msg;
    this.inventoryEl.textContent = `Eggs: ${this.state.eggs} | Moves: ${this.state.moveCount}`;
  }

  render() {
    this.boardEl.innerHTML = '';
    const { width, height, grid, rabbit, gameOver } = this.state;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cellDiv = document.createElement('div');
        cellDiv.classList.add('cell');
        cellDiv.dataset.x = x;
        cellDiv.dataset.y = y;

        const coordSpan = document.createElement('span');
        coordSpan.classList.add('coord-label');
        coordSpan.textContent = `${x},${y}`;
        cellDiv.appendChild(coordSpan);

        let char = grid[y][x];
        if (rabbit.x === x && rabbit.y === y) {
          char = gameOver && !this.state.win ? 'X' : 'R';
        }

        if (char !== ' ') {
          const visualMap = {
            'R': '🐇', 'T': '🌲', 'L': '🪵', 'B': '🦫',
            'F': '🦊', 'P': '🦔', 'M': '🐻', 'N': '🪹',
            'W': '🕳️', 'E': '🚪', 'X': '💀'
          };
          const dirMap = { '^': '⬆️', 'v': '⬇️', '<': '⬅️', '>': '➡️' };

          const type = char[0];
          const spriteSpan = document.createElement('span');
          spriteSpan.classList.add('entity-sprite');
          spriteSpan.textContent = visualMap[type] || type;
          cellDiv.appendChild(spriteSpan);

          if (char.length > 1) {
            const dirSpan = document.createElement('span');
            dirSpan.classList.add('direction-indicator');
            dirSpan.textContent = dirMap[char[1]] || '';
            cellDiv.appendChild(dirSpan);
          }
        }
        this.boardEl.appendChild(cellDiv);
      }
    }
  }
}
