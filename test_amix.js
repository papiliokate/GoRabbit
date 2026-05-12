import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg()
    .input('C:/Users/papil/Documents/GoRabbit/raw_visual.mp4')
    .input('C:/Users/papil/Documents/GoRabbit/public/video_assets/nope.mp3')
    .input('C:/Users/papil/Downloads/Applause.mp3')
    .complexFilter('[1:a]adelay=1500|1500[n0];[n0][2:a]amix=inputs=2[amixed];[amixed]volume=2[audio_out]')
    .outputOptions(['-y', '-map 0:v', '-map [audio_out]', '-c:v copy', '-c:a aac', '-t 5'])
    .save('C:/Users/papil/Downloads/test_mix.mp4')
    .on('end', () => console.log('Done'))
    .on('error', (err, stdout, stderr) => console.log('FFmpeg Error:', stderr));
