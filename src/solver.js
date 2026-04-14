import { Engine } from './engine.js';

export class Solver {
  static solve(initialState, maxIterations = 15000) {
    class PriorityQueue {
      constructor() { this.heap = []; }
      push(node) {
        this.heap.push(node);
        let i = this.heap.length - 1;
        while (i > 0) {
          let p = Math.floor((i - 1) / 2);
          if (this.heap[p].f <= this.heap[i].f) break;
          [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
          i = p;
        }
      }
      pop() {
        if (this.heap.length <= 1) return this.heap.pop();
        const top = this.heap[0];
        this.heap[0] = this.heap.pop();
        let i = 0;
        while (true) {
          let left = 2 * i + 1, right = 2 * i + 2, min = i;
          if (left < this.heap.length && this.heap[left].f < this.heap[min].f) min = left;
          if (right < this.heap.length && this.heap[right].f < this.heap[min].f) min = right;
          if (min === i) break;
          [this.heap[i], this.heap[min]] = [this.heap[min], this.heap[i]];
          i = min;
        }
        return top;
      }
      get length() { return this.heap.length; }
    }

    const pq = new PriorityQueue();
    // Default target exit is universally at w-2, h-2
    const getH = (state) => Math.abs(state.rabbit.x - (state.width - 2)) + Math.abs(state.rabbit.y - (state.height - 2));

    pq.push({ state: initialState, path: [], f: getH(initialState) * 2 });
    const visited = new Set();
    
    // Initial state key
    visited.add(this.getStateKey(initialState));

    let count = 0;
    const MAX_ITERATIONS = maxIterations; 

    while (pq.length > 0 && count < MAX_ITERATIONS) {
      count++;
      const { state, path } = pq.pop();

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
            pq.push({ state: nextState, path: [...path, { type: 'MOVE', ...dir }], f: nextState.moveCount + getH(nextState) * 2 });
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
                  pq.push({ state: nextState, path: [...path, { type: 'THROW', tx: x, ty: y, item: 'egg' }], f: nextState.moveCount + getH(nextState) * 2 });
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
                  pq.push({ state: nextState, path: [...path, { type: 'THROW', tx: x, ty: y, item: 'lettuce' }], f: nextState.moveCount + getH(nextState) * 2 });
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
    const gridHash = state.grid.map(row => row.join(',')).join('|');
    return `${state.rabbit.x},${state.rabbit.y}|${state.eggs}|${state.lettuce}|${gridHash}`;
  }
}
