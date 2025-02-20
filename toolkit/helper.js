const moment = require('moment-timezone');
const { writeFileSync } = require('fs');
const { exec } = require('child_process');

// Format waktu
const Format = {
    time: () => {
        return moment().format('HH:mm'); // Format jam dan menit
    },
    date: (timestamp) => {
        return moment(timestamp * 1000).format('DD-MM-YYYY');
    }
};

// Fungsi untuk menghubungkan bot
const Connect = {
    log: (text) => {
        console.log(`[LOG] ${text}`);
    },
    error: (text) => {
        console.error(`[ERROR] ${text}`);
    }
};

// Fungsi untuk membuat stiker dari gambar/video
const createSticker = async (media) => {
    const inputPath = './temp/input.png';  // Sesuaikan dengan format media
    const outputPath = './temp/output.webp';

    writeFileSync(inputPath, media);
    await new Promise((resolve, reject) => {
        exec(`ffmpeg -i ${inputPath} -vf scale=512:512 ${outputPath}`, (err) => {
            if (err) return reject(err);
            resolve();
        });
    });

    return require('fs').readFileSync(outputPath);
};

module.exports = { Format, Connect, createSticker };