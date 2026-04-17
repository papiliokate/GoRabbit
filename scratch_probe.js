import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { spawn } from 'child_process';

const ffprobe = spawn(ffmpegInstaller.path.replace('ffmpeg.exe', 'ffprobe.exe'), [
    '-v', 'error',
    '-select_streams', 'v:0',
    '-show_entries', 'stream=pix_fmt,codec_name',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    'public/daily_tiktok.mp4'
]);

ffprobe.stdout.on('data', (data) => console.log(data.toString()));
ffprobe.stderr.on('data', (data) => console.error(data.toString()));
