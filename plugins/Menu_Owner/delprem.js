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

const writeDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

module.exports = {
  name: 'DeletePremium',
  command: ['delprem', 'deletepremium'],
  tags: ['Owner Menu'],
  desc: 'Menghapus status premium dari pengguna.',

  run: async (conn, message, { isPrefix }) => {
    try {
      const chatId = message.key.remoteJid;
      const senderId = message.key.participant || chatId;
      const textMessage = message.message?.conversation ||
                          message.message?.extendedTextMessage?.text ||
                          '';

      if (!textMessage) return;

      const prefix = isPrefix.find((p) => textMessage.startsWith(p));
      if (!prefix) return;

      const args = textMessage.slice(prefix.length).trim().split(/\s+/);
      const commandText = args.shift()?.toLowerCase();
      if (!module.exports.command.includes(commandText)) return;

      if (!global.ownerNumber.includes(senderId.replace(/\D/g, ''))) {
        return conn.sendMessage(chatId, { text: 'Hanya owner yang dapat menggunakan perintah ini.' }, { quoted: message });
      }

      let targetNumber;
      if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
        targetNumber = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
      } else if (args.length > 0) {
        targetNumber = args[0].replace(/\D/g, '') + '@s.whatsapp.net';
      } else {
        return conn.sendMessage(chatId, {
          text: '⚠️ Masukkan nomor atau tag pengguna yang ingin dihapus dari premium!',
          quoted: message,
        });
      }

      const contactInfo = await conn.fetchStatus(targetNumber).catch(() => null);
      let targetName = contactInfo?.status || targetNumber.replace('@s.whatsapp.net', '');

      const db = readDB();

      const foundUser = Object.entries(db.Private).find(([name, data]) => data.Nomor === targetNumber);
      if (!foundUser) {
        return conn.sendMessage(chatId, {
          text: `⚠️ Pengguna *${targetName}* tidak ditemukan dalam daftar premium.`,
          quoted: message,
        });
      }

      const [storedName, userData] = foundUser;
      if (!userData.premium) {
        return conn.sendMessage(chatId, {
          text: `⚠️ Pengguna *${storedName}* tidak memiliki status premium.`,
          quoted: message,
        });
      }

      db.Private[storedName].premium = false;
      writeDB(db);

      conn.sendMessage(chatId, {
        text: `✅ Status premium *${storedName}* telah dihapus.`,
        quoted: message,
      });

    } catch (error) {
      conn.sendMessage(message.key.remoteJid, {
        text: `❌ Error: ${error.message || error}`,
        quoted: message,
      });
    }
  },
};