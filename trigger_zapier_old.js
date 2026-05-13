const ts = Math.floor(Date.now() / 1000);
const targetPath = 'go-rabbit';
const videoFile = 'Go Rabbit.mp4';
const exactTitle = 'Go Rabbit';

const videoUrl = `https://oops-games.com/${targetPath}/${encodeURIComponent(videoFile)}?t=${ts}`;

const payload = {
    video_url: videoUrl,
    text: `Play today's ${exactTitle} challenge at oops-games.com/${targetPath}`,
    youtube_title: exactTitle,
    target_channel: 'all'
};

fetch('https://hooks.zapier.com/hooks/catch/27231889/ujm5mjh/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
}).then(res => {
    if (!res.ok) throw new Error('Zapier webhook failed: ' + res.statusText);
    console.log('Webhook sent successfully! Video URL:', videoUrl);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
