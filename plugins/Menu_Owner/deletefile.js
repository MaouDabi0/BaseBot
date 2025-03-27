const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'deletefile',
  command: ['deletefile', 'df'],
  tags: 'Owner Menu',
  desc: 'Menghapus file/folder',

  run: async (conn, message, { isPrefix }) => {
    const chatId = message?.key?.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    const senderId = isGroup ? message.key.participant : chatId;
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

    if (!global.ownerNumber.includes(senderId.replace(/\D/g, ''))) {
      return conn.sendMessage(chatId, { text: 'Hanya owner yang dapat menggunakan perintah ini' }, { quoted: message });
    }

    if (!args[0]) return conn.sendMessage(chatId, { text: '⚠️ Masukkan nama file yang ingin dihapus!' }, { quoted: message });

    const baseDir = path.join(__dirname, '../../');
    const fileName = args[0];
    const filePath = path.join(baseDir, fileName);

    console.log(`Mencoba menghapus file di path: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      console.error(`File tidak ditemukan di path: ${filePath}`);
      return conn.sendMessage(chatId, { text: '❌ File tidak ditemukan!' }, { quoted: message });
    }
    
    try {
      fs.unlinkSync(filePath);
      conn.sendMessage(chatId, { text: `✅ File *${fileName}* berhasil dihapus!` }, { quoted: message });
    } catch (error) {
      console.error(error);
      conn.sendMessage(chatId, { text: '⚠️ Terjadi kesalahan saat menghapus file!' }, { quoted: message });
    }
  }
};