const fs = require('fs');
const path = require('path');

const welcomeFile = path.join(__dirname, '../../toolkit/db/welcome.json');

if (!fs.existsSync(welcomeFile)) {
  fs.writeFileSync(welcomeFile, JSON.stringify({}, null, 2));
}

const getWelcomeStatus = (chatId) => {
  let data = JSON.parse(fs.readFileSync(welcomeFile));
  return data[chatId] || false;
};

const setWelcomeStatus = (chatId, status) => {
  let data = JSON.parse(fs.readFileSync(welcomeFile));
  data[chatId] = status;
  fs.writeFileSync(welcomeFile, JSON.stringify(data, null, 2));
};

module.exports = {
  name: 'welcome',
  command: ['welcome'],
  tags: ['Group Menu'],
  desc: 'Menyapa member yang baru gabung',

  run: async (conn, message, { isPrefix }) => {
    const chatId = message.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    const senderId = isGroup ? message.key.participant : chatId.replace(/\D/g, '');

    const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
    const prefix = isPrefix.find(p => textMessage.startsWith(p));
    if (!prefix) return;

    const args = textMessage.slice(prefix.length).trim().split(/\s+/);
    const commandText = args.shift().toLowerCase();

    if (!module.exports.command.includes(commandText)) return;

    if (!isGroup) return conn.sendMessage(chatId, { text: "❌ Perintah ini hanya bisa digunakan di dalam grup!" });

    const groupMetadata = await conn.groupMetadata(chatId);
    const admins = groupMetadata.participants.filter(participant => participant.admin);
    const isAdmin = admins.some(admin => admin.id.includes(senderId));

    if (!isAdmin) return conn.sendMessage(chatId, { text: "❌ Perintah ini hanya bisa digunakan oleh admin grup!" });

    if (args[0] === "on") {
      setWelcomeStatus(chatId, true);
      return conn.sendMessage(chatId, { text: "✅ Fitur welcome diaktifkan!" });
    } else if (args[0] === "off") {
      setWelcomeStatus(chatId, false);
      return conn.sendMessage(chatId, { text: "❌ Fitur welcome dinonaktifkan!" });
    } else {
      return conn.sendMessage(chatId, {
        text: `⚙️ Penggunaan:\n${prefix}welcome on → Aktifkan welcome\n${prefix}welcome off → Nonaktifkan welcome`
      });
    }
  }
};