import { Solver } from './solver.js';
import { lockedMaps } from './locked_maps.js';
import { Engine } from './engine.js';

export class Generator {
  static generate(difficulty) {
    if (lockedMaps[difficulty]) {
       return { 
           map: lockedMaps[difficulty].map.map(row => [...row]), 
           solution: lockedMaps[difficulty].solution 
       };
    }
    
    let params = {
      small: { width: 9, height: 11, numSplits: 3, useCompound: false },
      medium: { width: 11, height: 13, numSplits: 5, useCompound: false },
      large: { width: 13, height: 15, numSplits: 7, useCompound: true },
      extra_large: { width: 15, height: 17, numSplits: 9, useCompound: true }
    }[difficulty] || { width: 9, height: 11, numSplits: 3, useCompound: false };

    let attempts = 0;
    while (attempts < 500) {
      attempts++;
      const map = this.generateProceduralOptionA(params.width, params.height, params.numSplits, params.useCompound);
      const state = this.mapToState(map);
      const solution = Solver.solve(state, 600000);

      // Verify the map forces at least some throws if locks are generated
      // Check that it's solvable
      if (solution && solution.length > 5) {
        console.log(`Generated ${difficulty} map in ${attempts} attempts. Moves: ${solution.length}`);
        return { map, solution };
      }
    }

    console.warn(`Could not find perfect ${difficulty} map. Returning best attempt.`);
    return this.generateFallback(params);
  }

