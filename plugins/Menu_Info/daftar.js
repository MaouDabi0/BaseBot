const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'daftar',
  command: ['daftar', 'register'],
  tags: 'Info Menu',
  desc: 'Mendaftarkan pengguna ke dalam database bot.',

  run: async (conn, message, { isPrefix }) => {
    try {
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

      const dbPath = path.join(__dirname, '../../toolkit/db/database.json');

      if (!fs.existsSync(dbPath)) {
        fs.writeFileSync(dbPath, JSON.stringify({ Private: {} }, null, 2));
      }

      let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

      if (!db.Private || typeof db.Private !== 'object') {
        db.Private = {};
      }

      if (args.length < 2) {
        return conn.sendMessage(chatId, {
          text: `📌 Cara daftar:\n\n*${prefix}daftar Nama Kamu Umur*\n\nContoh:\n*${prefix}daftar Andi 15*`,
        });
      }

      const nama = args.slice(0, -1).join(' ');
      const umur = parseInt(args[args.length - 1]);

      if (isNaN(umur) || umur < 12 || umur > 100) {
        return conn.sendMessage(chatId, {
          text: `❌ ️Maaf, umur kamu terlalu kecil untuk mendaftar.`,
        });
      }

      if (umur < 12) {
        return conn.sendMessage(chatId, {
          text: `⚠️ Maaf, umur kamu terlalu kecil untuk mendaftar.`,
        });
      }

      if (db.Private[nama]) {
        return conn.sendMessage(chatId, {
          text: `❌ Nama *${nama}* sudah terdaftar!\n\nGunakan nama lain atau cek profil dengan *${prefix}profile*.`,
        });
      }

      db.Private[nama] = {
        Nomor: senderId,
        umur: umur.toString(),
        autoai: false,
        chat: 0,
        premium: {},
      };

      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

      conn.sendMessage(chatId, {
        text: `✅ Pendaftaran berhasil!\n\n🔹 Nama: *${nama}*\n🔹 Umur: *${umur}*\n\nKetik *${prefix}profile* untuk melihat profilmu.`,
        contextInfo: { mentionedJid: [senderId] },
      });
    } catch (error) {
      console.error('Error di plugin daftar.js:', error);
      conn.sendMessage(chatId, { text: '⚠️ Terjadi kesalahan saat mendaftar!' });
    }
  },
};