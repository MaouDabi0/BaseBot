const fs = require('fs');
const tokoPath = './toolkit/set/toko.json';

module.exports = {
  name: 'resettoko',
  command: ['resettoko'],
  tags: 'Shop Menu',
  desc: 'Mereset daftar toko di toko.json (hanya storeSetting)',

  run: async (conn, message, { isPrefix }) => {
    try {
      const chatId = message.key.remoteJid;
      const senderId = chatId.endsWith('@g.us') ? message.key.participant : chatId.replace(/\D/g, '');
      const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';

      if (!textMessage) return;

      const prefix = isPrefix.find(p => textMessage.startsWith(p));
      if (!prefix) return;

      const commandText = textMessage.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase();
      if (!module.exports.command.includes(commandText)) return;

      const config = require('../../toolkit/set/config.json');
      if (!config.ownerSetting.ownerNumber.includes(senderId.replace(/\D/g, ''))) {
        return conn.sendMessage(chatId, { text: "❌ Hanya owner yang dapat menggunakan perintah ini!" }, { quoted: message });
      }

      if (!fs.existsSync(tokoPath)) {
        return conn.sendMessage(chatId, { text: "❌ File toko.json tidak ditemukan." }, { quoted: message });
      }

      let tokoData = JSON.parse(fs.readFileSync(tokoPath, 'utf8'));
      tokoData.storeSetting = {};
      fs.writeFileSync(tokoPath, JSON.stringify(tokoData, null, 2));

      conn.sendMessage(chatId, { text: "✅ Semua toko telah direset!" }, { quoted: message });

    } catch (err) {
      console.error("❌ Error di plugin resettoko.js:", err);
      conn.sendMessage(chatId, { text: "❌ Terjadi kesalahan saat mereset toko." }, { quoted: message });
    }
  }
};