  static generateProceduralOptionA(w, h, numSplits, useCompound = false) {
    const grid = Array.from({ length: h }, () => Array(w).fill('T'));
    
    // Add logs 'L' instead of 'T' for visual variety
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (Math.random() > 0.6) grid[y][x] = 'L';
      }
    }
    // Solid borders
    for (let x = 0; x < w; x++) { grid[0][x] = 'T'; grid[h - 1][x] = 'T'; }
    for (let y = 0; y < h; y++) { grid[y][0] = 'T'; grid[y][w - 1] = 'T'; }

    let rooms = [{ rx: 1, ry: 1, rw: w - 2, rh: h - 2 }];
    let splits = [];
    
    let splitsPlaced = 0;
    while (splitsPlaced < numSplits) {
      rooms.sort((a, b) => (b.rw * b.rh) - (a.rw * a.rh));
      let target = rooms[0];
      if (target.rw < 5 && target.rh < 5) break;

      let splitVert = target.rw > target.rh;
      if (target.rw >= 5 && target.rh >= 5) splitVert = Math.random() > 0.5;
      if (splitVert && target.rw < 5) splitVert = false;
      if (!splitVert && target.rh < 5) splitVert = true;
      if ((splitVert && target.rw < 5) || (!splitVert && target.rh < 5)) break;

      if (splitVert) {
        let splitX = Math.floor(target.rw / 2);
        let r1 = { rx: target.rx, ry: target.ry, rw: splitX, rh: target.rh };
        let r2 = { rx: target.rx + splitX + 1, ry: target.ry, rw: target.rw - splitX - 1, rh: target.rh };
        rooms.shift();
        rooms.push(r1, r2);
        splits.push({ type: 'V', bx: target.rx + splitX, yStart: target.ry, yEnd: target.ry + target.rh - 1 });
      } else {
        let splitY = Math.floor(target.rh / 2);
        let r1 = { rx: target.rx, ry: target.ry, rw: target.rw, rh: splitY };
        let r2 = { rx: target.rx, ry: target.ry + splitY + 1, rw: target.rw, rh: target.rh - splitY - 1 };
        rooms.shift();
        rooms.push(r1, r2);
        splits.push({ type: 'H', by: target.ry + splitY, xStart: target.rx, xEnd: target.rx + target.rw - 1 });
      }
      splitsPlaced++;
    }

    // Carve open spaces in rooms
    for (const r of rooms) {
      for (let y = r.ry; y <= r.ry + r.rh - 1; y++) {
        for (let x = r.rx; x <= r.rx + r.rw - 1; x++) {
          grid[y][x] = ' ';
        }
      }
    }

    grid[1][1] = 'S';
    grid[h - 2][w - 2] = 'E';
    
    // Add Locks at splits
    const baseTypes = ['FOX_SLIDE', 'BEAVER_CLEAR', 'PORCUPINE_WARREN'];
    const types = useCompound ? [...baseTypes, 'COMPOUND_SLIDE'] : baseTypes;

    for (const split of splits) {
      if (split.type === 'V') {
        const bx = split.bx;
        for (let y = split.yStart; y <= split.yEnd; y++) {
            grid[y][bx] = Math.random() > 0.5 ? 'T' : 'L';
        }
      } else {
        const by = split.by;
        for (let x = split.xStart; x <= split.xEnd; x++) {
            grid[by][x] = Math.random() > 0.5 ? 'T' : 'L';
        }
      }
    }

    for (const split of splits) {
      const lockType = types[Math.floor(Math.random() * types.length)];
      
      if (split.type === 'V') {
        const bx = split.bx;
        const doorY = Math.floor(Math.random() * (split.yEnd - split.yStart - 1)) + split.yStart + 1;

        if (lockType === 'COMPOUND_SLIDE') {
           const isTop = Math.random() > 0.5 && doorY < split.yEnd - 2;
           if (isTop) {
               grid[doorY][bx] = 'Fv';
               grid[doorY][bx-1] = 'T'; // bumpers
               grid[doorY][bx+1] = 'T';
               grid[doorY+1][bx] = ' ';
               const secDir = Math.random() > 0.5 ? 'F>' : 'F<';
               if (doorY + 2 < h - 1) {
                   grid[doorY+2][bx] = secDir;
                   const clearDir = secDir === 'F>' ? 1 : -1;
                   if (bx + clearDir > 0 && bx + clearDir < w - 1) {
                       grid[doorY+2][bx + clearDir] = ' ';
                   }
               }
           } else {
               if (doorY > split.yStart + 2) {
                  grid[doorY][bx] = 'F^';
                  grid[doorY][bx-1] = 'T';
                  grid[doorY][bx+1] = 'T';
                  grid[doorY-1][bx] = ' ';
                  const secDir = Math.random() > 0.5 ? 'F>' : 'F<';
                  if (doorY - 2 > 0) {
                      grid[doorY-2][bx] = secDir;
                      const clearDir = secDir === 'F>' ? 1 : -1;
                      if (bx + clearDir > 0 && bx + clearDir < w - 1) {
                          grid[doorY-2][bx + clearDir] = ' ';
                      }
                  }
               } else {
                  grid[doorY][bx] = 'Fv';
                  grid[doorY][bx-1] = 'T';
                  grid[doorY][bx+1] = 'T';
                  grid[doorY+1][bx] = ' ';
                  const secDir = Math.random() > 0.5 ? 'F>' : 'F<';
                  if (doorY + 2 < h - 1) {
                      grid[doorY+2][bx] = secDir;
                      const clearDir = secDir === 'F>' ? 1 : -1;
                      if (bx + clearDir > 0 && bx + clearDir < w - 1) {
                          grid[doorY+2][bx + clearDir] = ' ';
                      }
                  }
               }
           }
        } else if (lockType === 'FOX_SLIDE') {
           const isTop = Math.random() > 0.5 && doorY < split.yEnd - 1;
           if (isTop) {
               grid[doorY][bx] = 'Fv';
               grid[doorY+1][bx] = ' ';
           } else {
               if (doorY > split.yStart + 1) {
                  grid[doorY][bx] = 'F^';
                  grid[doorY-1][bx] = ' ';
               } else {
                  grid[doorY][bx] = 'Fv';
                  grid[doorY+1][bx] = ' ';
               }
           }
        } else if (lockType === 'BEAVER_CLEAR') {
           const isLeft = Math.random() > 0.5;
           let dist = Math.floor(Math.random() * 4) + 1;
           if (isLeft) {
               let d = 1;
               while (d <= dist) {
                  if (bx - d <= 0) break;
                  if (grid[doorY][bx - d] !== ' ') break;
                  d++;
               }
               d--;
               if (d < 1) d = 1;
               grid[doorY][bx - d] = 'B>';
               grid[doorY][bx] = 'T';
           } else {
               let d = 1;
               while (d <= dist) {
                  if (bx + d >= w - 1) break;
                  if (grid[doorY][bx + d] !== ' ') break;
                  d++;
               }
               d--;
               if (d < 1) d = 1;
               grid[doorY][bx + d] = 'B<';
               grid[doorY][bx] = 'T';
           }
        } else if (lockType === 'PORCUPINE_WARREN') {
           grid[doorY][bx] = 'T'; 
           grid[doorY][bx - 1] = 'W';
           grid[doorY][bx + 1] = 'W';
           const placeAbove = Math.random() > 0.5;
           const side = bx - 1;
           let dist = 1;
           while (dist < 4) {
               const checkY = placeAbove ? doorY - dist : doorY + dist;
               if (checkY < 0 || checkY >= h || grid[checkY][side] !== ' ') break;
               dist++;
           }
           dist--;
           if (dist < 1) dist = 1;
           let pY = placeAbove ? doorY - dist : doorY + dist;
           if (pY < 1) pY = 1;
           if (pY > h - 2) pY = h - 2;
           grid[pY][side] = placeAbove ? 'Pv' : 'P^';

        } else if (lockType === 'FOX_WARREN') {
           grid[doorY][bx] = 'T'; 
           grid[doorY][bx - 1] = 'W';
           grid[doorY][bx + 1] = 'W';
           const placeAbove = Math.random() > 0.5;
           const side = bx - 1;
           let dist = 1;
           while (dist < 4) {
               const checkY = placeAbove ? doorY - dist : doorY + dist;
               if (checkY < 0 || checkY >= h || grid[checkY][side] !== ' ') break;
               dist++;
           }
           dist--;
           if (dist < 1) dist = 1; 
           let fY = placeAbove ? doorY - dist : doorY + dist;
           if (fY < 1) fY = 1;
           if (fY > h - 2) fY = h - 2;
           const slidePastY = placeAbove ? doorY + 1 : doorY - 1;
           if (slidePastY > 0 && slidePastY < h - 1 && ['T', 'L', ' '].includes(grid[slidePastY][side])) {
               grid[slidePastY][side] = ' ';
           }
           grid[fY][side] = placeAbove ? 'Fv' : 'F^';
        }
      } else {
        // Horizontal split
        const by = split.by;
        const doorX = Math.floor(Math.random() * (split.xEnd - split.xStart - 1)) + split.xStart + 1;
        if (lockType === 'COMPOUND_SLIDE') {
           const isLeft = Math.random() > 0.5 && doorX < split.xEnd - 2;
           if (isLeft) {
               grid[by][doorX] = 'F>';
               grid[by-1][doorX] = 'T'; // bumpers
               grid[by+1][doorX] = 'T';
               grid[by][doorX+1] = ' ';
               const secDir = Math.random() > 0.5 ? 'Fv' : 'F^';
               if (doorX + 2 < w - 1) {
                   grid[by][doorX+2] = secDir;
                   const clearDir = secDir === 'Fv' ? 1 : -1;
                   if (by + clearDir > 0 && by + clearDir < h - 1) {
                       grid[by + clearDir][doorX+2] = ' ';
                   }
               }
           } else {
               if (doorX > split.xStart + 2) {
                  grid[by][doorX] = 'F<';
                  grid[by-1][doorX] = 'T';
                  grid[by+1][doorX] = 'T';
                  grid[by][doorX-1] = ' ';
                  const secDir = Math.random() > 0.5 ? 'Fv' : 'F^';
                  if (doorX - 2 > 0) {
                      grid[by][doorX-2] = secDir;
                      const clearDir = secDir === 'Fv' ? 1 : -1;
                      if (by + clearDir > 0 && by + clearDir < h - 1) {
                          grid[by + clearDir][doorX-2] = ' ';
                      }
                  }
               } else {
                  grid[by][doorX] = 'F>';
                  grid[by-1][doorX] = 'T';
                  grid[by+1][doorX] = 'T';
                  grid[by][doorX+1] = ' ';
                  const secDir = Math.random() > 0.5 ? 'Fv' : 'F^';
                  if (doorX + 2 < w - 1) {
                      grid[by][doorX+2] = secDir;
                      const clearDir = secDir === 'Fv' ? 1 : -1;
                      if (by + clearDir > 0 && by + clearDir < h - 1) {
                          grid[by + clearDir][doorX+2] = ' ';
                      }
                  }
               }
           }
        } else if (lockType === 'FOX_SLIDE') {
           const isLeft = Math.random() > 0.5 && doorX < split.xEnd - 1;
           if (isLeft) {
               grid[by][doorX] = 'F>';
               grid[by][doorX+1] = ' ';
           } else {
               if (doorX > split.xStart + 1) {
                  grid[by][doorX] = 'F<';
                  grid[by][doorX-1] = ' ';
               } else {
                  grid[by][doorX] = 'F>';
                  grid[by][doorX+1] = ' ';
               }
           }
        } else if (lockType === 'BEAVER_CLEAR') {
            const isTop = Math.random() > 0.5;
            let dist = Math.floor(Math.random() * 4) + 1; // 1 to 4 tiles away
            if (isTop) {
                let d = 1;
                while (d <= dist) {
                   if (by - d <= 0) break;
                   if (grid[by - d][doorX] !== ' ') break;
                   d++;
                }
                d--;
                if (d < 1) d = 1;
                grid[by - d][doorX] = 'Bv';
                grid[by][doorX] = 'T';
            } else {
                let d = 1;
                while (d <= dist) {
                   if (by + d >= h - 1) break;
                   if (grid[by + d][doorX] !== ' ') break;
                   d++;
                }
                d--;
                if (d < 1) d = 1;
                grid[by + d][doorX] = 'B^';
                grid[by][doorX] = 'T';
            }
         } else if (lockType === 'PORCUPINE_WARREN') {
           grid[by][doorX] = 'T';
           grid[by - 1][doorX] = 'W';
           grid[by + 1][doorX] = 'W';
           const placeLeft = Math.random() > 0.5;
           const side = by - 1;
           let dist = 1;
           while (dist < 4) {
               const checkX = placeLeft ? doorX - dist : doorX + dist;
               if (checkX < 0 || checkX >= w || grid[side][checkX] !== ' ') break;
               dist++;
           }
           dist--;
           if (dist < 1) dist = 1;
           let pX = placeLeft ? doorX - dist : doorX + dist;
           if (pX < 1) pX = 1;
           if (pX > w - 2) pX = w - 2;
           grid[side][pX] = placeLeft ? 'P>' : 'P<';

        } else if (lockType === 'FOX_WARREN') {
           grid[by][doorX] = 'T';
           grid[by - 1][doorX] = 'W';
           grid[by + 1][doorX] = 'W';
           const placeLeft = Math.random() > 0.5;
           const side = by - 1;
           let dist = 1;
           while (dist < 4) {
               const checkX = placeLeft ? doorX - dist : doorX + dist;
               if (checkX < 0 || checkX >= w || grid[side][checkX] !== ' ') break;
               dist++;
           }
           dist--;
           if (dist < 1) dist = 1;
           let fX = placeLeft ? doorX - dist : doorX + dist;
           if (fX < 1) fX = 1;
           if (fX > w - 2) fX = w - 2;
           const slidePastX = placeLeft ? doorX + 1 : doorX - 1;
           if (slidePastX > 0 && slidePastX < w - 1 && ['T', 'L', ' '].includes(grid[side][slidePastX])) {
               grid[side][slidePastX] = ' ';
           }
           grid[side][fX] = placeLeft ? 'F>' : 'F<';
        }

      } 
    } 

    let totalEggs = numSplits + 3;
    let placedEggs = 0;
    
    const shuffledRooms = [...rooms].sort(() => Math.random() - 0.5);
    
    // Evaluate coverage to avoid placing nests in fox lines of sight or bear footprint
    const mockState = { width: w, height: h, grid, rabbit: {x: -1, y: -1} };
    const initialCoverage = Engine.getAnimalCoverage(mockState);
    
    for (const r of shuffledRooms) {
        if (placedEggs >= totalEggs) break;
        
        let attemptsList = 0;
        let roomPlaced = false;
        while (!roomPlaced && attemptsList < 20) {
            attemptsList++;
            let rx = Math.floor(Math.random() * r.rw) + r.rx;
            let ry = Math.floor(Math.random() * r.rh) + r.ry;
            
            if (grid[ry][rx] === ' ' && !initialCoverage[`${rx},${ry}`]) {
                if ((rx === 1 && ry === 1) || (rx === w-2 && ry === h-2)) continue;
                grid[ry][rx] = 'N';
                placedEggs++;
                roomPlaced = true;
                
                if (Math.random() > 0.4) {
                    let bearPlaced = false;
                    for (let dy = -2; dy <= 2 && !bearPlaced; dy++) {
                      for (let dx = -2; dx <= 2 && !bearPlaced; dx++) {
                         if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) continue;
                         if (Math.random() > 0.7) {
                            const nx = rx + dx, ny = ry + dy;
                            if (nx > 0 && ny > 0 && nx < w-1 && ny < h-1 && grid[ny][nx] === ' ') {
                               grid[ny][nx] = 'M';
                               bearPlaced = true;
                            }
                         }
                      }
                    }
                }
            }
        }
    }
    
    let globalAttempts = 0;
    while(placedEggs < totalEggs && globalAttempts < 200) {
       globalAttempts++;
       let rx = Math.floor(Math.random() * (w - 2)) + 1;
       let ry = Math.floor(Math.random() * (h - 2)) + 1;
       if (grid[ry][rx] === ' ' && !initialCoverage[`${rx},${ry}`]) {
           if ((rx === 1 && ry === 1) || (rx === w-2 && ry === h-2)) continue;
           grid[ry][rx] = 'N';
           placedEggs++;
       }
    }

    return grid;
  }

  static mapToState(map) {
    const state = {
      width: map[0].length,
      height: map.length,
      grid: [],
      rabbit: { x: 0, y: 0 },
      eggs: 0,
      moveCount: 0,
      gameOver: false,
      win: false
    };

    for (let y = 0; y < state.height; y++) {
      let row = [];
      for (let x = 0; x < state.width; x++) {
        if (map[y][x] === 'S') {
          state.rabbit = { x, y };
          row.push(' ');
        } else {
          row.push(map[y][x]);
        }
      }
      state.grid.push(row);
    }
    return state;
  }

  static generateFallback(params) {
    const map = Array.from({ length: params.height }, () => Array(params.width).fill(' '));
    for (let y = 0; y < params.height; y++) {
      for (let x = 0; x < params.width; x++) {
        if (y === 0 || y === params.height - 1 || x === 0 || x === params.width - 1) map[y][x] = 'T';
      }
    }
    map[1][1] = 'S';
    map[params.height - 2][params.width - 2] = 'E';
    return { map, solution: [] };
  }
}
