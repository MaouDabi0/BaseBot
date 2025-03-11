const fs = require('fs');
const path = require('path');
const os = require('os');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
  name: 'setppgc',
  command: ['setppgc', 'setfotogc'],
  tags: 'Group Menu',
  desc: 'Mengatur foto profil group',

  run: async (conn, message, { isPrefix }) => {
    const chatId = message.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    const senderId = isGroup ? message.key.participant : chatId.replace(/:\d+@/, '@');

    const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
    if (!textMessage) return;

    const prefix = isPrefix.find(p => textMessage.startsWith(p));
    if (!prefix) return;

    const args = textMessage.slice(prefix.length).trim().split(/\s+/);
    const commandText = args.shift().toLowerCase();

    if (!module.exports.command.includes(commandText)) return;

    if (!isGroup) {
      return conn.sendMessage(chatId, { text: '⚠️ Perintah ini hanya bisa digunakan dalam grup!' }, { quoted: message });
    }

    const groupMetadata = await conn.groupMetadata(chatId);
    const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';
    const isBotAdmin = groupMetadata.participants.some(p => p.id === botNumber && p.admin);
    const isUserAdmin = groupMetadata.participants.some(p => p.id === senderId && p.admin);

    if (!isUserAdmin) {
      return conn.sendMessage(chatId, { text: '❌ Hanya admin grup yang bisa menggunakan perintah ini!' }, { quoted: message });
    }

    if (!isBotAdmin) {
      return conn.sendMessage(chatId, { text: '❌ Bot harus menjadi admin untuk mengubah foto grup!' }, { quoted: message });
    }

    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted || !quoted.imageMessage) {
      return conn.sendMessage(chatId, { text: '⚠️ Balas gambar dengan perintah *setppgc* untuk mengubah foto grup.' }, { quoted: message });
    }

    try {
      const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      if (!buffer.length) {
        throw new Error('Gagal mengunduh gambar.');
      }

      const tempFilePath = path.join(os.tmpdir(), `group-profile-${chatId}.jpg`);
      fs.writeFileSync(tempFilePath, buffer);

      await conn.updateProfilePicture(chatId, { url: tempFilePath });

      fs.unlinkSync(tempFilePath);

      conn.sendMessage(chatId, { text: '✅ Foto profil grup berhasil diperbarui!' }, { quoted: message });
    } catch (err) {
      console.error(err);
      conn.sendMessage(chatId, { text: '❌ Gagal mengubah foto grup. Pastikan gambar yang dikirim tidak bermasalah.' }, { quoted: message });
    }
  }
};