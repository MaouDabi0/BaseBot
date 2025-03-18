module.exports = {
  name: 'listadmin',
  command: ['listadmin', 'listadmins'],
  tags: 'Group Menu',
  desc: 'Daftar semua admin grup',

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

    if (!module.exports.command.includes(commandText)) return;

    if (!isGroup) {
      return conn.sendMessage(chatId, { text: '⚠️ Perintah ini hanya bisa digunakan dalam grup!' }, { quoted: message });
    }

    try {
      const groupMetadata = await conn.groupMetadata(chatId);
      const admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id);

      if (admins.length === 0) {
        return conn.sendMessage(chatId, { text: '❌ Tidak ada admin di grup ini.' }, { quoted: message });
      }

      let adminList = '👑 *Daftar Admin Grup:*\n';
      admins.forEach((adminId, index) => {
        adminList += `${index + 1}. @${adminId.split('@')[0]}\n`;
      });

      conn.sendMessage(chatId, { text: adminList, mentions: admins }, { quoted: message });
    } catch (err) {
      console.error(err);
      conn.sendMessage(chatId, { text: '❌ Gagal mengambil daftar admin.' }, { quoted: message });
    }
  }
};