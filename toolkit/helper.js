const moment = require('moment-timezone');
const { writeFileSync, unlinkSync, readFileSync } = require('fs');
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

    // Tulis media ke file input
    writeFileSync(inputPath, media);

    try {
        // Konversi media menjadi stiker menggunakan ffmpeg
        await new Promise((resolve, reject) => {
            exec(`ffmpeg -i ${inputPath} -vf scale=512:512 ${outputPath}`, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        // Baca hasil stiker dari file output
        const sticker = readFileSync(outputPath);

        // Hapus file input dan output setelah selesai
        unlinkSync(inputPath);
        unlinkSync(outputPath);

        return sticker;

    } catch (error) {
        console.error('❌ Gagal membuat stiker:', error.message);

        // Hapus file input dan output jika terjadi error
        try { unlinkSync(inputPath); } catch (e) {}
        try { unlinkSync(outputPath); } catch (e) {}

        throw error;
    }
};

module.exports = { Format, Connect, createSticker };
