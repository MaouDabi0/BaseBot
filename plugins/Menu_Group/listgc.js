module.exports = {
  name: 'listgroup',
  command: ['listgc', 'listgroup'],
  tags: 'Group Menu',
  desc: 'Melihat semua grup yang bot masuki (Hanya untuk pengguna premium)',

  run: async (conn, message, { isPrefix }) => {
    const chatId = message.key.remoteJid;
    const senderId = chatId.endsWith('@g.us') ? message.key.participant : chatId.replace(/:\d+@/, '@');
    const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';

    if (!textMessage) return;

    const prefix = isPrefix.find(p => textMessage.startsWith(p));
    if (!prefix) return;

    const args = textMessage.slice(prefix.length).trim().split(/\s+/);
    const commandText = args.shift().toLowerCase();

    if (!module.exports.command.includes(commandText)) return;

    if (!global.isPremium(senderId)) {
      return conn.sendMessage(chatId, { text: '❌ Fitur ini hanya untuk pengguna premium!' }, { quoted: message });
    }

    try {
      const groups = await conn.groupFetchAllParticipating();
      const groupList = Object.values(groups);

      if (groupList.length === 0) {
        return conn.sendMessage(chatId, { text: '📌 Bot tidak tergabung dalam grup mana pun.' }, { quoted: message });
      }

      let response = `📋 *Daftar Grup yang Bot Ikuti:*\n\n`;
      groupList.forEach((group, index) => {
        response += `${index + 1}. *${group.subject}*\n   📌 ID: ${group.id}\n   👥 Member: ${group.size}\n\n`;
      });

      conn.sendMessage(chatId, { text: response }, { quoted: message });
    } catch (err) {
      console.error(err);
      conn.sendMessage(chatId, { text: '❌ Gagal mengambil daftar grup. Coba lagi nanti.' }, { quoted: message });
    }
  }
};