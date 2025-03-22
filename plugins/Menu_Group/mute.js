const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../../toolkit/db/database.json');

const readDB = () => {
  if (!fs.existsSync(dbPath)) return { Private: {}, Grup: {} };

  try {
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error membaca database:', error);
    return { Private: {}, Grup: {} };
  }
};

const writeDB = (data) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error menyimpan database:', error);
  }
};

module.exports = {
  name: 'mute',
  command: ['mute'],
  tags: 'Group Menu',
  desc: 'Aktifkan atau nonaktifkan mode mute di grup dengan .mute on/off',

  run: async (conn, message, { isPrefix, args }) => {
    try {
      const chatId = message.key.remoteJid;
      const isGroup = chatId.endsWith('@g.us');
      const senderId = isGroup ? message.key.participant : chatId.replace(/:\d+@/, "@");
      const textMessage =
        message.message?.conversation || message.message?.extendedTextMessage?.text || "";

      if (!textMessage) return;

      const prefix = isPrefix.find((p) => textMessage.startsWith(p));
      if (!prefix) return;

      const commandText = textMessage.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase();
      args = textMessage.slice(prefix.length).trim().split(/\s+/).slice(1);
      if (!module.exports.command.includes(commandText)) return;

      if (!isGroup) {
        return conn.sendMessage(chatId, { text: '❗ Perintah ini hanya bisa digunakan di grup.' }, { quoted: message });
      }

      const normalizedSenderId = senderId.replace(/:\d+@/, '@');
      const groupMetadata = await conn.groupMetadata(chatId);
      const groupName = groupMetadata?.subject || `Group_${chatId}`;

      const db = readDB();

      const groupData = Object.values(db.Grup).find((g) => g.Id === chatId);

      if (!groupData) {
        db.Grup[groupName] = {
          Id: chatId,
          mute: false,
          Welcome: { welcome: false, welcomeText: '' },
          autoai: false,
          chat: 0,
        };
        writeDB(db);
      }

      const currentGroup = Object.values(db.Grup).find((g) => g.Id === chatId);

      const groupAdmins = groupMetadata.participants
        .filter((p) => p.admin !== null)
        .map((admin) => admin.id.replace(/:\d+@/, '@'));

      const isAdmin = groupAdmins.includes(normalizedSenderId);
      if (!isAdmin) {
        return conn.sendMessage(chatId, { text: '❗ Hanya admin yang dapat menggunakan perintah ini.' }, { quoted: message });
      }

      const action = args[0]?.toLowerCase();

      if (action === 'on') {
        if (currentGroup.mute) {
          return conn.sendMessage(chatId, { text: '⚠️ Mode mute sudah aktif di grup ini.' }, { quoted: message });
        }
        currentGroup.mute = true;
        writeDB(db);
        return conn.sendMessage(chatId, {
          text: '✅ Mode mute berhasil diaktifkan. Hanya admin yang dapat menggunakan bot.',
        }, { quoted: message });
      }

      if (action === 'off') {
        if (!currentGroup.mute) {
          return conn.sendMessage(chatId, { text: '⚠️ Mode mute tidak aktif di grup ini.' }, { quoted: message });
        }
        currentGroup.mute = false;
        writeDB(db);
        return conn.sendMessage(chatId, {
          text: '✅ Mode mute berhasil dinonaktifkan. Semua member dapat menggunakan bot.',
        }, { quoted: message });
      }

      conn.sendMessage(chatId, {
        text: `❗ Penggunaan yang benar:\n${isPrefix[0]}mute on - Aktifkan mode mute\n${isPrefix[0]}mute off - Nonaktifkan mode mute`,
      }, { quoted: message });
    } catch (error) {
      console.error('Error di plugin mute.js:', error);
      conn.sendMessage(message.key.remoteJid, {
        text: `❗ Terjadi kesalahan saat menjalankan perintah.`,
      }, { quoted: message });
    }
  },
};