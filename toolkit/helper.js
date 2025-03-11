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

// Fungsi untuk mendownload media dari URL
const download = async (url, filePath) => {
  try {
    const writer = fs.createWriteStream(filePath);
    
    // Mendapatkan stream data dari URL menggunakan axios
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
    });

    // Menulis data ke file
    response.data.pipe(writer);

    // Menunggu sampai unduhan selesai
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('Error saat mendownload file:', error);
    throw new Error('Gagal mendownload media');
  }
};

const pinDownload = async (url, conn, message) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const imgSrc = $('img[src^="https://i.pinimg.com"]').attr('src'); // Mendapatkan URL gambar pertama

    if (imgSrc) {
      const fileName = path.basename(imgSrc);
      const tempPath = path.join(__dirname, `../../temp/${fileName}`);
      
      // Download gambar
      await download(imgSrc, tempPath);
      
      // Kirim media ke chat
      await conn.sendMessage(message.from, fs.readFileSync(tempPath), { 
        caption: 'Berikut gambar yang Anda minta!', 
        mimetype: 'image/jpeg' 
      });
      
      // Hapus file sementara setelah mengirim
      fs.unlinkSync(tempPath);
    } else {
      await conn.sendMessage(message.from, '❌ Gagal menemukan gambar di URL tersebut.', { quoted: message });
    }
  } catch (error) {
    console.error('❌ Error saat mendownload media:', error);
    await conn.sendMessage(message.from, '❌ Gagal mendownload media, pastikan URL benar.', { quoted: message });
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

module.exports = { Connect, createSticker, pinDownload, download, Format };

// Hot reload untuk file ini jika ada perubahan
let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.green.bold(`[UPDATE] ${__filename}`));
  delete require.cache[file];
  require(file);
});