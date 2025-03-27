const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '../../toolkit/set/config.json');

module.exports = {
  name: 'getfile',
  command: ['getfile', 'gf'],
  tags: 'Owner Menu',
  desc: 'Menampilkan isi file dalam bentuk teks',

  run: async (conn, message, { isPrefix }) => {
    const chatId = message?.key?.remoteJid;
    const senderId = message.key.participant || chatId.replace(/:\d+@/, '@');
    const mtype = Object.keys(message.message || {})[0];
    const textMessage =
      (mtype === 'conversation' && message.message?.conversation) ||
      (mtype === 'extendedTextMessage' && message.message?.extendedTextMessage?.text) ||
      '';

    if (!textMessage) return;

    const prefix = isPrefix.find(p => textMessage.startsWith(p));
    if (!prefix) return;

    const args = textMessage.slice(prefix.length).trim().split(/\s+/);
    const commandText = args.shift()?.toLowerCase();
    if (!module.exports.command.includes(commandText)) return;

    let config;
    try {
      const configData = fs.readFileSync(configPath, 'utf-8');
      config = JSON.parse(configData);
    } catch (err) {
      console.error('Gagal membaca config:', err);
      return conn.sendMessage(chatId, { text: 'Gagal membaca config.json' }, { quoted: message });
    }

    if (!config.ownerSetting.ownerNumber.includes(senderId.replace(/\D/g, ''))) {
      return conn.sendMessage(chatId, { text: 'Hanya owner yang dapat menggunakan perintah ini' }, { quoted: message });
    }

    if (!args.length) {
      return conn.sendMessage(chatId, { text: '⚠️ Masukkan path file yang ingin diambil!' }, { quoted: message });
    }

    const baseDir = path.join(__dirname, '../../');
    const filePath = path.resolve(baseDir, args.join(' '));

    if (!filePath.startsWith(baseDir)) {
      return conn.sendMessage(chatId, { text: '⚠️ Akses file di luar direktori BaseBot tidak diizinkan!' }, { quoted: message });
    }

    if (!fs.existsSync(filePath) || fs.lstatSync(filePath).isDirectory()) {
      return conn.sendMessage(chatId, { text: '❌ File tidak ditemukan atau path adalah direktori!' }, { quoted: message });
    }

    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const filePathDisplay = filePath.replace(baseDir + '/', '');

      await conn.sendMessage(chatId, { text: `📄 *Path File:* ${filePathDisplay}` }, { quoted: message });

      const maxLength = 4000;
      for (let i = 0; i < fileContent.length; i += maxLength) {
        const chunk = fileContent.slice(i, i + maxLength);
        await conn.sendMessage(chatId, { text: chunk }, { quoted: message });
      }
    } catch (error) {
      console.error('Terjadi kesalahan saat membaca file:', error);
      conn.sendMessage(chatId, { text: '⚠️ Terjadi kesalahan saat membaca file!' }, { quoted: message });
    }
  }
};