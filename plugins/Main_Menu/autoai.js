const fs = require('fs');
const path = require('path');
const axios = require('axios');

const dbPath = path.join(__dirname, '../../toolkit/db/database.json');

const readDB = () => {
  if (!fs.existsSync(dbPath)) return { Grup: {}, Private: {} };
  try {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (error) {
    return { Grup: {}, Private: {} };
  }
};

const writeDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

module.exports = {
  name: 'autoai',
  command: ['ai', 'autoai'],
  tags: 'Ai Menu',
  desc: 'Mengaktifkan atau menonaktifkan AI pada chat tertentu.',

  run: async (conn, message, { isPrefix }) => {
    try {
      const chatId = message?.key?.remoteJid;
      const isGroup = chatId.endsWith('@g.us');
      const senderId = isGroup ? message.key.participant : chatId;

      let db = readDB();
      let chatData;

      if (isGroup) {
        const metadata = await conn.groupMetadata(chatId);
        const groupName = metadata?.subject || `Group_${chatId}`;

        if (!db.Grup) db.Grup = {};
        if (!db.Grup[groupName]) {
          db.Grup[groupName] = {
            Id: chatId,
            Welcome: { welcome: false, welcomeText: '' },
            autoai: false,
            chat: 0
          };
        }

        chatData = db.Grup[groupName];
      } else {
        const senderName = message.pushName || senderId.split('@')[0];

        if (!db.Private) db.Private = {};
        if (!db.Private[senderName]) {
          db.Private[senderName] = {
            Nomor: senderId,
            autoai: false,
            chat: 0
          };
        }

        chatData = db.Private[senderName];
      }

      const mtype = Object.keys(message.message || {})[0];
      const textMessage =
        (mtype === 'conversation' && message.message?.conversation) ||
        (mtype === 'extendedTextMessage' && message.message?.extendedTextMessage?.text) ||
        '';

      if (!textMessage) return;

      const prefix = isPrefix.find((p) => textMessage.startsWith(p));

      if (!prefix) {
        if (chatData.autoai) {
          const isBotMentioned =
            message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.includes(conn.user.id) ||
            message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation;

          const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
          const isReplyingToBot = quotedMsg && quotedMsg?.conversation && message.message?.extendedTextMessage?.contextInfo?.participant === conn.user.id;

          if (isBotMentioned || isReplyingToBot) {
            const senderName = message.pushName || senderId.split('@')[0];
            const today = new Date();
            const hari = today.toLocaleString('id-ID', { weekday: 'long' });
            const jam = today.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            const tgl = today.toLocaleDateString('id-ID');

            const prompt = global.logic.replace("${ownerName}", global.ownerName).replace("${senderName}", senderName);

            const requestData = {
              content: textMessage,
              user: senderId,
              prompt: prompt,
            };

            try {
              const response = (await axios.post('https://luminai.my.id', requestData)).data.result;

              chatData.chat += 1;
              writeDB(db);

              return conn.sendMessage(chatId, { text: response }, { quoted: message });
            } catch (error) {
              console.error('Error fetching AI response:', error);
              await conn.sendMessage(chatId, { text: 'Maaf, terjadi kesalahan saat menghubungi AI!' }, { quoted: message });
            }
          }
        }
        return;
      }

      const args = textMessage.slice(prefix.length).trim().split(/\s+/);
      const commandText = args.shift()?.toLowerCase();
      if (!module.exports.command.includes(commandText)) return;

      if (args.length === 0) {
        const status = chatData.autoai ? 'aktif' : 'nonaktif';
        return conn.sendMessage(chatId, { text: `Auto-AI saat ini ${status} untuk chat ini.` }, { quoted: message });
      }

      const action = args[0]?.toLowerCase();
      if (!global.isPremium(senderId)) {
        return conn.sendMessage(chatId, { text: '❌ Fitur ini hanya untuk pengguna premium!' }, { quoted: message });
      }

      if (action === 'on') {
        chatData.autoai = true;
        writeDB(db);
        return conn.sendMessage(chatId, { text: 'Auto-AI telah diaktifkan untuk chat ini.' }, { quoted: message });
      } else if (action === 'off') {
        chatData.autoai = false;
        writeDB(db);
        return conn.sendMessage(chatId, { text: 'Auto-AI telah dinonaktifkan untuk chat ini.' }, { quoted: message });
      }

      conn.sendMessage(chatId, {
        text: 'Gunakan `.ai on` untuk mengaktifkan atau `.ai off` untuk menonaktifkan AI.'
      }, { quoted: message });
    } catch (error) {
      console.error('Error:', error);
      conn.sendMessage(message.key.remoteJid, {
        text: `Error: ${error.message || error}`,
        quoted: message,
      });
    }
  },
};