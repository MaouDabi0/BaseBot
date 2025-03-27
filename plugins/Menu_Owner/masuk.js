const { isJidGroup } = require('@whiskeysockets/baileys');
const config = require('../../toolkit/set/config.json');

module.exports = {
  name: 'masuk',
  command: ['masuk', 'gabung'],
  tags: 'Owner Menu',
  desc: 'Menambahkan bot ke group',

  run: async (conn, message, { isPrefix }) => {
    const chatId = message.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    const senderId = isGroup ? message.key.participant : chatId.replace(/:\d+@/, '@');
    const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';

    if (!textMessage) return;
    const prefix = isPrefix.find(p => textMessage.startsWith(p));
    if (!prefix) return;

    const args = textMessage.slice(prefix.length).trim().split(/\s+/);
    const commandText = args.shift().toLowerCase();
    let text = args.join(' ');

    if (!module.exports.command.includes(commandText)) return;
    if (!global.isPremium(senderId)) {
      return conn.sendMessage(chatId, { text: '❌ Fitur ini hanya untuk pengguna premium!' }, { quoted: message });
    }

    if (!text && message.message.extendedTextMessage?.contextInfo?.quotedMessage) {
      const quoted = message.message.extendedTextMessage.contextInfo.quotedMessage;
      text = quoted.conversation || quoted.extendedTextMessage?.text || '';
    }

    if (!text) {
      return conn.sendMessage(chatId, { text: '⚠️ Harap berikan tautan grup WhatsApp atau reply pesan yang berisi tautan.' }, { quoted: message });
    }

    const linkRegex = /chat\.whatsapp\.com\/([\w\d]+)/;
    const match = text.match(linkRegex);
    if (!match) {
      return conn.sendMessage(chatId, { text: '❌ Format tautan grup tidak valid.' }, { quoted: message });
    }

    const code = match[1];

    try {
      const res = await conn.groupAcceptInvite(code);
      if (res && isJidGroup(res)) {
        return conn.sendMessage(chatId, { text: `✅ Berhasil bergabung ke grup!\n\n📌 ID Grup: ${res}` }, { quoted: message });
      } else {
        return conn.sendMessage(chatId, { text: '✅ Berhasil... Menunggu persetujuan admin.' }, { quoted: message });
      }
    } catch (err) {
      console.error(err);
      if (err.message.includes('rejected') || err.message.includes('kicked')) {
        return conn.sendMessage(chatId, { text: '✖️ Gagal memasuki grup, karena bot pernah dikeluarkan.' }, { quoted: message });
      }
      return conn.sendMessage(chatId, { text: '❌ Gagal bergabung ke grup. Pastikan bot tidak dibatasi untuk masuk ke grup.' }, { quoted: message });
    }
  }
};