export function generateOptionA(w, h, numLocks) {
  const grid = Array.from({ length: h }, () => Array(w).fill('T'));

  // Define regions
  const numRegions = numLocks + 1;
  const regionWidth = Math.floor((w - 1) / numRegions);
  const boundaries = [];
  
  for (let i = 1; i < numRegions; i++) {
    boundaries.push(i * regionWidth);
  }

  // Carve open spaces in each region
  for (let r = 0; r < numRegions; r++) {
    const startX = r === 0 ? 1 : boundaries[r - 1] + 1;
    const endX = r === numRegions - 1 ? w - 2 : boundaries[r] - 1;

    for (let y = 1; y < h - 1; y++) {
      for (let x = startX; x <= endX; x++) {
         grid[y][x] = ' '; 
      }
    }
  }

  // S at region 0
  grid[1][1] = 'S';
  
  // E at last region
  grid[h - 2][w - 2] = 'E';

  const types = ['FOX', 'BEAVER', 'PORCUPINE'];

  // Add Locks at boundaries
  for (let i = 0; i < boundaries.length; i++) {
    const bx = boundaries[i];
    
    // Choose connection door
    const doorY = Math.floor(Math.random() * (h - 4)) + 2; 
    
    // Pick lock type for this boundary
    const lockType = types[Math.floor(Math.random() * types.length)];
    
    if (lockType === 'FOX' || lockType === 'BEAVER') {
       grid[doorY][bx] = ' '; // Carve the door

       // Fox to stare at door
       // Place Fox either at top or bottom watching down/up
       if (Math.random() > 0.5 && doorY > 1) {
          grid[1][bx] = 'Fv'; // top looking down
          // We must ensure there is open space for Fox to slide if hit!
          // So if thrown at, Fox slides down to (bx, 2) etc.
          // In the prior region, place an egg
       } else {
          grid[h-2][bx] = 'F^'; // bottom looking up
       }
       
       if (lockType === 'BEAVER') {
          // Slide a beaver into the Fox's vision
          const beaverY = doorY + (grid[1][bx] === 'Fv' ? -1 : 1);
          grid[beaverY][bx-1] = Math.random() > 0.5 ? 'B>' : 'B<'; // Wait, B must slide across boundary!
          // We will refine Beaver logic below
       }
       
    } else if (lockType === 'PORCUPINE') {
       // Use a Warren
       grid[doorY][bx - 1] = 'W';
       grid[doorY][bx + 1] = 'W';
       // Seal wall completely across boundary
       
       // Porcupine watches the entry Warren
       grid[doorY > 2 ? doorY - 1 : doorY + 1][bx - 1] = doorY > 2 ? 'Pv' : 'P^'; 
    }
    
    // Place Egg in previous region
    const prevStartX = i === 0 ? 1 : boundaries[i - 1] + 1;
    const eggX = prevStartX + Math.floor(Math.random() * (regionWidth - 1));
    const eggY = Math.floor(Math.random() * (h - 4)) + 2;
    grid[eggY][eggX] = 'N';

    // Place Bear hazard
    if (Math.random() > 0.3) {
       grid[eggY + 1][eggX] = 'M';
    }
  }

  // Print Map visually
  for(let y=0; y<h; y++) {
    let row = '';
    for(let x=0; x<w; x++) {
      row += grid[y][x].padEnd(2, ' ');
    }
    console.log(row);
  }
}

generateOptionA(13, 11, 2);
