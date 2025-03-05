const fs = require('fs');
const moment = require('moment-timezone');
const { exec } = require('child_process');
const path = require('path');

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
  time: () => moment().format('HH:mm'), // Format jam dan menit
  date: (timestamp) => moment(timestamp * 1000).format('DD-MM-YYYY'),
  uptime: () => {
    let totalSeconds = process.uptime();
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = Math.floor(totalSeconds % 60);
    return `${hours}h ${minutes}m ${seconds}s`;
  }
};

// Fungsi untuk membuat stiker dari gambar/video
const createSticker = async (media, isVideo = false) => {
  const inputPath = path.join(tempFolder, isVideo ? 'input.mp4' : 'input.png');
  const outputPath = path.join(tempFolder, 'output.webp');

  // Tulis media ke file input
  fs.writeFileSync(inputPath, media);

  try {
    // Konversi media menjadi stiker menggunakan ffmpeg
    const ffmpegCommand = isVideo
      ? `ffmpeg -i ${inputPath} -vf "scale=512:512:flags=lanczos,format=rgba" -loop 0 -preset ultrafast -an -vsync 0 ${outputPath}`
      : `ffmpeg -i ${inputPath} -vf scale=512:512 ${outputPath}`;

    await new Promise((resolve, reject) => {
      exec(ffmpegCommand, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    // Baca hasil stiker dari file output
    const sticker = fs.readFileSync(outputPath);

    // Hapus file input dan output setelah selesai
    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);

    return sticker;
  } catch (error) {
    console.error('❌ Gagal membuat stiker:', error.message);

    // Hapus file input dan output jika terjadi error
    try { fs.unlinkSync(inputPath); } catch (e) {}
    try { fs.unlinkSync(outputPath); } catch (e) {}

    throw error;
  }
};

module.exports = { Connect, createSticker, Format };

// Hot reload untuk file ini jika ada perubahan
let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.green.bold(`[UPDATE] ${__filename}`));
  delete require.cache[file];
  require(file);
});