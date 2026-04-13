import { Generator } from './src/generator.js';
import { Solver } from './src/solver.js';
import fs from 'fs';

async function refreshMaps() {
    const difficulties = ['small', 'medium', 'large', 'extra_large'];
    const newMaps = {};

    for (const diff of difficulties) {
        console.log(`Generating fresh ${diff} map...`);
        let generated = null;
        let attempts = 0;
        
        while (!generated && attempts < 100) {
            attempts++;
            const { map } = Generator.generate(diff, true);
            const state = Generator.mapToState(map);
            const solution = Solver.solve(state, diff === 'hard' || diff === 'extra_large' ? 100000 : 20000);
            
            const minMoves = diff === 'extra_large' ? 20 : diff === 'large' ? 20 : 15;
            
            if (solution && solution.length >= minMoves) {
                generated = { map, solution };
                console.log(`  Success for ${diff} in ${attempts} attempts (Moves: ${solution.length})`);
            }
        }
        
        if (generated) {
            newMaps[diff] = generated;
        } else {
            console.error(`  Failed to generate a valid ${diff} map after 100 attempts.`);
        }
    }

    const fileContent = `export const lockedMaps = ${JSON.stringify(newMaps, null, 2)};`;
    fs.writeFileSync('./src/locked_maps.js', fileContent);
    console.log('\nSuccessfully updated src/locked_maps.js with new maps!');
}

refreshMaps();
