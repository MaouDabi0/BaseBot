const fs = require('fs');
const tokoPath = './toolkit/set/toko.json';

module.exports = {
  name: 'listtoko',
  command: ['listtoko', 'daftartoko'],
  tags: 'Info Menu',
  desc: 'Menampilkan daftar toko yang terdaftar',

  run: async (conn, message, { args, isPrefix }) => {
    try {
      const chatId = message.key.remoteJid;
      const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';

      if (!textMessage) return;

      const prefix = isPrefix.find(p => textMessage.startsWith(p));
      if (!prefix) return;

      const commandText = textMessage.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase();
      if (!module.exports.command.includes(commandText)) return;

      if (!fs.existsSync(tokoPath)) {
        return conn.sendMessage(chatId, { text: "❌ File toko.json tidak ditemukan." }, { quoted: message });
      }

      const tokoData = JSON.parse(fs.readFileSync(tokoPath, 'utf8'));
      const tokoList = Object.keys(tokoData.storeSetting);

      if (!tokoData.storeSetting || tokoList.length === 0) {
        return conn.sendMessage(chatId, { text: "⚠️ Belum ada toko yang terdaftar." }, { quoted: message });
      }

      if (args.length > 0) {
        const index = parseInt(args[0]) - 1;
        if (isNaN(index) || index < 0 || index >= tokoList.length) {
          return conn.sendMessage(chatId, { text: "❌ Nomor toko tidak valid!" }, { quoted: message });
        }
        return conn.sendMessage(chatId, { text: `📍 *${tokoList[index]}* adalah toko nomor ${args[0]}.` }, { quoted: message });
      }

      const listToko = tokoList.map((toko, index) => `📍 ${index + 1}. *${toko}*`).join('\n');

      conn.sendMessage(chatId, {
        text: `📜 *Daftar Toko yang Terdaftar*\n\n${listToko}\n\nGunakan *${prefix}listtoko <nomor>* untuk melihat toko tertentu.`,
      }, { quoted: message });

    } catch (err) {
      console.error("❌ Error di plugin listtoko.js:", err);
      conn.sendMessage(chatId, { text: "❌ Terjadi kesalahan, coba lagi nanti." }, { quoted: message });
    }
  }
};