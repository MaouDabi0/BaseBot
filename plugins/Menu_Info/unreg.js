const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'unreg',
  command: ['unreg', 'hapusakun'],
  tags: 'Info Menu',
  desc: 'Menghapus akun dari database bot.',

  run: async (conn, message, { isPrefix }) => {
    try {
      const chatId = message.key.remoteJid;
      const textMessage =
        message.message?.conversation || message.message?.extendedTextMessage?.text || '';

      if (!textMessage) return;

      const prefix = isPrefix.find((p) => textMessage.startsWith(p));
      if (!prefix) return;

      const args = textMessage.slice(prefix.length).trim().split(/\s+/);
      const commandText = args.shift().toLowerCase();
      if (!module.exports.command.includes(commandText)) return;

      if (args.length < 1) {
        return conn.sendMessage(chatId, {
          text: `📌 Cara unreg:\n\n*${prefix}unreg <noId>*\n\nContoh:\n*${prefix}unreg bcdfghx72*\n _.me untuk melihat Nomor Id_`,
        }, { quoted: message });
      }

      const noIdInput = args[0];
      const dbPath = path.join(__dirname, '../../toolkit/db/database.json');

      if (!fs.existsSync(dbPath)) {
        return conn.sendMessage(chatId, { text: '⚠️ Database tidak ditemukan!' }, { quoted: message });
      }

      let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

      if (!db.Private || typeof db.Private !== 'object') {
        return conn.sendMessage(chatId, { text: '⚠️ Database pengguna kosong!' }, { quoted: message });
      }

      let foundUser = null;

      for (const [nama, data] of Object.entries(db.Private)) {
        if (data.noId === noIdInput) {
          if (data.Nomor === chatId) {
            foundUser = nama;
          }
          break;
        }
      }

      if (!foundUser) {
        return conn.sendMessage(chatId, {
          text: `❌ NoId *${noIdInput}* tidak ditemukan atau tidak sesuai dengan akun Anda!`,
        }, { quoted: message });
      }

      delete db.Private[foundUser];
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

      conn.sendMessage(chatId, {
        text: `✅ Akun dengan NoId *${noIdInput}* berhasil dihapus dari database.\nTerima kasih telah menggunakan bot ini!`,
      }, { quoted: message });

    } catch (error) {
      console.error('Error di plugin unreg.js:', error);
      conn.sendMessage(chatId, { text: '⚠️ Terjadi kesalahan saat menghapus akun!' }, { quoted: message });
    }
  },
};