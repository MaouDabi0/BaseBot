const { isPrefix } = require('../../toolkit/setting');
const { createSticker } = require('../../toolkit/helper'); // Pastikan fungsi ini tersedia

module.exports = {
    name: 'stiker',
    description: 'Mengubah gambar atau video menjadi stiker',
    run: async (conn, message, args) => {
        try {
            // Tangkap teks dari berbagai jenis pesan
            const messageText = message.body || 
                                message.message?.conversation || 
                                message.message?.extendedTextMessage?.text || 
                                '';

            if (!messageText) return; // Jika tidak ada teks, hentikan eksekusi

            // Cek apakah pesan menggunakan prefix yang benar
            const prefix = isPrefix.find(p => messageText.startsWith(p));
            if (!prefix) return; // Jika tidak ada prefix yang cocok, hentikan eksekusi

            // Ambil command setelah prefix
            const commandText = messageText.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase();
            if (commandText !== 'stiker') return; // Pastikan yang dipanggil adalah "stiker"

            // Periksa apakah pesan mengandung media (gambar/video)
            const isImage = message.message?.imageMessage;
            const isVideo = message.message?.videoMessage;

            if (!isImage && !isVideo) {
                return conn.sendMessage(message.key.remoteJid, { 
                    text: `Kirim gambar/video dengan caption *${prefix}stiker*` 
                });
            }

            // Unduh media
            const media = await conn.downloadMediaMessage(message);
            if (!media) {
                return conn.sendMessage(message.key.remoteJid, { 
                    text: '❌ Gagal mengunduh media!' 
                });
            }

            // Konversi ke stiker
            const sticker = await createSticker(media);
            if (!sticker) {
                return conn.sendMessage(message.key.remoteJid, { 
                    text: '❌ Gagal membuat stiker!' 
                });
            }

            // Kirim stiker
            await conn.sendMessage(message.key.remoteJid, { sticker });

        } catch (error) {
            console.error('❌ Error membuat stiker:', error);
            conn.sendMessage(message.key.remoteJid, { 
                text: '❌ Terjadi kesalahan saat membuat stiker, coba lagi!' 
            });
        }
    }
};
