module.exports = {
  name: 'ceklesbi',
  command: ['ceklesbi'],
  tags: 'Fun Menu',
  desc: 'Cek seberapa lesbi seseorang',

  run: async (conn, message, { isPrefix }) => {
    const chatId = message.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    const senderId = isGroup ? message.key.participant : message.key.remoteJid;
    const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';

    if (!textMessage) return;

    const prefix = isPrefix.find((p) => textMessage.startsWith(p));
    if (!prefix) return;

    const args = textMessage.slice(prefix.length).trim().split(/\s+/);
    const commandText = args.shift().toLowerCase();
    if (!module.exports.command.includes(commandText)) return;

    let target;
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
      target = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
    } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
      target = message.message.extendedTextMessage.contextInfo.participant;
    } else {
      target = senderId;
    }

    const persentase = Math.floor(Math.random() * 101); // 0-100%

    let komentar;
    if (persentase <= 25) {
      komentar = 'Masih aman lu mbak';
    } else if (persentase <= 44) {
      komentar = 'Agak lain lu mbak';
    } else if (persentase <= 72) {
      komentar = 'Waduh warga pelangi?';
    } else if (persentase <= 88) {
      komentar = 'Fiks lesbi';
    } else {
      komentar = 'Hati² orang lesbi';
    }

    const mentionTarget = target.replace(/@s.whatsapp.net$/, '');

    const teks = `*Cek seberapa lesbi @${mentionTarget}*\n\n*${persentase}%* Lesbi\n_${komentar}_`;

    await conn.sendMessage(chatId, {
      text: teks,
      mentions: [target]
    }, { quoted: message });
  }
};