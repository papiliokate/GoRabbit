import { Solver } from './solver.js';
import { lockedMaps } from './locked_maps.js';

export class Generator {
  static generate(difficulty) {
    if (lockedMaps[difficulty]) {
       return { 
           map: lockedMaps[difficulty].map.map(row => [...row]), 
           solution: lockedMaps[difficulty].solution 
       };
    }
    
    let params = {
      small: { width: 9, height: 11, numLocks: 2 },
      medium: { width: 11, height: 13, numLocks: 3 },
      large: { width: 13, height: 15, numLocks: 3 },
      extra_large: { width: 15, height: 17, numLocks: 4 }
    }[difficulty] || { width: 9, height: 11, numLocks: 2 };

    let attempts = 0;
    while (attempts < 500) {
      attempts++;
      const map = this.generateProceduralOptionA(params.width, params.height, params.numLocks);
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

  static generateProceduralOptionA(w, h, numLocks) {
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
    
    let locksPlaced = 0;
    while (locksPlaced < numLocks) {
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
      locksPlaced++;
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
    const types = ['FOX_SLIDE', 'BEAVER_CLEAR', 'PORCUPINE_SIGHT', 'PORCUPINE_WARREN'];

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

        if (lockType === 'FOX_SLIDE') {
           grid[doorY][bx] = ' ';
           const isTop = Math.random() > 0.5 && doorY > split.yStart + 1;
           const foxY = isTop ? split.yStart : split.yEnd;
           const step = isTop ? 1 : -1;
           const pocketY = doorY + step;
           const startY = Math.min(foxY, pocketY);
           const endY = Math.max(foxY, pocketY);
           for (let y = startY; y <= endY; y++) {
               if (y !== doorY) {
                   if (['T', 'L', ' '].includes(grid[y][bx])) grid[y][bx] = ' ';
                   if (grid[y][bx + 1] !== 'W' && grid[y][bx + 1] !== 'E') grid[y][bx + 1] = 'T';
               }
           }
           if (pocketY >= 0 && pocketY < h && ['T', 'L', ' '].includes(grid[pocketY][bx])) grid[pocketY][bx] = ' ';
           grid[foxY][bx] = isTop ? 'Fv' : 'F^';

        } else if (lockType === 'PORCUPINE_SIGHT') {
           grid[doorY][bx] = ' ';
           const placeAbove = doorY > split.yStart + 2;
           const maxDist = placeAbove ? Math.min(doorY - split.yStart - 1, 4) : Math.min(split.yEnd - doorY - 1, 4);
           const dist = Math.min(maxDist, Math.max(2, Math.floor(Math.random() * maxDist) + 1));
           const pY = placeAbove ? doorY - dist : doorY + dist;
           const startY = Math.min(doorY, pY);
           const endY = Math.max(doorY, pY);
           for (let y = startY; y <= endY; y++) {
               if (y !== doorY) {
                   if (['T', 'L', ' '].includes(grid[y][bx])) grid[y][bx] = ' ';
                   if (grid[y][bx + 1] !== 'W' && grid[y][bx + 1] !== 'E') grid[y][bx + 1] = 'T';
               }
           }
           if (['T', 'L', ' '].includes(grid[pY][bx - 1])) grid[pY][bx - 1] = ' ';
           grid[pY][bx] = placeAbove ? 'Pv' : 'P^';

        } else if (lockType === 'BEAVER_CLEAR') {
           grid[doorY][bx] = 'T';
           const placeAbove = doorY > split.yStart + 2;
           const maxDist = placeAbove ? Math.min(doorY - split.yStart - 1, 4) : Math.min(split.yEnd - doorY - 1, 4);
           const dist = Math.min(maxDist, Math.max(2, Math.floor(Math.random() * maxDist) + 1));
           const bY = placeAbove ? doorY - dist : doorY + dist;
           const startY = Math.min(doorY, bY);
           const endY = Math.max(doorY, bY);
           for (let y = startY; y <= endY; y++) {
               if (y !== doorY) {
                   if (['T', 'L', ' '].includes(grid[y][bx])) grid[y][bx] = ' ';
                   if (grid[y][bx + 1] !== 'W' && grid[y][bx + 1] !== 'E') grid[y][bx + 1] = 'T';
               }
           }
           if (['T', 'L', ' '].includes(grid[bY][bx - 1])) grid[bY][bx - 1] = ' ';
           grid[bY][bx] = placeAbove ? 'Bv' : 'B^';

        } else if (lockType === 'PORCUPINE_WARREN') {
           grid[doorY][bx] = 'T'; 
           grid[doorY][bx - 1] = 'W';
           grid[doorY][bx + 1] = 'W';
           const placeAbove = doorY > split.yStart + 2;
           const side = bx - 1;
           const throwSpace = bx - 2;
           const maxDist = placeAbove ? Math.min(doorY - split.yStart - 1, 4) : Math.min(split.yEnd - doorY - 1, 4);
           const dist = Math.min(maxDist, Math.max(2, Math.floor(Math.random() * maxDist) + 1));
           const pY = placeAbove ? doorY - dist : doorY + dist;
           const startY = Math.min(doorY, pY);
           const endY = Math.max(doorY, pY);
           for (let y = startY; y <= endY; y++) {
               if (y !== doorY && ['T', 'L', ' '].includes(grid[y][side])) {
                   grid[y][side] = ' ';
               }
           }
           if (throwSpace > 0 && throwSpace < w && ['T', 'L', ' '].includes(grid[pY][throwSpace])) grid[pY][throwSpace] = ' ';
           grid[pY][side] = placeAbove ? 'Pv' : 'P^';
        }
      } else {
        // Horizontal split
        const by = split.by;
        const doorX = Math.floor(Math.random() * (split.xEnd - split.xStart - 1)) + split.xStart + 1;

        if (lockType === 'FOX_SLIDE') {
           grid[by][doorX] = ' ';
           const isLeft = Math.random() > 0.5 && doorX > split.xStart + 1;
           const foxX = isLeft ? split.xStart : split.xEnd;
           const step = isLeft ? 1 : -1;
           const pocketX = doorX + step;
           const startX = Math.min(foxX, pocketX);
           const endX = Math.max(foxX, pocketX);
           for (let x = startX; x <= endX; x++) {
               if (x !== doorX) {
                   if (['T', 'L', ' '].includes(grid[by][x])) grid[by][x] = ' ';
                   if (grid[by + 1][x] !== 'W' && grid[by + 1][x] !== 'E') grid[by + 1][x] = 'T';
               }
           }
           if (pocketX >= 0 && pocketX < w && ['T', 'L', ' '].includes(grid[by][pocketX])) grid[by][pocketX] = ' ';
           grid[by][foxX] = isLeft ? 'F>' : 'F<';
           
        } else if (lockType === 'PORCUPINE_SIGHT') {
           grid[by][doorX] = ' ';
           const placeLeft = doorX > split.xStart + 2;
           const maxDist = placeLeft ? Math.min(doorX - split.xStart - 1, 4) : Math.min(split.xEnd - doorX - 1, 4);
           const dist = Math.min(maxDist, Math.max(2, Math.floor(Math.random() * maxDist) + 1));
           const pX = placeLeft ? doorX - dist : doorX + dist;
           const startX = Math.min(doorX, pX);
           const endX = Math.max(doorX, pX);
           for (let x = startX; x <= endX; x++) {
               if (x !== doorX) {
                   if (['T', 'L', ' '].includes(grid[by][x])) grid[by][x] = ' ';
                   if (grid[by + 1][x] !== 'W' && grid[by + 1][x] !== 'E') grid[by + 1][x] = 'T';
               }
           }
           if (['T', 'L', ' '].includes(grid[by - 1][pX])) grid[by - 1][pX] = ' ';
           grid[by][pX] = placeLeft ? 'P>' : 'P<';

        } else if (lockType === 'BEAVER_CLEAR') {
           grid[by][doorX] = 'T';
           const placeLeft = doorX > split.xStart + 2;
           const maxDist = placeLeft ? Math.min(doorX - split.xStart - 1, 4) : Math.min(split.xEnd - doorX - 1, 4);
           const dist = Math.min(maxDist, Math.max(2, Math.floor(Math.random() * maxDist) + 1));
           const bX = placeLeft ? doorX - dist : doorX + dist;
           const startX = Math.min(doorX, bX);
           const endX = Math.max(doorX, bX);
           for (let x = startX; x <= endX; x++) {
               if (x !== doorX) {
                   if (['T', 'L', ' '].includes(grid[by][x])) grid[by][x] = ' ';
                   if (grid[by + 1][x] !== 'W' && grid[by + 1][x] !== 'E') grid[by + 1][x] = 'T';
               }
           }
           if (['T', 'L', ' '].includes(grid[by - 1][bX])) grid[by - 1][bX] = ' ';
           grid[by][bX] = placeLeft ? 'B>' : 'B<';

        } else if (lockType === 'PORCUPINE_WARREN') {
           grid[by][doorX] = 'T';
           grid[by - 1][doorX] = 'W';
           grid[by + 1][doorX] = 'W';
           const placeLeft = doorX > split.xStart + 2;
           const side = by - 1;
           const throwSpace = by - 2;
           const maxDist = placeLeft ? Math.min(doorX - split.xStart - 1, 4) : Math.min(split.xEnd - doorX - 1, 4);
           const dist = Math.min(maxDist, Math.max(2, Math.floor(Math.random() * maxDist) + 1));
           const pX = placeLeft ? doorX - dist : doorX + dist;
           const startX = Math.min(doorX, pX);
           const endX = Math.max(doorX, pX);
           for (let x = startX; x <= endX; x++) {
               if (x !== doorX && ['T', 'L', ' '].includes(grid[side][x])) {
                   grid[side][x] = ' ';
               }
           }
           if (throwSpace > 0 && throwSpace < h && ['T', 'L', ' '].includes(grid[throwSpace][pX])) grid[throwSpace][pX] = ' ';
           grid[side][pX] = placeLeft ? 'P>' : 'P<';
        }
      } 
    } 

    let totalEggs = numLocks + 2;
    let placedEggs = 0;
    let attemptsList = 0;
    while(placedEggs < totalEggs && attemptsList < 200) {
       attemptsList++;
       let rx = Math.floor(Math.random() * (w - 2)) + 1;
       let ry = Math.floor(Math.random() * (h - 2)) + 1;
       if (grid[ry][rx] === ' ') {
           if ((rx === 1 && ry === 1) || (rx === w-2 && ry === h-2)) continue;
           grid[ry][rx] = 'N';
           placedEggs++;
           if (Math.random() > 0.5) {
               let bearPlaced = false;
               for (let dy = -1; dy <= 1 && !bearPlaced; dy++) {
                 for (let dx = -1; dx <= 1 && !bearPlaced; dx++) {
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
