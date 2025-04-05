const fs = require('fs');
const path = require('path');

const dbFile = path.join(__dirname, '../../toolkit/db/database.json');

if (!fs.existsSync(dbFile)) {
  fs.writeFileSync(dbFile, JSON.stringify({ Grup: {} }, null, 2));
}

const readDB = () => {
  let data = fs.readFileSync(dbFile, 'utf-8');
  return data ? JSON.parse(data) : { Grup: {} };
};

const saveDB = (data) => {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
};

const getWelcomeStatus = (chatId) => {
  let db = readDB();
  let groupData = Object.values(db.Grup || {}).find(group => group.Id === chatId);
  return groupData?.Welcome?.welcome || false;
};

const getWelcomeText = (chatId) => {
  let db = readDB();
  let groupData = Object.values(db.Grup || {}).find(group => group.Id === chatId);

  // Ambil teks tanpa merusak newline
  return groupData?.Welcome?.welcomeText || "👋 Selamat datang @user di grup!";
};

const setWelcomeSettings = (chatId, groupName, status, text) => {
  let db = readDB();
  db.Grup = db.Grup || {};

  db.Grup[groupName] = db.Grup[groupName] || { Id: chatId, Welcome: { welcome: false, welcomeText: "" } };

  db.Grup[groupName].Welcome.welcome = status;
  if (text) db.Grup[groupName].Welcome.welcomeText = text; // Simpan langsung tanpa manipulasi

  saveDB(db);
};

module.exports = {
  name: 'welcome',
  command: ['welcome'],
  tags: 'Group Menu',
  desc: 'Mengatur fitur welcome di grup',

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
    if (!isGroup) return conn.sendMessage(chatId, { text: "❌ Perintah ini hanya bisa digunakan di dalam grup!" }, { quoted: message });

    const groupMetadata = await conn.groupMetadata(chatId);
    const groupName = groupMetadata.subject;
    const admins = groupMetadata.participants.filter(participant => participant.admin);
    const isAdmin = admins.some(admin => admin.id.includes(senderId));

    if (!isAdmin) return conn.sendMessage(chatId, { text: "❌ Perintah ini hanya bisa digunakan oleh admin grup!" }, { quoted: message });

    if (args[0] === "on") {
      setWelcomeSettings(chatId, groupName, true);
      return conn.sendMessage(chatId, { text: "✅ Fitur welcome diaktifkan!" }, { quoted: message });

    } else if (args[0] === "off") {
      setWelcomeSettings(chatId, groupName, false);
      return conn.sendMessage(chatId, { text: "❌ Fitur welcome dinonaktifkan!" }, { quoted: message });

    } else if (args[0] === "set") {
      let welcomeText = textMessage.replace(`${prefix}welcome set`, "").trim(); // Ambil teks setelah "set"
      if (!welcomeText) return conn.sendMessage(chatId, { text: "⚠️ Gunakan perintah:\n.welcome set <teks selamat datang>" }, { quoted: message });

      setWelcomeSettings(chatId, groupName, true, welcomeText);
      return conn.sendMessage(chatId, { text: `✅ Pesan selamat datang diperbarui:\n\n${welcomeText}` }, { quoted: message });

    } else {
      return conn.sendMessage(chatId, {
        text: `⚙️ Penggunaan:\n${prefix}welcome on → Aktifkan welcome\n${prefix}welcome off → Nonaktifkan welcome\n${prefix}welcome set <teks> → Atur teks welcome`
      }, { quoted: message });
    }
  }
};