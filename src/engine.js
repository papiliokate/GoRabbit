export const IMPASSABLE = ['T', 'L', 'F', 'B', 'P', 'M', 'U'];

export const DIRS = {
  '^': { dx: 0, dy: -1 },
  'v': { dx: 0, dy: 1 },
  '<': { dx: -1, dy: 0 },
  '>': { dx: 1, dy: 0 }
};

export class Engine {
  static cloneState(state) {
    return {
      width: state.width,
      height: state.height,
      grid: state.grid.map(row => [...row]),
      rabbit: { ...state.rabbit },
      eggs: state.eggs,
      lettuce: state.lettuce,
      moveCount: state.moveCount,
      gameOver: state.gameOver,
      win: state.win,
      events: []
    };
  }

  static getNextState(state, action) {
    if (state.gameOver || state.win) return state;

    if (action.type === 'MOVE') {
      const originalX = state.rabbit.x;
      const originalY = state.rabbit.y;
      const newX = originalX + action.dx;
      const newY = originalY + action.dy;

      if (newX < 0 || newX >= state.width || newY < 0 || newY >= state.height) return state;

      const targetCell = state.grid[newY][newX];
      if (targetCell !== ' ' && IMPASSABLE.includes(targetCell[0])) return state;

      const newState = this.cloneState(state);
      return this.handleMove(newState, action.dx, action.dy);
    } else if (action.type === 'THROW') {
      const { tx, ty, item } = action;
      if (tx === state.rabbit.x && ty === state.rabbit.y) return state;

      const targetChar = state.grid[ty][tx][0];
      
      if (item === 'egg') {
        if (state.eggs <= 0) return state;
        if (!['B', 'F', 'P'].includes(targetChar)) return state;
      } else if (item === 'lettuce') {
        if (state.lettuce <= 0) return state;
        if (targetChar !== ' ') return state;
      } else {
        return state;
      }

      const path = this.getLine(state.rabbit.x, state.rabbit.y, tx, ty);
      for (const pt of path) {
        if (pt.x === state.rabbit.x && pt.y === state.rabbit.y) continue;
        const cellType = state.grid[pt.y][pt.x][0];
        if (cellType !== ' ' && cellType !== 'W' && (pt.x !== tx || pt.y !== ty)) {
          return state; // Blocked
        }
      }

      if (item === 'lettuce') {
          let foundTurtle = null;
          for (const [dirKey, dir] of Object.entries(DIRS)) {
            let cx = tx + dir.dx;
            let cy = ty + dir.dy;
            while(cx >= 0 && cx < state.width && cy >= 0 && cy < state.height) {
              const cell = state.grid[cy][cx];
              if (cell[0] === 'U') {
                 foundTurtle = true;
                 break;
              } else if (cell !== ' ') {
                 break; // Blocked
              }
              cx += dir.dx;
              cy += dir.dy;
            }
            if (foundTurtle) break;
          }
          if (!foundTurtle) return state; // Invalid throw, no turtle attracted
      }

      const newState = this.cloneState(state);
      return this.handleThrow(newState, tx, ty, item);
    }

    return state;
  }

  static handleMove(state, dx, dy) {
    const originalX = state.rabbit.x;
    const originalY = state.rabbit.y;
    const newX = originalX + dx;
    const newY = originalY + dy;

    if (newX < 0 || newX >= state.width || newY < 0 || newY >= state.height) return state;

    const targetCell = state.grid[newY][newX];
    if (targetCell !== ' ' && IMPASSABLE.includes(targetCell[0])) return state;

    state.moveCount++;

    if (targetCell[0] === 'N') {
      state.eggs++;
      state.grid[newY][newX] = ' ';
      state.events.push({ type: 'pickup', item: 'egg', x: newX, y: newY });
    } else if (targetCell[0] === 'C') {
      state.lettuce++;
      state.grid[newY][newX] = ' ';
      state.events.push({ type: 'pickup', item: 'lettuce', x: newX, y: newY });
    }
    // Check death at the entrance cell before teleporting!
    const originalRabbit = { ...state.rabbit };
    state.rabbit.x = newX;
    state.rabbit.y = newY;
    state.events.push({ type: 'move', entity: 'R', start: {x: originalX, y: originalY}, end: {x: newX, y: newY} });
    
    this.checkDeathConditions(state);

    if (state.gameOver) return state;

    if (targetCell[0] === 'W') {
      const paired = this.findOtherWarren(state, newX, newY);
      if (paired) {
        state.rabbit.x = paired.x;
        state.rabbit.y = paired.y;
        state.events.push({ type: 'teleport', entity: 'R', start: {x: newX, y: newY}, end: {x: paired.x, y: paired.y} });
        this.checkDeathConditions(state);
      }
    }

    if (targetCell[0] === 'E') {
      state.gameOver = true;
      state.win = true;
    }

    return state;
  }

  static handleThrow(state, tx, ty, item = 'egg') {
    if (tx === state.rabbit.x && ty === state.rabbit.y) return state;

    const targetChar = state.grid[ty][tx][0];
    
    if (item === 'egg') {
      if (state.eggs <= 0) return state;
      // Only allow throwing at valid locks
      if (!['B', 'F', 'P'].includes(targetChar)) {
        return state;
      }
    } else if (item === 'lettuce') {
      if (state.lettuce <= 0) return state;
      if (targetChar !== ' ') {
        return state;
      }
    } else {
      return state;
    }

    const path = this.getLine(state.rabbit.x, state.rabbit.y, tx, ty);
    for (const pt of path) {
      if (pt.x === state.rabbit.x && pt.y === state.rabbit.y) continue;
      const cellType = state.grid[pt.y][pt.x][0];
      // Blocked by anything that isn't empty space or a Hole, and isn't the target itself
      if (cellType !== ' ' && cellType !== 'W' && (pt.x !== tx || pt.y !== ty)) {
        return state; // Blocked
      }
    }

    if (item === 'lettuce') {
      let foundTurtle = null;
      for (const [dirKey, dir] of Object.entries(DIRS)) {
        let cx = tx + dir.dx;
        let cy = ty + dir.dy;
        while(cx >= 0 && cx < state.width && cy >= 0 && cy < state.height) {
          const cell = state.grid[cy][cx];
          if (cell[0] === 'U') {
             foundTurtle = { x: cx, y: cy, char: cell, moveDir: 
                  (dir.dx === -1 ? '>' : dir.dx === 1 ? '<' : dir.dy === -1 ? 'v' : '^') 
             };
             break;
          } else if (cell !== ' ') {
             break; // Blocked
          }
          cx += dir.dx;
          cy += dir.dy;
        }
        if (foundTurtle) break;
      }

      if (!foundTurtle) return state; // Invalid throw, no turtle attracted
      
      state.lettuce--;
      state.moveCount++;
      state.events.push({ type: 'throw', item: 'lettuce', start: { x: state.rabbit.x, y: state.rabbit.y }, end: { x: tx, y: ty } });

      let turtlePath = [];
      let tx2 = foundTurtle.x, ty2 = foundTurtle.y;
      const {dx, dy} = DIRS[foundTurtle.moveDir];
      while(tx2 !== tx || ty2 !== ty) {
          turtlePath.push({x: tx2, y: ty2});
          tx2 += dx; ty2 += dy;
      }
      turtlePath.push({x: tx, y: ty});
      state.events.push({ type: 'slide', entity: 'U', path: turtlePath });
      state.events.push({ type: 'eat', x: tx, y: ty, target: 'lettuce' });

      state.grid[foundTurtle.y][foundTurtle.x] = ' ';
      state.grid[ty][tx] = 'U' + foundTurtle.moveDir;
    } else {
      state.eggs--;
      state.moveCount++;
      state.events.push({ type: 'throw', item: 'egg', start: { x: state.rabbit.x, y: state.rabbit.y }, end: { x: tx, y: ty } });
      this.processEggHit(state, tx, ty);
    }

    if (!state.gameOver) {
      this.checkDeathConditions(state);
    }

    return state;
  }

  static findOtherWarren(state, tx, ty) {
    const currentChar = state.grid[ty][tx];
    for (let y = 0; y < state.height; y++) {
      for (let x = 0; x < state.width; x++) {
        if (state.grid[y][x] === currentChar && (x !== tx || y !== ty)) {
          return { x, y };
        }
      }
    }
    return null;
  }

