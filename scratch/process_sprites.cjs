const fs = require('fs');
const http = require('http');
const path = require('path');

const PORT = 3005;

// The AI generated images to process
const tasks = [
    { name: 'fox', path: 'C:\\Users\\papil\\.gemini\\antigravity\\brain\\6ac14225-1f10-491e-b56a-1641d1a786fa\\fox_sheet_1776037834689.png' },
    { name: 'porcupine', path: 'C:\\Users\\papil\\.gemini\\antigravity\\brain\\6ac14225-1f10-491e-b56a-1641d1a786fa\\porcupine_sheet_1776037846430.png' },
    { name: 'beaver', path: 'C:\\Users\\papil\\.gemini\\antigravity\\brain\\6ac14225-1f10-491e-b56a-1641d1a786fa\\beaver_sheet_1776037857355.png' }
];

const htmlClient = `
<!DOCTYPE html>
<html>
<body>
  <h1>Processing AI Sprites</h1>
  <div id="log"></div>
  <script>
    const log = (msg) => { document.getElementById('log').innerHTML += msg + '<br>'; console.log(msg); };
    const tasks = ${JSON.stringify(tasks)};
    
    async function process() {
      for (const task of tasks) {
        log('Processing ' + task.name + '...');
        await cropAndUpload(task);
      }
      log('DONE!');
      fetch('/done', { method: 'POST' });
    }

    async function cropAndUpload(task) {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
          const w = img.width;
          const h = img.height;
          
          const cvs = document.createElement('canvas');
          cvs.width = w; cvs.height = h;
          const ctx = cvs.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, w, h);
          const data = imgData.data;

          function getBBox(sx, ex) {
            let minX=w, maxX=-1, minY=h, maxY=-1;
            for(let y=0; y<h; y++){
              for(let x=sx; x<ex; x++){
                let i = (y*w + x)*4;
                if (data[i] < 240 || data[i+1] < 240 || data[i+2] < 240) { // not strictly white threshold
                  if(x<minX) minX=x; if(x>maxX) maxX=x;
                  if(y<minY) minY=y; if(y>maxY) maxY=y;
                }
              }
            }
            if(minX > maxX) return null; // blank
            return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
          }

          const box1 = getBBox(0, Math.floor(w/2) - 10);
          const box2 = getBBox(Math.floor(w/2) + 10, w);
          
          if (!box1 || !box2) {
             log('Error finding foxes in ' + task.name);
             return resolve();
          }

          // We want the final sprites to be consistent. 
          // Max dimensions plus some padding
          const pad = 20;
          const finalW = Math.max(box1.width, box2.width) + pad*2;
          const finalH = Math.max(box1.height, box2.height) + pad*2;

          // Assemble the final 2-frame sprite sheet
          const finalCvs = document.createElement('canvas');
          finalCvs.width = finalW * 2;
          finalCvs.height = finalH;
          const fCtx = finalCvs.getContext('2d');

          // Draw left frame (box1), aligned by bottom-center
          // The bottom-center of the target is x = finalW/2, y = finalH - pad
          // The bottom-center of the source is x = box1.minX + box1.width/2, y = box1.maxY
          const targetBottom1 = finalH - pad;
          const targetCenterX1 = finalW / 2;
          fCtx.drawImage(
              cvs, 
              box1.minX, box1.minY, box1.width, box1.height,
              targetCenterX1 - (box1.width/2), targetBottom1 - box1.height, box1.width, box1.height
          );

          // Draw right frame (box2), aligned by bottom-center
          const targetBottom2 = finalH - pad;
          const targetCenterX2 = finalW * 1.5;
          fCtx.drawImage(
              cvs, 
              box2.minX, box2.minY, box2.width, box2.height,
              targetCenterX2 - (box2.width/2), targetBottom2 - box2.height, box2.width, box2.height
          );

          // POST it back
          const dataUrl = finalCvs.toDataURL('image/png');
          fetch('/upload', {
            method: 'POST',
            body: JSON.stringify({ name: task.name, dataUrl }),
            headers: { 'Content-Type': 'application/json' }
          }).then(resolve).catch(e => { log(e); resolve(); });
        };
        img.src = '/image/' + task.name;
      });
    }

    process();
  </script>
</body>
</html>
`;

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(htmlClient);
  } else if (req.url.startsWith('/image/')) {
    const name = req.url.split('/')[2];
    const task = tasks.find(t => t.name === name);
    if (task && fs.existsSync(task.path)) {
      res.writeHead(200, { 'Content-Type': 'image/png' });
      fs.createReadStream(task.path).pipe(res);
    } else {
      res.writeHead(404).end('Not found');
    }
  } else if (req.url === '/upload') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      const payload = JSON.parse(body);
      const base64Data = payload.dataUrl.replace(/^data:image\/png;base64,/, "");
      // Save it directly into the public folder!
      const outPath = path.join(__dirname, '..', 'public', payload.name + '.png');
      fs.writeFileSync(outPath, base64Data, 'base64');
      console.log('Saved perfect sprite sheet to: ' + outPath);
      res.writeHead(200).end('OK');
    });
  } else if (req.url === '/done') {
    console.log('All images processed successfully. Shutting down server.');
    res.writeHead(200).end('OK');
    setTimeout(() => process.exit(0), 500);
  }
});

server.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});
