import puppeteer from 'puppeteer';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const BGM_PATH = path.resolve('public/tiktok_bgm.mp3');
const RAW_VIDEO = path.resolve('raw.webm');
const FINAL_VIDEO = path.resolve('public/daily_tiktok.mp4');

// Utility to sleep
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
    const server = spawn('npx', ['vite', '--port', '5173', '--host', '127.0.0.1', '--clearScreen', 'false'], {
        cwd: process.cwd(),
        shell: true
    });
    
    server.stderr.on('data', (data) => console.error("VITE ERROR:", data.toString()));
    server.stdout.on('data', (data) => console.log("VITE:", data.toString()));

    // Wait 5 seconds unconditionally for Vite to start up
    console.log("Waiting 5 seconds for Vite dev server to boot...");
    await sleep(5000);

    console.log("Assuming Server is ready!");

    // Launch Puppeteer natively
    const browser = await puppeteer.launch({
        headless: process.env.HEADLESS === 'true' ? 'new' : false,
        args: [
            '--window-size=1280,720',
            '--autoplay-policy=no-user-gesture-required',
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    
    console.log("Navigating to game and starting recording...");
    try {
        // Try to load, ignore timeout if it exceeds 30s, the page will just continue rendering in background
        await page.goto('http://127.0.0.1:5173/?autoplay=small', { waitUntil: 'domcontentloaded', timeout: 30000 });
    } catch (e) {
        console.warn("Navigation timeout reached, but we will wait for internal game completion flag.", e.message);
    }

    const recorder = new PuppeteerScreenRecorder(page, {
        fps: 30,
        quality: 100,
        format: 'webm',
        videoFrame: { width: 1280, height: 720 },
        videoCrf: 18,
        videoCodec: 'libvpx',
        videoBitrate: 1000,
        autopad: { color: 'black' },
        ffmpeg_Path: ffmpegInstaller.path
    });
    
    await recorder.start(RAW_VIDEO);

    console.log("Recording... Waiting for game completion.");
    
    // Poll for the end of the game
    let gameWon = false;
    for (let i = 0; i < 120; i++) { // Max wait 60 seconds
        gameWon = await page.evaluate(() => window._GAME_WON === true);
        if (gameWon) break;
        await sleep(500);
    }
    
    // Wait a couple of seconds after win to capture the victory state
    await sleep(3000);

    console.log("Gameplay finished. Saving video...");
    await recorder.stop();
    await browser.close();
    server.kill();

    console.log("Compositing TikTok video using FFmpeg...");
    
    await new Promise((resolve, reject) => {
        // Crop video to 9:16 aspect ratio (since source is 1280x720 (16:9), crop to roughly 405x720)
        // Then add music
        // Then overlay text
        
        ffmpeg()
            .input(RAW_VIDEO)
            .input(BGM_PATH)
            .outputOptions([
                '-c:v libx264',
                '-preset fast',
                '-crf 23',
                '-c:a aac',
                '-b:a 192k',
                // Loop the BGM, or stop when the shortest stream ends
                '-shortest'
            ])
            .complexFilter([
                // Crop to 9:16
                '[0:v]crop=ih*(9/16):ih[cropped]',
                // Draw title
                `[cropped]drawtext=text='Go Rabbit Daily Puzzle':fontcolor=white:fontsize=36:x=(w-text_w)/2:y=(h-text_h)/5:borderw=2:bordercolor=black[withtitle]`,
                // Draw subtitle
                `[withtitle]drawtext=text='Can you solve Medium & Hard?':fontcolor=#38bdf8:fontsize=24:x=(w-text_w)/2:y=h-(h/5):borderw=2:bordercolor=black[final_v]`
            ])
            .map('[final_v]')
            .map('1:a') // Audio from the second input (BGM)
            .save(FINAL_VIDEO)
            .on('end', () => {
                console.log(`Successfully generated TikTok video at: ${FINAL_VIDEO}`);
                resolve();
            })
            .on('error', (err) => {
                console.error("FFmpeg Error:", err);
                reject(err);
            });
    });
}

main().catch(err => {
    console.error("Script failed:", err);
    process.exit(1);
});