  static checkDeathConditions(state) {
    const { x: rx, y: ry } = state.rabbit;

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = rx + dx, ny = ry + dy;
        if (nx >= 0 && nx < state.width && ny >= 0 && ny < state.height) {
          if (state.grid[ny][nx][0] === 'M') {
            state.gameOver = true;
            return;
          }
        }
      }
    }

    for (let y = 0; y < state.height; y++) {
      for (let x = 0; x < state.width; x++) {
        const cell = state.grid[y][x];
        if (cell[0] === 'F' || cell[0] === 'P') {
          if (this.canSee(state, x, y, cell[1], rx, ry)) {
            state.gameOver = true;
            return;
          }
        }
      }
    }
  }

  static canSee(state, startX, startY, dir, targetX, targetY) {
    const { dx, dy } = DIRS[dir];
    let cx = startX + dx, cy = startY + dy;
    while (cx >= 0 && cx < state.width && cy >= 0 && cy < state.height) {
      if (cx === targetX && cy === targetY) return true;
      if (state.grid[cy][cx] !== ' ') return false;
      cx += dx; cy += dy;
    }
    return false;
  }

  static getLine(x0, y0, x1, y1) {
    const points = [];
    let dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
    const sx = (x0 < x1) ? 1 : -1, sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;
    while (true) {
      points.push({ x: x0, y: y0 });
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }
    }
    return points;
  }

  static processEggHit(state, x, y) {
    const char = state.grid[y][x];
    state.events.push({ type: 'splat', x, y });
    if (char[0] === 'B') {
      state.grid[y][x] = ' ';
      this.moveEntityLinear(state, x, y, char[1], true, 'B');
    } else if (char[0] === 'F') {
      state.grid[y][x] = ' ';
      this.moveEntityLinear(state, x, y, char[1], false, 'F');
    } else if (char[0] === 'P') {
      const nextDir = { '^': '>', '>': 'v', 'v': '<', '<': '^' }[char[1]];
      state.grid[y][x] = 'P' + nextDir;
      state.events.push({ type: 'turn', entity: 'P', x, y, dir: nextDir });
    }
  }

  static moveEntityLinear(state, startX, startY, dir, destroyTrees, entityChar) {
    const { dx, dy } = DIRS[dir];
    let cx = startX, cy = startY;
    let path = [{x: cx, y: cy}];
    while (true) {
      const nx = cx + dx, ny = cy + dy;
      if (nx < 0 || nx >= state.width || ny < 0 || ny >= state.height) {
        state.events.push({ type: 'slide', entity: entityChar, path });
        return;
      }

      const nextCell = state.grid[ny][nx];
      if (nx === state.rabbit.x && ny === state.rabbit.y) {
        path.push({x: nx, y: ny});
        state.events.push({ type: 'slide', entity: entityChar, path });
        if (entityChar === 'F') state.gameOver = true;
        return;
      }
      if (nextCell !== ' ' && nextCell[0] !== 'E' && nextCell[0] !== 'W') {
        if (destroyTrees && (nextCell[0] === 'T' || nextCell[0] === 'L')) {
          path.push({x: nx, y: ny});
          state.events.push({ type: 'slide', entity: entityChar, path });
          state.events.push({ type: 'chew', x: nx, y: ny, target: nextCell[0] });
          state.grid[ny][nx] = ' ';
          return; // Beaver destroys the tree/log and itself
        } else {
          state.events.push({ type: 'slide', entity: entityChar, path });
          state.grid[cy][cx] = entityChar + dir;
          return;
        }
      }
      cx = nx; cy = ny;
      path.push({x: cx, y: cy});
    }
  }

  static getAnimalCoverage(state) {
  const coverage = {}; // Key: "x,y", Value: Array of animal types

  const add = (x, y, type) => {
    const key = `${x},${y}`;
    if (!coverage[key]) coverage[key] = [];
    if (!coverage[key].includes(type)) coverage[key].push(type);
  };

  for (let y = 0; y < state.height; y++) {
    for (let x = 0; x < state.width; x++) {
      const cell = state.grid[y][x];
      if (!cell || cell === ' ') continue;

      const type = cell[0];
      const dir = cell[1];

      if (type === 'F' || type === 'B') {
        // Trajectory (Dry run of moveEntityLinear)
        const { dx, dy } = DIRS[dir];
        let cx = x, cy = y;
        const destroyTrees = (type === 'B');
        while (true) {
          const nx = cx + dx, ny = cy + dy;
          if (nx < 0 || nx >= state.width || ny < 0 || ny >= state.height) break;

          if (nx === state.rabbit.x && ny === state.rabbit.y) {
            add(nx, ny, type);
            break;
          }

          const nextCell = state.grid[ny][nx];
          if (nextCell !== ' ' && nextCell[0] !== 'E' && nextCell[0] !== 'W') {
            if (destroyTrees && (nextCell[0] === 'T' || nextCell[0] === 'L')) {
              add(nx, ny, type);
              break; // Stops sliding past the eaten tree
            } else {
              break; // Blocked
            }
          }
          add(nx, ny, type);
          cx = nx; cy = ny;
        }
      }

      if (type === 'F' || type === 'P') {
        // Vision
        const { dx, dy } = DIRS[dir];
        if (!dx && !dy) continue;
        let cx = x + dx, cy = y + dy;
        while (cx >= 0 && cx < state.width && cy >= 0 && cy < state.height) {
          add(cx, cy, type);
          if (state.grid[cy][cx] !== ' ' && state.grid[cy][cx][0] !== 'W') break;
          if (cx === state.rabbit.x && cy === state.rabbit.y) break;
          cx += dx; cy += dy;
        }
      }

      if (type === 'M') {
        // Adjacency
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < state.width && ny >= 0 && ny < state.height) {
              add(nx, ny, type);
            }
          }
        }
      }
    }
  }
  return coverage;
}
}
