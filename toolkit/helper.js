const fs = require('fs');
const moment = require('moment-timezone');
const { exec } = require('child_process');
const path = require('path');
const axios = require('axios');

// Pastikan folder "temp" tersedia
const tempFolder = path.join(__dirname, '../temp');
if (!fs.existsSync(tempFolder)) {
  fs.mkdirSync(tempFolder, { recursive: true });
}

// Fungsi Logging
const Connect = {
  log: (text) => console.log(`[LOG] ${text}`),
  error: (text) => console.error(`[ERROR] ${text}`)
};

// Fungsi Format Waktu
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

// Fungsi untuk mendownload media dari URL
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

// Fungsi untuk membuat stiker dari gambar/video
const createSticker = async (media, isVideo = false) => {
  const inputPath = path.join(tempFolder, isVideo ? 'input.mp4' : 'input.png');
  const outputPath = path.join(tempFolder, 'output.webp');

  fs.writeFileSync(inputPath, media);

  try {
    let ffmpegCommand;
    
    if (isVideo) {
      ffmpegCommand = `ffmpeg -i ${inputPath} -vf "scale=512:512:flags=lanczos,format=rgba" -r 10 -an -vsync vfr ${outputPath}`;
    } else {
      ffmpegCommand = `ffmpeg -i ${inputPath} -vf "scale=512:512:flags=lanczos" ${outputPath}`;
    }

    await new Promise((resolve, reject) => {
      exec(ffmpegCommand, (err, stdout, stderr) => {
        if (err) {
          console.error(`[FFMPEG ERROR] ${stderr}`);
          return reject(new Error('FFmpeg gagal memproses media'));
        }
        resolve();
      });
    });

    const sticker = fs.readFileSync(outputPath);

    // Hapus file sementara
    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);

    return sticker;
  } catch (error) {
    Connect.error('❌ Gagal membuat stiker:', error.message);

    try { fs.unlinkSync(inputPath); } catch (e) {}
    try { fs.unlinkSync(outputPath); } catch (e) {}

    throw error;
  }
};

module.exports = { Connect, createSticker, download, Format };

// Hot reload untuk file ini jika ada perubahan
let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(`[UPDATE] ${__filename}`);
  delete require.cache[file];
  require(file);
});