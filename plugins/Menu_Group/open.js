const config = require('../../toolkit/set/config.json');

module.exports = {
  name: 'open',
  command: ['open', 'buka', 'bukagrup'],
  tags: 'Group Menu',
  desc: 'Membuka chat Group',

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
      const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';
      const isBotAdmin = groupMetadata.participants.some(p => p.id === botNumber && p.admin);
      const isUserAdmin = groupMetadata.participants.some(p => p.id === senderId && p.admin);

      if (!isUserAdmin) {
        return conn.sendMessage(chatId, { text: '❌ Hanya admin grup yang bisa menggunakan perintah ini!' }, { quoted: message });
      }

      if (!isBotAdmin) {
        return conn.sendMessage(chatId, { text: '❌ Bot harus menjadi admin untuk membuka grup!' }, { quoted: message });
      }

      await conn.groupSettingUpdate(chatId, 'not_announcement');
      conn.sendMessage(chatId, { text: '🔓 Grup telah dibuka! Sekarang semua anggota bisa mengirim pesan.' }, { quoted: message });
    } catch (err) {
      console.error(err);
      conn.sendMessage(chatId, { text: '❌ Gagal membuka grup. Coba lagi nanti.' }, { quoted: message });
    }
  }
};