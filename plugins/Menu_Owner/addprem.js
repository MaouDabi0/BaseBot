const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../../toolkit/db/database.json');

const readDB = () => {
  if (!fs.existsSync(dbPath)) return { Private: {}, Grup: {} };
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
};

const writeDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

module.exports = {
  name: 'AddPremium',
  command: ['addprem'],
  tags: ['Owner Menu'],
  desc: 'Menambahkan pengguna ke daftar premium (Hanya Owner).',

  run: async (conn, message, { isPrefix }) => {
    try {
      const chatId = message?.key?.remoteJid;
      const senderId = message?.key?.participant || chatId;
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
      let targetName;

      if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
        targetNumber = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
      } else if (args[0]) {
        targetNumber = args[0].replace(/\D/g, '') + '@s.whatsapp.net';
      } else {
        return conn.sendMessage(chatId, {
          text: '⚠️ Harap tag, reply, atau ketik nomor pengguna yang ingin dijadikan premium.',
          quoted: message,
        });
      }

      // Ambil pushName pengguna
      const contactInfo = await conn.fetchStatus(targetNumber).catch(() => null);
      targetName = contactInfo?.status || targetNumber.split('@')[0];

      const db = readDB();

      // Cek apakah nomor sudah ada di database
      let existingUser = Object.keys(db.Private).find(key => db.Private[key].Nomor === targetNumber);

      if (existingUser) {
        targetName = existingUser;
      } else {
        db.Private[targetName] = {
          Nomor: targetNumber,
          autoai: false,
          chat: 0,
          premium: false
        };
      }

      if (db.Private[targetName].premium) {
        return conn.sendMessage(chatId, {
          text: `✅ Pengguna *${targetName}* sudah memiliki status premium.`,
          quoted: message,
        });
      }

      db.Private[targetName].premium = true;
      writeDB(db);

      conn.sendMessage(chatId, {
        text: `🎉 Pengguna *${targetName}* telah ditambahkan ke daftar premium.`,
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