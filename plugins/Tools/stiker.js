const { isPrefix } = require('../../toolkit/setting');
const { createSticker } = require('../../toolkit/helper'); 
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {
    name: 'stiker',
    command: ['s', 'stiker', 'sticker'],
    category: 'tools',
    desc: 'Mengubah gambar atau video menjadi stiker',

    run: async (conn, message) => {
        try {
            // Mengambil teks dari berbagai jenis pesan, termasuk caption media
            const messageText = message.body || 
                                message.message?.conversation || 
                                message.message?.extendedTextMessage?.text || 
                                message.message?.imageMessage?.caption ||
                                message.message?.videoMessage?.caption ||
                                '';

            if (!messageText) return;

            // Memeriksa prefix dan perintah yang digunakan
            const prefix = isPrefix.find(p => messageText.startsWith(p));
            if (!prefix) return;

            const commandText = messageText.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase();
            if (!module.exports.command.includes(commandText)) return;

            // Cek media pada quoted message atau pesan utama
            const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const isImage = quotedMessage?.imageMessage || message.message?.imageMessage;
            const isVideo = quotedMessage?.videoMessage || message.message?.videoMessage;

            if (!isImage && !isVideo) {
                return conn.sendMessage(message.key.remoteJid, { 
                    text: `Balas gambar/video dengan caption *${prefix}s*, *${prefix}stiker*, atau *${prefix}sticker* ` +
                          `atau kirim langsung media dengan caption yang sama!` 
                }, { quoted: message });
            }

            // Mengunduh media
            let media;
            try {
                media = await downloadMediaMessage(
                    { message: quotedMessage || message.message },
                    'buffer',
                    {}
                );
                if (!media) throw 'Media tidak terunduh!';
            } catch {
                return conn.sendMessage(message.key.remoteJid, { 
                    text: '❌ Gagal mengunduh media!' 
                }, { quoted: message });
            }

            // Membuat stiker
            let sticker;
            try {
                sticker = await createSticker(media);
                if (!sticker) throw 'Stiker tidak berhasil dibuat!';
            } catch {
                return conn.sendMessage(message.key.remoteJid, { 
                    text: '❌ Gagal membuat stiker!' 
                }, { quoted: message });
            }

            // Mengirim stiker
            await conn.sendMessage(message.key.remoteJid, { sticker }, { quoted: message });

        } catch (error) {
            conn.sendMessage(message.key.remoteJid, { 
                text: '❌ Terjadi kesalahan saat membuat stiker, coba lagi!' 
            }, { quoted: message });
            console.error('❌ Error pada plugin stiker:', error);
        }
    }
};
