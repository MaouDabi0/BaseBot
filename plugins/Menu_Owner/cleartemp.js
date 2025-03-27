const fs = require('fs');
const path = require('path');
const config = require('../../toolkit/set/config.json');

module.exports = {
  name: 'cleartemp',
  command: ['cleartemp', 'ctemp'],
  tags: 'Owner Menu',
  desc: 'Membersihkan folder temp',

  run: async (conn, message, { isPrefix }) => {
    const chatId = message.key.remoteJid;
    const senderId = chatId.endsWith('@g.us') ? message.key.participant : chatId.replace(/\D/g, '');
    const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';

    if (!textMessage) return;

    const prefix = isPrefix.find(p => textMessage.startsWith(p));
    if (!prefix) return;

    const args = textMessage.slice(prefix.length).trim().split(/\s+/);
    const commandText = args.shift().toLowerCase();

    if (!module.exports.command.includes(commandText)) return;

    if (!global.ownerNumber.includes(senderId.replace(/\D/g, ''))) {
      return conn.sendMessage(chatId, { text: 'Hanya owner yang dapat menggunakan perintah ini' }, { quoted: message });
    }

    const tempDir = path.join(__dirname, '../../temp');

    if (!fs.existsSync(tempDir)) {
      return conn.sendMessage(chatId, { text: '📂 Folder temp tidak ditemukan.' }, { quoted: message });
    }

    try {
      const files = fs.readdirSync(tempDir);
      if (files.length === 0) {
        return conn.sendMessage(chatId, { text: '✅ Folder temp sudah bersih.' }, { quoted: message });
      }

      files.forEach(file => {
        const filePath = path.join(tempDir, file);
        fs.rmSync(filePath, { recursive: true, force: true });
      });

      return conn.sendMessage(chatId, { text: '✅ Semua file dalam folder temp berhasil dihapus.' }, { quoted: message });
    } catch (err) {
      console.error(err);
      return conn.sendMessage(chatId, { text: '❌ Gagal membersihkan folder temp.' }, { quoted: message });
    }
  }
};