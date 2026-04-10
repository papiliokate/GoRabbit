function generateBSP(w, h, depth) {
  let grid = Array(h).fill(0).map(() => Array(w).fill('T'));
  let doors = [];

  function carve(rx, ry, rw, rh, d) {
    if (d <= 0 || rw < 4 || rh < 4) {
      // Carve room
      for (let y = ry; y < ry + rh; y++) {
        for (let x = rx; x < rx + rw; x++) {
          if (x > 0 && x < w - 1 && y > 0 && y < h - 1) {
             grid[y][x] = ' ';
          }
        }
      }
      return;
    }

    let splitVert = rw > rh;
    if (splitVert) {
      let split = Math.floor(rw / 2); // + (Math.random() > 0.5 ? 1 : -1);
      carve(rx, ry, split, rh, d - 1);
      carve(rx + split, ry, rw - split, rh, d - 1);
      
      // We must make a door between them. 
      // The boundary is at `rx + split`. 
      // Wait, if both sides carve, they meet at `rx + split`?
      // No, `rx + split` belongs to the right room.
      // But we want a WALL at the boundary!
    } else {
      let split = Math.floor(rh / 2);
      carve(rx, ry, rw, split, d - 1);
      carve(rx, ry + split, rw, rh - split, d - 1);
    }
  }

  carve(1, 1, w - 2, h - 2, depth);
  
  for(let y=0; y<h; y++) {
    console.log(grid[y].join(''));
  }
}
generateBSP(15, 13, 2);
