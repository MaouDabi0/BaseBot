const { createSticker } = require('../../toolkit/helper');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {
  name: 'stiker',
  command: ['s', 'stiker', 'sticker'],
  tags: 'Tools Menu',
  desc: 'Membuat sticker',

  run: async (conn, message, { isPrefix }) => {
    try {
      const messageText =
        message.body ||
        message.message?.conversation ||
        message.message?.extendedTextMessage?.text ||
        message.message?.imageMessage?.caption ||
        message.message?.videoMessage?.caption ||
        '';

      if (!messageText) return;

      const prefix = isPrefix.find(p => messageText.startsWith(p));
      if (!prefix) return;

      const commandText = messageText.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase();
      if (!module.exports.command.includes(commandText)) return;

      const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const isImage = quotedMessage?.imageMessage || message.message?.imageMessage;
      const isVideo = quotedMessage?.videoMessage || message.message?.videoMessage;

      if (!isImage && !isVideo) {
        return conn.sendMessage(
          message.key.remoteJid,
          {
            text: `Balas gambar/video dengan caption *${prefix}s*, *${prefix}stiker*, atau *${prefix}sticker* ` +
                  `atau kirim langsung media dengan caption yang sama!`,
          },
          { quoted: message }
        );
      }

      let media;
      try {
        media = await downloadMediaMessage({ message: quotedMessage || message.message }, 'buffer', {});
        if (!media) throw new Error('Media tidak terunduh!');
      } catch (error) {
        return conn.sendMessage(
          message.key.remoteJid,
          { text: `❌ Gagal mengunduh media! ${error.message}` },
          { quoted: message }
        );
      }

      let sticker;
      try {
        sticker = await createSticker(media, isVideo);
        if (!sticker) throw new Error('Stiker tidak berhasil dibuat!');
      } catch (error) {
        return conn.sendMessage(
          message.key.remoteJid,
          { text: `❌ Gagal membuat stiker! ${error.message}` },
          { quoted: message }
        );
      }

      await conn.sendMessage(message.key.remoteJid, { sticker }, { quoted: message });
    } catch (error) {
      conn.sendMessage(
        message.key.remoteJid,
        { text: `❌ Terjadi kesalahan saat membuat stiker, coba lagi! ${error.message}` },
        { quoted: message }
      );
      console.error('❌ Error pada plugin stiker:', error);
    }
  },
};