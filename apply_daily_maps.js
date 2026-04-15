import { Generator } from './src/generator.js';
import { Solver } from './src/solver.js';
import fs from 'fs';

async function run() {
  const difficulties = ['small', 'medium', 'large', 'extra_large'];
  const results = {};
  
  for (const diff of difficulties) {
    console.log(`Generating ${diff}...`);
    let params = {
      small: { width: 9, height: 11, numSplits: 3, useCompound: false },
      medium: { width: 11, height: 13, numSplits: 5, useCompound: false },
      large: { width: 13, height: 15, numSplits: 7, useCompound: true },
      extra_large: { width: 15, height: 17, numSplits: 9, useCompound: true }
    }[diff];

    let attempts = 0;
    let map, solution;
    
    while (attempts < 500) {
      attempts++;
      map = Generator.generateProceduralOptionA(params.width, params.height, params.numSplits, params.useCompound);
      const state = Generator.mapToState(map);
      solution = Solver.solve(state, 500000);

      if (solution && solution.length > 5) {
        break;
      }
    }
    
    results[diff] = { map, solution };
  }

  if (!fs.existsSync('./public')) fs.mkdirSync('./public');
  fs.writeFileSync('./public/daily_maps.json', JSON.stringify(results));
  console.log('public/daily_maps.json has been updated with fresh procedural maps.');
}

run();
