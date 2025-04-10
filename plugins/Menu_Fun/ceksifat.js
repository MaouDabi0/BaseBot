const { sifatlist } = require('../../toolkit/helper.js');

module.exports = {
  name: 'ceksifat',
  command: ['ceksifat'],
  tags: 'Fun Menu',
  desc: 'Menebak sifat seseorang berdasarkan nama secara acak.',

  run: async (conn, message, { isPrefix }) => {
    const chatId = message.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    const senderId = isGroup ? message.key.participant : chatId.replace(/:\d+@/, '@');
    const textMessage =
      message.message?.conversation || message.message?.extendedTextMessage?.text || '';

    if (!textMessage) return;

    const prefix = isPrefix.find((p) => textMessage.startsWith(p));
    if (!prefix) return;

    const args = textMessage.slice(prefix.length).trim().split(/\s+/);
    const commandText = args.shift()?.toLowerCase();
    if (!module.exports.command.includes(commandText)) return;

    let targetId = senderId;
    let mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    let quotedParticipant = message.message?.extendedTextMessage?.contextInfo?.participant;

    if (mentionedJid) {
      targetId = mentionedJid;
    } else if (quotedParticipant) {
      targetId = quotedParticipant;
    }

    const username = targetId.split('@')[0];
    const sifat = sifatlist[Math.floor(Math.random() * sifatlist.length)];

    await conn.sendMessage(chatId, {
      text: `Nama: @${username}\nSifat: ${sifat}`,
      mentions: [targetId]
    }, { quoted: message });
  }
};