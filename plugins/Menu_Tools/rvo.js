const fs = require('fs');
const path = require('path');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {
  name: 'rvo',
  command: ['rvo', 'readviewonce'],
  tags: 'Tools Menu',
  desc: 'Mengekstrak media sekali lihat (foto, video, audio) dari pesan yang dibalas',

  run: async (conn, message, { isPrefix }) => {
    const chatId = message.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    const senderId = isGroup ? message.key.participant : chatId.replace(/:\d+@/, '@');
    const textMessage =
      message.message?.conversation || message.message?.extendedTextMessage?.text || '';

    if (!textMessage) return;

    const prefix = isPrefix.find((p) => textMessage.startsWith(p));
    if (!prefix) return;

    const args = textMessage.slice(prefix.length).trim().split(/\s+/);
    const commandText = args.shift().toLowerCase();
    if (!module.exports.command.includes(commandText)) return;

    const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quotedMsg) {
      return conn.sendMessage(chatId, { text: 'Balas ke media (View Once atau biasa) yang mau diambil.' }, { quoted: message });
    }

    let viewOnce = 
      quotedMsg?.viewOnceMessageV2Extension?.message ||
      quotedMsg?.viewOnceMessageV2?.message ||
      quotedMsg?.viewOnceMessage?.message ||
      quotedMsg;

    let mediaType, mediaMessage;

    if (viewOnce?.imageMessage) {
      mediaType = 'image';
      mediaMessage = viewOnce.imageMessage;
    } else if (viewOnce?.videoMessage) {
      mediaType = 'video';
      mediaMessage = viewOnce.videoMessage;
    } else if (viewOnce?.audioMessage) {
      mediaType = 'audio';
      mediaMessage = viewOnce.audioMessage;
    } else {
      return conn.sendMessage(chatId, { text: 'Media tidak didukung untuk diekstrak.' }, { quoted: message });
    }

    const buffer = await downloadMediaMessage(
      { message: { [`${mediaType}Message`]: mediaMessage } },
      'buffer',
      {},
      { logger: conn.logger, reuploadRequest: conn.updateMediaMessage }
    );

    if (!buffer) {
      return conn.sendMessage(chatId, { text: 'Gagal mengunduh media.' }, { quoted: message });
    }

    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const filename = path.join(tempDir, `${Date.now()}.${mediaType === 'image' ? 'jpg' : mediaType === 'video' ? 'mp4' : 'mp3'}`);
    fs.writeFileSync(filename, buffer);

    const caption = mediaMessage.caption || '';

    await conn.sendMessage(chatId, {
      [mediaType]: { url: filename },
      caption: caption ? `*Pesan:* ${caption}` : 'Media berhasil diambil.',
    }, { quoted: message });
  }
};