const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');
const { exec } = require('child_process');
const axios = require('axios');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');

const tempFolder = path.join(__dirname, '../temp');
if (!fs.existsSync(tempFolder)) {
  fs.mkdirSync(tempFolder, { recursive: true });
}

const Connect = {
  log: (text) => console.log(`[LOG] ${text}`),
  error: (text) => console.error(`[ERROR] ${text}`)
};

const Format = {
  time: () => moment().format('HH:mm'),
  date: (timestamp) => moment(timestamp * 1000).format('DD-MM-YYYY'),
  uptime: () => {
    let totalSeconds = process.uptime();
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = Math.floor(totalSeconds % 60);
    return `${hours}h ${minutes}m ${seconds}s`;
  }
};

const download = async (url, filePath) => {
  try {
    const writer = fs.createWriteStream(filePath);
    const response = await axios({ url, method: 'GET', responseType: 'stream' });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    Connect.error('Gagal mendownload media:', error);
    throw new Error('Gagal mendownload media');
  }
};

const createSticker = async (media, isVideo = false) => {
  const inputPath = path.join(tempFolder, isVideo ? 'input.mp4' : 'input.png');
  const outputPath = path.join(tempFolder, 'output.webp');

  fs.writeFileSync(inputPath, media);

  try {
    let ffmpegCommand = isVideo
      ? `ffmpeg -i ${inputPath} -vf "scale='min(512,iw)':-1:flags=lanczos,format=rgba" -r 10 -an -vsync vfr ${outputPath}`
      : `ffmpeg -i ${inputPath} -vf "scale='min(512,iw)':-1:flags=lanczos" ${outputPath}`;

    await new Promise((resolve, reject) => {
      exec(ffmpegCommand, (err, stdout, stderr) => {
        if (err) {
          Connect.error(`[FFMPEG ERROR] ${stderr}`);
          return reject(new Error('FFmpeg gagal memproses media'));
        }
        resolve();
      });
    });

    const sticker = new Sticker(outputPath, {
      pack: footer,
      author: botName,
      type: StickerTypes.FULL,
      quality: 100,
    });

    const buffer = await sticker.toBuffer();

    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);

    return buffer;
  } catch (error) {
    Connect.error('❌ Gagal membuat stiker:', error.message);

    try { fs.unlinkSync(inputPath); } catch (e) {}
    try { fs.unlinkSync(outputPath); } catch (e) {}

    throw error;
  }
};

module.exports = { Connect, createSticker, download, Format };

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(`[UPDATE] ${__filename}`);
  delete require.cache[file];
  require(file);
});