import { Engine } from './src/engine.js';
import { Solver } from './src/solver.js';

const state = {
  width: 5,
  height: 5,
  grid: [
    ['T', 'T', 'T', 'T', 'T'],
    ['T', ' ', ' ', 'E', 'T'],
    ['T', ' ', ' ', ' ', 'T'],
    ['T', ' ', ' ', ' ', 'T'],
    ['T', 'T', 'T', 'T', 'T']
  ],
  rabbit: { x: 1, y: 1 },
  eggs: 0,
  moveCount: 0,
  gameOver: false,
  win: false
};

console.log("Starting debug solve...");
const solution = Solver.solve(state, 100);
if (solution) {
    console.log("SOLVED! Steps:", solution.length);
    solution.forEach(s => console.log(s.label));
} else {
    console.log("FAILED to solve trivial map.");
}
