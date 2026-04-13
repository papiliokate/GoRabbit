import { Engine, DIRS } from './engine.js';
import { Solver } from './solver.js';
import { Generator } from './generator.js';
import { tutorialMap, getTutorialTriggers } from './tutorial_map.js';
import { TimeService } from './time_service.js';
// SVGs replaced with AI generated textures

export class GameMode {
  constructor(boardEl, statusEl, inventoryEl, timerEl, bestTimerEl) {
    this.boardEl = boardEl;
    this.statusEl = statusEl;
    this.inventoryEl = inventoryEl;
    this.timerEl = timerEl;
    this.bestTimerEl = bestTimerEl;

    this.state = null;
    this.startTime = null;
    this.timerInterval = null;
    this.totalTimeStr = "00:00.0";
    this.isAnimating = false;
    this.entityMap = new Map(); // Tracks entities by unique ID for animation

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleBoardClick = this.handleBoardClick.bind(this);
    this.adjustScaleBound = this.adjustScale.bind(this);

    this.isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    this.audioContext = null;
    this.audioBuffers = {};
    this.audioInitialized = false;
    this.loadSounds();
  }

  async loadSounds() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    // We will use synthesized sounds as placeholders until real assets are provided
  }

  playSound(name) {
    if (!this.audioContext || !this.audioInitialized) return;
    
    // Play a synthesized placeholder sound based on the name
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    
    const now = this.audioContext.currentTime;
    
    switch(name) {
      case 'hop':
         osc.type = 'sine';
         osc.frequency.setValueAtTime(400, now);
         osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
         gain.gain.setValueAtTime(0.1, now);
         gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
         osc.start(now); osc.stop(now + 0.1);
         break;
      case 'skitter':
         osc.type = 'triangle';
         osc.frequency.setValueAtTime(800, now);
         gain.gain.setValueAtTime(0.05, now);
         gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
         osc.start(now); osc.stop(now + 0.05);
         break;
      case 'walk':
         osc.type = 'square';
         osc.frequency.setValueAtTime(200, now);
         gain.gain.setValueAtTime(0.05, now);
         gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
         osc.start(now); osc.stop(now + 0.05);
         break;
      case 'chew':
         osc.type = 'sawtooth';
         osc.frequency.setValueAtTime(150, now);
         gain.gain.setValueAtTime(0.1, now);
         gain.gain.linearRampToValueAtTime(0, now + 0.15);
         osc.start(now); osc.stop(now + 0.15);
         break;
      case 'throw':
         osc.type = 'sine';
         osc.frequency.setValueAtTime(600, now);
         osc.frequency.exponentialRampToValueAtTime(300, now + 0.2);
         gain.gain.setValueAtTime(0.05, now);
         gain.gain.linearRampToValueAtTime(0, now + 0.2);
         osc.start(now); osc.stop(now + 0.2);
         break;
      case 'splat':
         osc.type = 'sawtooth';
         osc.frequency.setValueAtTime(100, now);
         osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
         gain.gain.setValueAtTime(0.2, now);
         gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
         osc.start(now); osc.stop(now + 0.2);
         break;
      case 'pickup':
         osc.type = 'sine';
         osc.frequency.setValueAtTime(500, now);
         osc.frequency.setValueAtTime(800, now + 0.05);
         gain.gain.setValueAtTime(0.1, now);
         gain.gain.linearRampToValueAtTime(0, now + 0.1);
         osc.start(now); osc.stop(now + 0.1);
         break;
    }
  }

  init(difficulty = 'easy') {
    this.difficulty = difficulty;
    this.triggeredAlerts = new Set();
    
    this.stopTimer();
    this.startTime = null;
    this.totalTimeStr = "00:00.0";
    if (this.timerEl) this.timerEl.textContent = "00:00.0";
    
    this.bestTimeKey = `bestToday-${TimeService.currentUtcDateStr || 'dev'}-${difficulty}`;
    const bestMs = localStorage.getItem(this.bestTimeKey);
    if (bestMs && this.bestTimerEl) {
        this.bestTimerEl.textContent = this.formatTime(parseInt(bestMs, 10));
    } else if (this.bestTimerEl) {
        this.bestTimerEl.textContent = "--:--.-";
    }
    
    let map, solution;
    if (difficulty === 'tutorial') {
      map = tutorialMap.map(row => [...row]);
      solution = [];
    } else {
      const gen = Generator.generate(difficulty, true);
      map = gen.map;
      solution = gen.solution;
    }
    
    this.initialMap = map;
    this.state = Generator.mapToState(map);
    this.solution = solution;

    this.boardEl.style.gridTemplateColumns = `repeat(${this.state.width}, var(--cell-size))`;
    this.boardEl.innerHTML = ''; // Start clean
    
    this.setupBoard(); // Create background cells
    this.updateStatus(`Go! Target moves: ${this.solution?.length || '?'}`);
    this.render(); // Mount entities
    setTimeout(() => this.checkTutorialTriggers(), 50);

    if (!this.boundEvents) {
      window.addEventListener("keydown", this.handleKeyDown);
      this.boardEl.addEventListener("click", this.handleBoardClick);
      this.boardEl.addEventListener("contextmenu", (e) => e.preventDefault());
      
      window.addEventListener("resize", this.adjustScaleBound);

      this.boundEvents = true;
    }
    
    this.adjustScale();
  }

  collapseHeader() {
    const header = document.getElementById('game-header');
    if (header && !header.classList.contains('collapsed')) {
      header.classList.add('collapsed');
      setTimeout(() => this.adjustScale(), 10);
    }
  }

  adjustScale() {
     if (!this.state || !this.state.width) return;
     
     const header = document.getElementById('game-header');
     const isMobile = window.innerWidth <= 800;
     
     const gapWidth = (this.state.width - 1) * 4;
     const gapHeight = (this.state.height - 1) * 4;
     
     const paddingWidth = isMobile ? (window.innerWidth <= 480 ? 32 : 40) : 80;
     const availableWidth = window.innerWidth - paddingWidth - gapWidth;
     
     const headerHeight = header && isMobile ? header.offsetHeight : 0;
     const paddingHeight = isMobile ? 60 : 80;
     const availableHeight = Math.max(100, window.innerHeight - headerHeight - paddingHeight - gapHeight);
     
     const maxCellWidth = availableWidth / this.state.width;
     const maxCellHeight = availableHeight / this.state.height;
     
     let cellSize = Math.min(100, maxCellWidth, maxCellHeight);
     if (cellSize < 15) cellSize = 15; // floor boundary
     
     document.documentElement.style.setProperty('--cell-size', `${cellSize}px`);
     document.documentElement.style.setProperty('--sprite-size', `${cellSize * 0.75}px`);
  }

  handleKeyDown(event) {
    if (this.state.gameOver || this.isAnimating) return;

    this.collapseHeader();

    // initialize audio on first key
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
      this.audioInitialized = true;
    } else {
      this.audioInitialized = true;
    }

    let dx = 0, dy = 0;
    switch (event.key.toLowerCase()) {
      case 'w':
      case 'arrowup': dy = -1; break;
      case 's':
      case 'arrowdown': dy = 1; break;
      case 'a':
      case 'arrowleft': dx = -1; break;
      case 'd':
      case 'arrowright': dx = 1; break;
      default: return;
    }

    this.actionQueue = []; // Cancel any movement to prefer immediate WASD movement
    this.startTimerIfFirstMove();
    this.applyAction({ type: 'MOVE', dx, dy });
  }

  startTimerIfFirstMove() {
      if (!this.startTime && !this.state.gameOver) {
          this.startTime = Date.now();
          this.timerInterval = setInterval(() => {
              this.updateTimerDisplay();
          }, 100);
      }
  }

  stopTimer() {
      if (this.timerInterval) {
          clearInterval(this.timerInterval);
          this.timerInterval = null;
      }
      if (this.state && this.state.win && this.startTime) {
          const ms = Date.now() - this.startTime;
          const bestMs = localStorage.getItem(this.bestTimeKey);
          if (!bestMs || ms < parseInt(bestMs, 10)) {
              localStorage.setItem(this.bestTimeKey, ms.toString());
              if (this.bestTimerEl) {
                  this.bestTimerEl.textContent = this.formatTime(ms);
              }
              // Could trigger a small animation or effect here if it's a new record
          }
      }
  }

  updateTimerDisplay() {
      if (!this.startTime) return;
      const ms = Date.now() - this.startTime;
      this.totalTimeStr = this.formatTime(ms);
      if (this.timerEl) this.timerEl.textContent = this.totalTimeStr;
  }

  formatTime(ms) {
      const totalDecimals = Math.floor(ms / 100);
      const totalSeconds = Math.floor(totalDecimals / 10);
      const m = Math.floor(totalSeconds / 60);
      const s = totalSeconds % 60;
      const subMs = totalDecimals % 10;
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${subMs}`;
  }

  handleBoardClick(e) {
    this.collapseHeader();
    if (this.audioContext && this.audioContext.state === 'suspended') { this.audioContext.resume(); this.audioInitialized = true; } else { this.audioInitialized = true; }
    if (e.target.closest('.cell') || e.target.closest('.dynamic-entity')) this.startTimerIfFirstMove();

    const cellEl = e.target.closest('.cell') || e.target.closest('.dynamic-entity');
    if (!cellEl) return;

    if (this.state.gameOver || this.isAnimating) return;

    const tx = parseInt(cellEl.dataset.x);
    const ty = parseInt(cellEl.dataset.y);
    if (isNaN(tx) || isNaN(ty)) return;

    const rx = this.state.rabbit.x;
    const ry = this.state.rabbit.y;
    const dx = tx - rx;
    const dy = ty - ry;

    this.actionQueue = []; // Reset queue on new intent

    // 1. Try resolving intent as an EGG throw
    const eggAction = { type: 'THROW', tx, ty, item: 'egg' };
    const nextStateEgg = Engine.getNextState(this.state, eggAction);
    if (nextStateEgg.moveCount > this.state.moveCount) {
        this.applyAction(eggAction);
        return;
    }

    // 2. Try resolving intent as a LETTUCE throw
    const lettuceAction = { type: 'THROW', tx, ty, item: 'lettuce' };
    const nextStateLettuce = Engine.getNextState(this.state, lettuceAction);
    const validLettuce = nextStateLettuce.moveCount > this.state.moveCount;

    // 3. Try resolving intent as a PATH MOVEMENT
    const path = this.findPath(this.state, tx, ty);
    const validPath = path && path.length > 0;

    if (validLettuce && validPath) {
        this.showChoiceModal(
            () => { this.applyAction(lettuceAction); },
            () => {
                this.actionQueue = path.map(step => ({ type: 'MOVE', dx: step.dx, dy: step.dy }));
                this.processNextAction();
            }
        );
        return;
    }

    if (validLettuce) {
        this.applyAction(lettuceAction);
        return;
    }

    if (validPath) {
        this.actionQueue = path.map(step => ({ type: 'MOVE', dx: step.dx, dy: step.dy }));
        this.processNextAction();
        return;
    }
  }

  processNextAction() {
      if (this.actionQueue && this.actionQueue.length > 0 && !this.state.gameOver && !this.state.win) {
          const nextAction = this.actionQueue.shift();
          this.applyAction(nextAction);
      }
  }

  findPath(state, tx, ty) {
      if (state.rabbit.x !== tx && state.rabbit.y !== ty) return null; // Must be a straight line
      if (state.rabbit.x === tx && state.rabbit.y === ty) return null;
      
      const impassable = ['T', 'L', 'F', 'B', 'P', 'M', 'U'];
      const path = [];
      const dx = Math.sign(tx - state.rabbit.x);
      const dy = Math.sign(ty - state.rabbit.y);
      
      let cx = state.rabbit.x;
      let cy = state.rabbit.y;
      
      while (cx !== tx || cy !== ty) {
          cx += dx;
          cy += dy;
          const cell = state.grid[cy][cx];
          
          if (cell !== ' ' && impassable.includes(cell[0])) {
              return null; // Path is blocked by an obstacle
          }
          
          path.push({ dx, dy });
          
          if (cell[0] === 'W' && (cx !== tx || cy !== ty)) {
              return null; // Cannot perform a straight line path through a teleporter
          }
      }
      return path;
  }

  checkTutorialTriggers() {
    if (this.difficulty !== 'tutorial') return;
    
    const triggers = getTutorialTriggers(this.isTouchDevice);
    for (let i = 0; i < triggers.length; i++) {
        const trigger = triggers[i];
        if (!this.triggeredAlerts.has(i)) {
            let fire = false;
            if (typeof trigger.moveCount !== 'undefined' && this.state.moveCount === trigger.moveCount) {
                fire = true;
            } else if (typeof trigger.check === 'function' && trigger.check(this.state)) {
                fire = true;
            }
            
            if (fire) {
                this.triggeredAlerts.add(i);
                this.showTutorialModal(trigger.msg);
                break;
            }
        }
    }
  }

  showTutorialModal(msg) {
    const modal = document.getElementById('tutorial-modal');
    const textEl = document.getElementById('tutorial-text');
    const okBtn = document.getElementById('tutorial-ok');
    
    if (modal && textEl && okBtn) {
        textEl.textContent = msg;
        modal.style.display = 'flex';
        
        okBtn.onclick = () => {
            modal.style.display = 'none';
        };
    } else {
        window.alert(msg);
    }
  }

  showChoiceModal(onLettuce, onMove) {
    const modal = document.getElementById('choice-modal');
    const throwBtn = document.getElementById('choice-throw');
    const moveBtn = document.getElementById('choice-move');
    const cancelBtn = document.getElementById('choice-cancel');
    
    if (modal && throwBtn && moveBtn && cancelBtn) {
        modal.style.display = 'flex';
        
        throwBtn.onclick = () => {
            modal.style.display = 'none';
            onLettuce();
        };
        
        moveBtn.onclick = () => {
            modal.style.display = 'none';
            onMove();
        };

        cancelBtn.onclick = () => {
             modal.style.display = 'none';
        };
    }
  }

  showVictoryBanner() {
    const modal = document.getElementById('victory-modal');
    const textEl = document.getElementById('victory-text');
    const nextBtn = document.getElementById('victory-next');
    
    if (modal && textEl && nextBtn) {
        textEl.innerHTML = `Completed in <strong>${this.state.moveCount} moves</strong>!<br/>Time: <strong>${this.totalTimeStr}</strong>`;
        modal.style.display = 'flex';
        
        nextBtn.onclick = () => {
            modal.style.display = 'none';
        };
    }
  }

  applyAction(action) {
    const nextState = Engine.getNextState(this.state, action);
    if (nextState.moveCount > this.state.moveCount || nextState.gameOver !== this.state.gameOver) {
      if (nextState.events && nextState.events.length > 0) {
         this.isAnimating = true;
         this.playActionQueue(nextState.events, () => {
             this.state = nextState;
             this.isAnimating = false;
             if (this.state.gameOver) this.stopTimer();
             this.updateStatus(this.state.win ? "Victory!" : this.state.gameOver ? "Game Over!" : "Keep going...");
             this.render(); // sync up cleanly
             if (this.state.win) {
                 this.showVictoryBanner();
             }
             setTimeout(() => this.checkTutorialTriggers(), 50);
             this.processNextAction();
         });
      } else {
         // Fallback just in case
         this.state = nextState;
         this.render();
         if (this.state.gameOver) this.stopTimer();
         this.updateStatus(this.state.win ? "Victory!" : this.state.gameOver ? "Game Over!" : "Keep going...");
         if (this.state.win) {
             this.showVictoryBanner();
         }
         setTimeout(() => this.checkTutorialTriggers(), 50);
         this.processNextAction();
      }
    }
  }

  playActionQueue(events, onComplete) {
     let i = 0;
     const processNext = () => {
        if(i >= events.length) {
            return onComplete();
        }
        const ev = events[i++];
        this.applyAnimation(ev, processNext);
     };
     processNext();
  }

  applyAnimation(ev, done) {
     if (ev.type === 'move' || ev.type === 'teleport') {
        this.playSound('hop');
        this.moveEntityDOM('rabbit', ev.end.x, ev.end.y);
        setTimeout(done, ev.type === 'move' ? 300 : 50);
     } else if (ev.type === 'pickup') {
        this.playSound('pickup');
        setTimeout(done, 100);
     } else if (ev.type === 'throw') {
        this.playSound('throw');
        this.createTempProjectile(ev.item, ev.start.x, ev.start.y, ev.end.x, ev.end.y, done);
     } else if (ev.type === 'slide') {
        let sound = 'walk';
        if (ev.entity === 'F') sound = 'skitter';
        this.playSound(sound);
        
        let pathIndex = 0;
        const id = this.findEntityAt(ev.path[0].x, ev.path[0].y, ev.entity);
        if(!id) return done();

        const animatePath = () => {
            pathIndex++;
            if(pathIndex >= ev.path.length) return setTimeout(done, 100);
            const pos = ev.path[pathIndex];
            this.moveEntityDOM(id, pos.x, pos.y);
            setTimeout(animatePath, 150);
        };
        animatePath();
     } else if (ev.type === 'chew') {
        this.playSound('chew');
        const id = this.findEntityAt(ev.x, ev.y, 'B'); // try to find beaver
        if (id) {
           const el = this.entityMap.get(id);
           if(el) {
              el.classList.add('animate-chew');
              setTimeout(() => el.classList.remove('animate-chew'), 300);
           }
        }
        setTimeout(done, 300);
     } else if (ev.type === 'splat') {
        this.playSound('splat');
        const targetId = this.findEntityAt(ev.x, ev.y);
        if (targetId) {
             const el = this.entityMap.get(targetId);
             if(el) {
                el.classList.add('animate-splat');
                setTimeout(() => el.classList.remove('animate-splat'), 300);
             }
        }
        setTimeout(done, 300);
     } else if (ev.type === 'turn') {
        this.playSound('walk');
        const targetId = this.findEntityAt(ev.x, ev.y, 'P');
        if (targetId) {
           const el = this.entityMap.get(targetId);
           if(el) {
               el.classList.add('animate-turn');
               const sprite = el.querySelector('.entity-sprite');
               if (sprite) {
                   const type = el.dataset.entity;
                   const emojiMap = { 'R': '🐇', 'F': '🦊', 'B': '🦫', 'M': '🐻', 'P': '🦔', 'U': '🐢', 'E': '🚪', 'T': '🌲', 'L': '🪵', 'W': '🕳️', 'X': '☠️', 'N': '🪺', 'EGG': '🥚', 'C': '🥬' };
                   sprite.innerHTML = emojiMap[type] || type;
                   
                   const dirSpan = el.querySelector('.direction-indicator');
                   if (dirSpan && ev.dir) {
                       dirSpan.textContent = { '^': '↑', 'v': '↓', '<': '←', '>': '→' }[ev.dir] || ev.dir;
                   }
               }
               setTimeout(() => el.classList.remove('animate-turn'), 300);
           }
        }
        setTimeout(done, 300);
     } else if (ev.type === 'eat') {
        this.playSound('chew');
        setTimeout(done, 300);
     } else {
        done();
     }
  }

  createTempProjectile(item, x0, y0, x1, y1, done) {
      const div = document.createElement('div');
      div.className = 'dynamic-entity';
      div.style.setProperty('--x', x0);
      div.style.setProperty('--y', y0);
      div.style.zIndex = '100';
      const sprite = document.createElement('span');
      sprite.className = 'entity-sprite';
      sprite.innerHTML = item === 'egg' ? '🥚' : '🥬';
      div.appendChild(sprite);
      this.boardEl.appendChild(div);
      
      void div.offsetWidth; // trigger reflow
      div.style.setProperty('--x', x1);
      div.style.setProperty('--y', y1);
      
      setTimeout(() => {
          div.remove();
          done();
      }, 300);
  }

  moveEntityDOM(id, x, y) {
      const el = this.entityMap.get(id);
      if(el) {
         el.dataset.x = x;
         el.dataset.y = y;
         el.style.setProperty('--x', x);
         el.style.setProperty('--y', y);
      }
  }
  
  findEntityAt(x, y, type=null) {
     for(const [id, el] of this.entityMap.entries()) {
         if (el.dataset.x == x && el.dataset.y == y) {
               if(!type || el.dataset.entity === type) return id;
         }
     }
     return null;
  }

  reset() {
    if (!this.initialMap || this.isAnimating) return;
    this.state = Generator.mapToState(this.initialMap);
    this.triggeredAlerts.clear();
    this.stopTimer();
    this.startTime = null;
    this.totalTimeStr = "00:00.0";
    if (this.timerEl) this.timerEl.textContent = "00:00.0";
    this.render();
    this.updateStatus(`Level Reset! Target moves: ${this.solution?.length || '?'}`);
    setTimeout(() => this.checkTutorialTriggers(), 50);
  }

  updateStatus(msg) {
    this.statusEl.textContent = msg;
    this.inventoryEl.textContent = `Eggs: ${this.state.eggs} | Lettuce: ${this.state.lettuce} | Moves: ${this.state.moveCount}`;
  }

  setupBoard() {
    this.boardEl.innerHTML = '';
    const { width, height } = this.state;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cellDiv = document.createElement('div');
        cellDiv.classList.add('cell');
        cellDiv.dataset.x = x;
        cellDiv.dataset.y = y;
        this.boardEl.appendChild(cellDiv);
      }
    }
  }

  render() {
    // Remove existing dynamic entities
    for (const el of this.entityMap.values()) el.remove();
    this.entityMap.clear();

    const { width, height, grid, rabbit, gameOver } = this.state;
    let autoId = 0;

    const visualMap = { 'R': '🐇', 'F': '🦊', 'B': '🦫', 'M': '🐻', 'P': '🦔', 'U': '🐢', 'E': '🚪', 'T': '🌲', 'L': '🪵', 'W': '🕳️', 'X': '☠️', 'N': '🪺', 'EGG': '🥚', 'C': '🥬' };

    const createEntity = (x, y, char, id) => {
        const type = char[0];
        const div = document.createElement('div');
        div.className = 'dynamic-entity';
        div.dataset.x = x;
        div.dataset.y = y;
        div.dataset.entity = type;
        div.style.setProperty('--x', x);
        div.style.setProperty('--y', y);
        div.id = `entity-${id}`;

        if (type === 'W') {
            const colors = ['#a855f7', '#38bdf8', '#fb923c', '#4ade80', '#f43f5e', '#facc15'];
            const colorId = parseInt(char.slice(1)) || 0;
            div.style.setProperty('--portal-color', colors[colorId % colors.length]);
            div.classList.add('portal-pulse'); // assuming portal-pulse moved to .dynamic-entity ?
        }

        const sprite = document.createElement('span');
        sprite.className = 'entity-sprite';
        
        let facingStr = 'scaleX(1)';
        if (type !== 'U' && char.length > 1 && ['^', 'v', '<', '>'].includes(char[1])) {
            const dirSpan = document.createElement('span');
            dirSpan.className = 'direction-indicator';
            dirSpan.textContent = { '^': '↑', 'v': '↓', '<': '←', '>': '→' }[char[1]];
            div.appendChild(dirSpan);
        }
        
        sprite.innerHTML = visualMap[type] || type;
        div.appendChild(sprite);

        this.boardEl.appendChild(div);
        this.entityMap.set(id, div);
    };

    // Instantiate grid entities
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const char = grid[y][x];
        if (char !== ' ') {
            createEntity(x, y, char, `grid-${autoId++}`);
        }
      }
    }

    // Instantiate Rabbit
    createEntity(rabbit.x, rabbit.y, gameOver && !this.state.win ? 'X' : 'R', 'rabbit');
  }
}
