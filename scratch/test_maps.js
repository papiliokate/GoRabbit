import { Generator } from '../src/generator.js';

['small', 'medium', 'large', 'extra_large'].forEach(diff => {
  console.log(`\nTesting ${diff}...`);
  const result = Generator.generate(diff);
  if (result && result.solution && result.solution.length > 0) {
    console.log(`Success! ${diff} solved in ${result.solution.length} moves.`);
  } else {
    console.log(`FAILED! ${diff} not solved or solution empty.`);
  }
});
