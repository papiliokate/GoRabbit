import { Generator } from '../src/generator.js';
import { Solver } from '../src/solver.js';

let attempts = 0;
while (attempts < 10) {
  attempts++;
  console.log('Attempt', attempts);
  const map = Generator.generateProceduralOptionA(15, 17, 15);
  map.forEach(row => console.log(row.join(' ')));
  const state = Generator.mapToState(map);
  const solution = Solver.solve(state, 100000);
  if (solution) {
      console.log("SOLVED!", solution.length);
      break;
  } else {
      console.log("NOT SOLVED");
  }
}
