const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'listprem',
  command: ['listprem', 'listpremium'],
  tags: 'Info Menu',
  desc: 'Menampilkan daftar pengguna premium.',

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

      const args = textMessage.slice(prefix.length).trim().split(/\s+/).slice(1);
      const commandText = textMessage.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase();
      if (!module.exports.command.includes(commandText)) return;

      if (!global.ownerNumber.includes(senderId.replace(/\D/g, ''))) {
        return conn.sendMessage(chatId, {
          text: '❌ Hanya owner yang dapat menggunakan perintah ini.',
        }, { quoted: message });
      }

      const dbPath = path.join(__dirname, '../../toolkit/db/database.json');
      if (!fs.existsSync(dbPath)) {
        return conn.sendMessage(chatId, { text: '⚠️ Database tidak ditemukan!' }, { quoted: message });
      }

      let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

      if (!db.Private || typeof db.Private !== 'object') {
        return conn.sendMessage(chatId, { text: '⚠️ Database Private tidak valid!' }, { quoted: message });
      }

      const premiumUsers = Object.entries(db.Private)
        .filter(([_, data]) => data.premium?.prem === true)
        .map(([name, data]) => ({
          name,
          number: data.Nomor,
          time: data.premium.time,
        }));

      if (premiumUsers.length === 0) {
        return conn.sendMessage(chatId, { text: '📌 Saat ini tidak ada pengguna premium.' }, { quoted: message });
      }

      let text = `📌 *Daftar Pengguna Premium*\n\n`;
      premiumUsers.forEach((user, index) => {
        const remainingTime = user.time > 0
          ? `${Math.floor(user.time / 3600000)} jam ${Math.floor((user.time % 3600000) / 60000)} menit`
          : 'Expired';
        text += `*${index + 1}.* ${user.name} - wa.me/${user.number.replace('@s.whatsapp.net', '')}\n`;
        text += `    ⏳ *Sisa Waktu:* ${remainingTime}\n\n`;
      });

      text += `Total: ${premiumUsers.length} pengguna premium.`;

      conn.sendMessage(chatId, { text }, { quoted: message });
    } catch (error) {
      console.error('Error di plugin listprem.js:', error);
      conn.sendMessage(chatId, {
        text: `❌ Terjadi kesalahan saat menampilkan daftar pengguna premium.`,
      }, { quoted: message });
    }
  },
};