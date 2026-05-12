import puppeteer from 'puppeteer';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';
import fs from 'fs';
import path from 'path';
import { spawn, execSync } from 'child_process';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { EdgeTTS } from 'node-edge-tts';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const downloadsDir = 'C:\\Users\\papil\\Downloads';
const assetsDir = path.resolve('public/video_assets');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

// 1. Gather assets
const allFiles = fs.readdirSync(downloadsDir);
const oneFilesRaw = allFiles.filter(f => f.startsWith('1 -') || f.startsWith('1-')).sort();
const oneFiles = [...oneFilesRaw, ...oneFilesRaw];
const twoFile = '2 - final.jpg';
const cheerFile = path.resolve(downloadsDir, 'Applause.mp3');

console.log(`Found ${oneFiles.length} "1 -" files.`);
if (!twoFile) throw new Error('Could not find "2 -" file.');

// Copy assets to public to serve
for (const f of oneFiles) {
    fs.copyFileSync(path.resolve(downloadsDir, f), path.resolve(assetsDir, f));
}
fs.copyFileSync(path.resolve(downloadsDir, twoFile), path.resolve(assetsDir, twoFile));

const TTS_PATH = path.resolve(assetsDir, 'nope.mp3');

async function main() {
    // 2. Generate TTS
    console.log("Generating 'nope' TTS...");
    try {
        const tts = new EdgeTTS({
            voice: 'en-US-ChristopherNeural',
            lang: 'en-US',
            outputFormat: 'audio-24khz-48kbitrate-mono-mp3'
        });
        await tts.ttsPromise("nope", TTS_PATH);
    } catch (err) {
        console.log("TTS failed", err);
    }

    // 3. Generate HTML timeline
    console.log("Generating HTML payload...");
    const htmlPath = path.resolve(assetsDir, 'video.html');
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { margin: 0; padding: 0; background: #000; color: #fff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; overflow: hidden; display: flex; align-items: center; justify-content: center; height: 100vh; width: 100vw; }
        #text-container { position: absolute; text-align: center; font-size: 50px; font-weight: bold; opacity: 0; transition: opacity 0.5s; }
        #image-container { position: absolute; width: 100%; height: 100%; display: none; background-size: contain; background-position: center; background-repeat: no-repeat; }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
</head>
<body>
    <div id="text-container">How to actually make a video game.</div>
    <div id="image-container"></div>
    <script>
        const oneFiles = ${JSON.stringify(oneFiles)};
        const twoFile = "${twoFile}";
        
        const textContainer = document.getElementById('text-container');
        const imgContainer = document.getElementById('image-container');
        
        async function run() {
            // 0.0s - 1.5s: Text fade in and out
            setTimeout(() => { textContainer.style.opacity = 1; }, 100);
            setTimeout(() => { textContainer.style.opacity = 0; }, 1000);
            
            // 1.5s: Start slideshow
            setTimeout(async () => {
                textContainer.style.display = 'none';
                imgContainer.style.display = 'block';
                
                for (let i = 0; i < oneFiles.length; i++) {
                    imgContainer.style.backgroundImage = 'url("' + encodeURIComponent(oneFiles[i]) + '")';
                    await new Promise(r => setTimeout(r, 500));
                }
                
                // End: Show twoFile and confetti
                imgContainer.style.backgroundImage = 'url("' + encodeURIComponent(twoFile) + '")';
                
                // Fire confetti
                var duration = 3000;
                var end = Date.now() + duration;
                (function frame() {
                    confetti({ particleCount: 15, angle: 60, spread: 55, origin: { x: 0 } });
                    confetti({ particleCount: 15, angle: 120, spread: 55, origin: { x: 1 } });
                    if (Date.now() < end) requestAnimationFrame(frame);
                }());
                
            }, 1500);
        }
        
        run();
    </script>
</body>
</html>
    `;
    fs.writeFileSync(htmlPath, htmlContent);

    // 4. Record visual track
    console.log("Recording visual track with Puppeteer...");
    const RAW_VIDEO = path.resolve('raw_visual.mp4');
    
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--window-size=1280,720', '--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    
    const recorder = new PuppeteerScreenRecorder(page, {
        fps: 30,
        ffmpeg_Path: ffmpegInstaller.path,
        videoFrame: { width: 1280, height: 720 }
    });

    await recorder.start(RAW_VIDEO);
    await page.goto('file://' + htmlPath);
    
    // Total time = 1.5s (text) + (N * 0.5s) (slideshow) + 4s (confetti hold)
    const totalDuration = 1500 + (oneFiles.length * 500) + 4000;
    await new Promise(r => setTimeout(r, totalDuration));
    
    await recorder.stop();
    await browser.close();

    // 5. Build complex FFmpeg audio track and mux
    console.log("Compositing audio and final video...");
    const FINAL_VIDEO = path.join(downloadsDir, 'How_To_Make_A_Game.mp4');
    
    let filterString = '';
    let inputs = 18; // base
    let delayInputs = [];
    
    for (let i = 0; i < oneFiles.length; i++) {
        const delayMs = 1500 + (i * 500);
        filterString += `[1:a]adelay=${delayMs}|${delayMs}[n${i}];`;
        delayInputs.push(`[n${i}]`);
    }
    
    const cheerDelayMs = 1500 + (oneFiles.length * 500);
    filterString += `[2:a]adelay=${cheerDelayMs}|${cheerDelayMs}[cheer];`;
    
    filterString += `${delayInputs.join('')}[cheer]amix=inputs=${oneFiles.length + 1}:duration=longest:dropout_transition=3[amixed];[amixed]volume=${oneFiles.length + 1}[audio_out]`;

    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(RAW_VIDEO)
            .input(TTS_PATH)
            .input(cheerFile)
            .complexFilter(filterString)
            .outputOptions([
                '-y',
                '-map 0:v',
                '-map [audio_out]',
                '-c:v copy',
                '-c:a aac',
                '-b:a 192k',
                '-shortest'
            ])
            .save(FINAL_VIDEO)
            .on('end', () => {
                console.log(`Video saved to ${FINAL_VIDEO}`);
                resolve();
            })
            .on('error', (err) => {
                console.error("FFmpeg error:", err);
                reject();
            });
    });
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });


