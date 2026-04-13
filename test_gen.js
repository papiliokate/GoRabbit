import { Generator } from './src/generator.js';
import { Solver } from './src/solver.js';

async function run() {
  const difficulties = ['small', 'medium', 'large', 'extra_large'];
  
  for (const diff of difficulties) {
    console.log(`\n=== GENERATING ${diff.toUpperCase()} PUZZLE ===`);
    const { map } = Generator.generate(diff, true);
    const state = Generator.mapToState(map);
    
    // Use very high iteration count for Hard puzzles in script
    const solution = Solver.solve(state, 500000);
    
    // Print map
    map.forEach(row => console.log(row.join(' ')));
    
    if (solution && solution.length > 0) {
      console.log(`\nSolution (${solution.length} moves):`);
      solution.forEach((step, i) => {
        if (step.type === 'MOVE') {
          console.log(`${i+1}. Move ${step.label}`);
        } else {
          console.log(`${i+1}. Throw Egg at (${step.tx}, ${step.ty})`);
        }
      });
    } else {
      console.log("\nNo solution found (solver returned null or empty)!");
    }
  }
}

run();
