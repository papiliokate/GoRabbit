import { Engine } from './engine.js';

export class Solver {
  static solve(initialState, maxIterations = 15000) {
    const queue = [{ state: initialState, path: [] }];
    const visited = new Set();
    
    // Initial state key
    visited.add(this.getStateKey(initialState));

    let count = 0;
    const MAX_ITERATIONS = maxIterations; 

    while (queue.length > 0 && count < MAX_ITERATIONS) {
      count++;
      const { state, path } = queue.shift();

      if (state.win) return path;

      // Try WASD moves
      const directions = [
        { dx: 0, dy: -1, label: 'W' },
        { dx: 0, dy: 1, label: 'S' },
        { dx: -1, dy: 0, label: 'A' },
        { dx: 1, dy: 0, label: 'D' }
      ];

      for (const dir of directions) {
        const nextState = Engine.getNextState(state, { type: 'MOVE', dx: dir.dx, dy: dir.dy });
        if ((nextState.win || !nextState.gameOver) && nextState.moveCount > state.moveCount) {
          const key = this.getStateKey(nextState);
          if (!visited.has(key)) {
            visited.add(key);
            queue.push({ state: nextState, path: [...path, { type: 'MOVE', ...dir }] });
          }
        }
      }

      // Try Throws if we have eggs
      if (state.eggs > 0) {
        // Optimization: only throw at interactable objects
        for (let y = 0; y < state.height; y++) {
          for (let x = 0; x < state.width; x++) {
            const char = state.grid[y][x];
            if (['B', 'F', 'P'].includes(char[0])) {
              const nextState = Engine.getNextState(state, { type: 'THROW', tx: x, ty: y, item: 'egg' });
              if ((nextState.win || !nextState.gameOver) && nextState.moveCount > state.moveCount) {
                const key = this.getStateKey(nextState);
                if (!visited.has(key)) {
                  visited.add(key);
                  queue.push({ state: nextState, path: [...path, { type: 'THROW', tx: x, ty: y, item: 'egg' }] });
                }
              }
            }
          }
        }
      }

      // Try Throws if we have lettuce
      if (state.lettuce > 0) {
        for (let y = 0; y < state.height; y++) {
          for (let x = 0; x < state.width; x++) {
            if (state.grid[y][x] === ' ') {
              const nextState = Engine.getNextState(state, { type: 'THROW', tx: x, ty: y, item: 'lettuce' });
              if ((nextState.win || !nextState.gameOver) && nextState.moveCount > state.moveCount) {
                const key = this.getStateKey(nextState);
                if (!visited.has(key)) {
                  visited.add(key);
                  queue.push({ state: nextState, path: [...path, { type: 'THROW', tx: x, ty: y, item: 'lettuce' }] });
                }
              }
            }
          }
        }
      }
    }

    return null; // No solution found
  }

  static getStateKey(state) {
    // A more compact key: rabbit_pos | eggs | lettuce | grid_hash
    const gridHash = state.grid.map(row => row.join('')).join('|');
    return `${state.rabbit.x},${state.rabbit.y}|${state.eggs}|${state.lettuce}|${gridHash}`;
  }
}
