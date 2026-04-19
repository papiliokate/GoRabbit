import puppeteer from 'puppeteer';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import * as googleTTS from 'google-tts-api';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const TTS_PATH = path.resolve('public/tts.mp3');

const bgmDir = path.resolve('public/bgm');
const bgmFiles = fs.readdirSync(bgmDir).filter(f => f.endsWith('.mp3'));
const randomBgm = bgmFiles[Math.floor(Math.random() * bgmFiles.length)];
const BGM_PATH = path.resolve(bgmDir, randomBgm);
console.log(`Selected BGM: ${randomBgm}`);
const RAW_VIDEO = path.resolve('raw.mp4');
const FINAL_VIDEO = path.resolve('public/daily_video.mp4');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
    const server = spawn('node', ['node_modules/vite/bin/vite.js', '--port', '5173', '--strictPort', '--host', '127.0.0.1', '--clearScreen', 'false'], {
        cwd: process.cwd(),
        shell: false
    });
    
    server.stderr.on('data', (data) => console.error("VITE ERROR:", data.toString()));
    server.stdout.on('data', (data) => console.log("VITE:", data.toString()));

    console.log("Waiting 5 seconds for Vite dev server to boot...");
    await sleep(5000);

    console.log("Assuming Server is ready!");

    const FORMAT = process.env.FORMAT || 'standard';
    console.log(`Generating video for format: ${FORMAT}`);
    
    let urlParam = 'small';
    let ttsText = "Welcome to today's Go Rabbit challenge. Can you find the winning moves?";
    
    if (FORMAT === 'fail') {
        urlParam = 'fail';
        ttsText = "I literally cannot believe the bot missed this move. Try to beat today's map!";
    } else if (FORMAT === 'interactive') {
        urlParam = 'interactive';
        ttsText = "Only 1% of players get this final move right. Which path wins the game?";
    }

    console.log("Generating TTS audio...");
    try {
        const ttsUrl = googleTTS.getAudioUrl(ttsText, {
            lang: 'en',
            slow: false,
            host: 'https://translate.google.com',
        });
        const ttsResponse = await fetch(ttsUrl);
        const ttsBuffer = await ttsResponse.arrayBuffer();
        fs.writeFileSync(TTS_PATH, Buffer.from(ttsBuffer));
        console.log("TTS audio successfully generated.");
    } catch (err) {
        console.warn("Failed to generate TTS audio, continuing without it.", err);
        // Create an empty dummy file so ffmpeg doesn't fail if TTS fails
        fs.writeFileSync(TTS_PATH, Buffer.from([]));
    }

    const browser = await puppeteer.launch({
        headless: 'new', // new headless mode is better for plugins/recorders
        args: [
            '--window-size=720,1280',
            '--autoplay-policy=no-user-gesture-required',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
        ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 720, height: 1280 });
    
    const recorder = new PuppeteerScreenRecorder(page, {
        fps: 30,
        ffmpeg_Path: ffmpegInstaller.path,
        videoFrame: {
            width: 720,
            height: 1280,
        },
        aspectRatio: '9:16',
    });

    console.log("Navigating to game and starting recording...");
    try {
        await page.goto(`http://127.0.0.1:5173/?autoplay=${urlParam}&tiktok=true`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    } catch (e) {
        console.warn("Navigation timeout reached, but we will wait for internal game completion flag.", e.message);
    }

    console.log("Starting Puppeteer Screen Recorder...");
    await recorder.start(RAW_VIDEO);

    console.log("Recording... Waiting for game completion.");
    
    let gameWon = false;
    for (let i = 0; i < 240; i++) { // Max wait 120 seconds to accommodate interactive pause
        gameWon = await page.evaluate(() => window._GAME_WON === true);
        if (gameWon) break;
        await sleep(500);
    }
    
    // Wait a couple of seconds after win to capture the victory state
    await sleep(5000);

    console.log("Gameplay finished. Saving video...");
    await recorder.stop();
    
    try { await browser.close(); } catch(e) {}
    server.kill();

    console.log("Compositing TikTok video using FFmpeg...");
    
    await new Promise((resolve, reject) => {
        ffmpeg()
            .input(RAW_VIDEO)
            .input(BGM_PATH).inputOptions(['-stream_loop', '-1'])
            .input(TTS_PATH)
            .complexFilter([
                '[1:a]volume=0.3[bgm_quiet]',
                '[2:a]volume=1.5[tts_loud]',
                '[bgm_quiet][tts_loud]amix=inputs=2:duration=first:dropout_transition=3[audio_out]'
            ])
            .outputOptions([
                '-y',
                '-map 0:v',
                '-map [audio_out]',
                '-c:v libx264',
                '-pix_fmt yuv420p',
                '-preset slow',
                '-crf 18',
                '-c:a aac',
                '-b:a 192k',
                '-shortest'
            ])
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

main().then(() => {
    if (!fs.existsSync(FINAL_VIDEO) || fs.statSync(FINAL_VIDEO).size < 1024) {
        throw new Error("Final video was not created or is empty!");
    }
    console.log("Process complete. Exiting natively.");
    process.exit(0);
}).catch(err => {
    console.error("Script failed:", err);
    process.exit(1);
});
