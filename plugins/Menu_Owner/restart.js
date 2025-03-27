const cleartemp = require('./cleartemp');

module.exports = {
  name: 'restart',
  command: ['restart', 'rt'],
  tags: 'Owner Menu',
  desc: 'Merestart bot',

  run: async (conn, message, { isPrefix }) => {
    const chatId = message.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    const senderId = isGroup ? message.key.participant : chatId.replace(/:\d+@/, '@');
    const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';

    if (!textMessage) return;

    const prefix = isPrefix.find(p => textMessage.startsWith(p));
    if (!prefix) return;

    const args = textMessage.slice(prefix.length).trim().split(/\s+/).slice(1);
    const commandText = textMessage.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase();
    if (!module.exports.command.includes(commandText)) return;

    const config = require('../../toolkit/set/config.json');
    if (!config.ownerSetting.ownerNumber.includes(senderId.replace(/\D/g, ''))) {
      return conn.sendMessage(chatId, { text: 'Hanya owner yang dapat menggunakan perintah ini' }, { quoted: message });
    }

    await cleartemp.run(conn, message, { isPrefix });

    await conn.sendMessage(chatId, { text: "🔄 Membersihkan folder temp selesai. Bot akan restart dalam 2 detik..." }, { quoted: message });

    await new Promise(resolve => setTimeout(resolve, 2000));

    process.exit(1);
  }
};