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
          text: `📌 Cara daftar:\n\n*${prefix}daftar Nama Kamu Umur*\n\nContoh:\n*${prefix}daftar Andi 15*` }, { quoted: message });
      }

      const nama = args.slice(0, -1).join(' ');
      const umur = parseInt(args[args.length - 1]);

      if (isNaN(umur) || umur < 12 || umur > 100) {
        return conn.sendMessage(chatId, {
          text: `❌ ️Maaf, umur kamu terlalu kecil untuk mendaftar.` }, { quoted: message });
      }

      if (umur < 12) {
        return conn.sendMessage(chatId, {
          text: `⚠️ Maaf, umur kamu terlalu kecil untuk mendaftar.` }, { quoted: message });
      }

      if (db.Private[nama]) {
        return conn.sendMessage(chatId, {
          text: `❌ Nama *${nama}* sudah terdaftar!\n\nGunakan nama lain atau cek profil dengan *${prefix}profile*.` }, { quoted: message });
      }

      function generateRandomId() {
        const chars = 'abcdefghijklmnopqrstuvwxyz';
        let randomId = '';
        for (let i = 0; i < 7; i++) {
          randomId += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        randomId += Math.floor(Math.random() * 100) + 1;
        return randomId;
      }

      db.Private[nama] = {
        Nomor: senderId,
        umur: umur.toString(),
        noId: generateRandomId(),
        autoai: false,
        chat: 0,
        premium: {
          prem: false,
          time: 0,
        },
      };

      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

      conn.sendMessage(chatId, {
        text: `✅ Pendaftaran berhasil!\n\n🔹 Nama: *${nama}*\n🔹 Umur: *${umur}*\n🔹 ID: *${db.Private[nama].noId}*\n\nKetik *${prefix}profile* untuk melihat profilmu.`,
        contextInfo: { mentionedJid: [senderId] } }, { quoted: message });
    } catch (error) {
      console.error('Error di plugin daftar.js:', error);
      conn.sendMessage(chatId, { text: '⚠️ Terjadi kesalahan saat mendaftar!' }, { quoted: message });
    }
  },
};