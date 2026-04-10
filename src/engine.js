export const IMPASSABLE = ['T', 'L', 'F', 'B', 'P', 'M'];

export const DIRS = {
  '^': { dx: 0, dy: -1 },
  'v': { dx: 0, dy: 1 },
  '<': { dx: -1, dy: 0 },
  '>': { dx: 1, dy: 0 }
};

export class Engine {
  static getNextState(state, action) {
    if (state.gameOver) return state;

    const newState = JSON.parse(JSON.stringify(state)); // Deep clone for immutability

    if (action.type === 'MOVE') {
      return this.handleMove(newState, action.dx, action.dy);
    } else if (action.type === 'THROW') {
      return this.handleThrow(newState, action.tx, action.ty);
    }

    return newState;
  }

  static handleMove(state, dx, dy) {
    const newX = state.rabbit.x + dx;
    const newY = state.rabbit.y + dy;

    if (newX < 0 || newX >= state.width || newY < 0 || newY >= state.height) return state;

    const targetCell = state.grid[newY][newX];
    if (targetCell !== ' ' && IMPASSABLE.includes(targetCell[0])) return state;

    state.moveCount++;

    if (targetCell[0] === 'N') {
      state.eggs++;
      state.grid[newY][newX] = ' ';
    }

    if (targetCell[0] === 'W') {
      const paired = this.findOtherWarren(state, newX, newY);
      if (paired) {
        state.rabbit.x = paired.x;
        state.rabbit.y = paired.y;
      } else {
        state.rabbit.x = newX;
        state.rabbit.y = newY;
      }
    } else {
      state.rabbit.x = newX;
      state.rabbit.y = newY;
    }

    if (targetCell[0] === 'E') {
      state.gameOver = true;
      state.win = true;
    } else {
      this.checkDeathConditions(state);
    }

    return state;
  }

  static handleThrow(state, tx, ty) {
    if (state.eggs <= 0) return state;
    if (tx === state.rabbit.x && ty === state.rabbit.y) return state;

    const path = this.getLine(state.rabbit.x, state.rabbit.y, tx, ty);
    for (const pt of path) {
      if (pt.x === state.rabbit.x && pt.y === state.rabbit.y) continue;
      if (state.grid[pt.y][pt.x][0] === 'T' && (pt.x !== tx || pt.y !== ty)) {
        return state; // Blocked
      }
    }

    state.eggs--;
    state.moveCount++;
    this.processEggHit(state, tx, ty);

    if (!state.gameOver) {
      this.checkDeathConditions(state);
    }

    return state;
  }

  static findOtherWarren(state, tx, ty) {
    for (let y = 0; y < state.height; y++) {
      for (let x = 0; x < state.width; x++) {
        if (state.grid[y][x][0] === 'W' && (x !== tx || y !== ty)) {
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
    if (char[0] === 'B') {
      state.grid[y][x] = ' ';
      this.moveEntityLinear(state, x, y, char[1], true, 'B');
    } else if (char[0] === 'F') {
      state.grid[y][x] = ' ';
      this.moveEntityLinear(state, x, y, char[1], false, 'F');
    } else if (char[0] === 'P') {
      const nextDir = { '^': '>', '>': 'v', 'v': '<', '<': '^' }[char[1]];
      state.grid[y][x] = 'P' + nextDir;
    }
  }

  static moveEntityLinear(state, startX, startY, dir, destroyTrees, entityChar) {
    const { dx, dy } = DIRS[dir];
    let cx = startX, cy = startY;
    while (true) {
      const nx = cx + dx, ny = cy + dy;
      if (nx < 0 || nx >= state.width || ny < 0 || ny >= state.height) return;

      const nextCell = state.grid[ny][nx];
      if (nx === state.rabbit.x && ny === state.rabbit.y) {
        if (entityChar === 'F') state.gameOver = true;
        return;
      }
      if (nextCell !== ' ' && nextCell[0] !== 'E' && nextCell[0] !== 'W') {
        if (destroyTrees && nextCell[0] === 'T') {
          state.grid[ny][nx] = ' ';
          return; // Beaver destroys the tree and itself
        } else {
          state.grid[cy][cx] = entityChar + dir;
          return;
        }
      }
      cx = nx; cy = ny;
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
            if (destroyTrees && nextCell[0] === 'T') {
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
