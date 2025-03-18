const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../../toolkit/db/database.json');

const readDB = () => {
  if (!fs.existsSync(dbPath)) return { Private: {}, Grup: {} };

  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return data ? JSON.parse(data) : { Private: {}, Grup: {} };
  } catch (error) {
    console.error('Error membaca database:', error);
    return { Private: {}, Grup: {} };
  }
};

module.exports = {
  name: 'ListPremium',
  command: ['listprem', 'listpremium'],
  tags: ['Owner Menu'],
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
        return conn.sendMessage(chatId, { text: '❌ Hanya owner yang dapat menggunakan perintah ini.', quoted: message });
      }

      const db = readDB();

      const premiumUsers = Object.entries(db.Private)
        .filter(([_, data]) => data.premium === true)
        .map(([name, data]) => ({ name, number: data.Nomor }));

      if (premiumUsers.length === 0) {
        return conn.sendMessage(chatId, { text: '📌 Saat ini tidak ada pengguna premium.', quoted: message });
      }

      let text = `📌 *Daftar Pengguna Premium*\n\n`;
      premiumUsers.forEach((user, index) => {
        text += `*${index + 1}.* ${user.name} - wa.me/${user.number.replace('@s.whatsapp.net', '')}\n`;
      });
      text += `\nTotal: ${premiumUsers.length} pengguna premium.`;

      conn.sendMessage(chatId, { text, quoted: message });
    } catch (error) {
      conn.sendMessage(chatId, { text: `❌ Error: ${error.message || error}`, quoted: message });
    }
  },
};