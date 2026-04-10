import { Generator } from './src/generator.js';
import { Solver } from './src/solver.js';

async function run() {
  const difficulties = ['small', 'medium', 'large', 'extra_large'];
  
  // We want to force procedural generation, bypassing locked maps
  // One way is to temporarily patch Generator.generate or just call the internal method
  // Let's just wrap the internal method logic or temporarily modify the class if we can.
  // Actually, I can just copy the logic from Generator.generate but skip the lookup.
  
  for (const diff of difficulties) {
    console.log(`\n=== GENERATING ${diff.toUpperCase()} PUZZLE (FORCED PROCEDURAL) ===`);
    
    let params = {
      small: { width: 9, height: 11, numLocks: 2 },
      medium: { width: 11, height: 13, numLocks: 3 },
      large: { width: 13, height: 15, numLocks: 3 },
      extra_large: { width: 15, height: 17, numLocks: 4 }
    }[diff];

    let attempts = 0;
    let map, solution;
    
    while (attempts < 500) {
      attempts++;
      map = Generator.generateProceduralOptionA(params.width, params.height, params.numLocks);
      const state = Generator.mapToState(map);
      solution = Solver.solve(state, 500000);

      if (solution && solution.length > 5) {
        break;
      }
    }

    if (!solution || solution.length <= 5) {
       console.warn(`Could not find perfect ${diff} map. Showing best attempt.`);
    }

    // Print map
    map.forEach(row => console.log(row.join(' ')));
    
    if (solution && solution.length > 0) {
      console.log(`\nSolution (${solution.length} moves):`);
      // Just print first few moves and summary to keep it clean
      solution.forEach((step, i) => {
        if (step.type === 'MOVE') {
          console.log(`${i+1}. Move ${step.label}`);
        } else {
          console.log(`${i+1}. Throw Egg at (${step.tx}, ${step.ty})`);
        }
      });
    } else {
      console.log("\nNo solution found!");
    }
  }
}

run();
