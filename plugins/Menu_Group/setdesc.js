module.exports = {
  name: 'setdesc',
  command: ['setdesc', 'setdeskripsi'],
  tags: 'Group Menu',
  desc: 'Mengatur deskripsi group',

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
      return conn.sendMessage(chatId, { text: '⚠️ Perintah ini hanya bisa digunakan dalam grup!' }, { quoted: message }, { quoted: message });
    }

    const groupMetadata = await conn.groupMetadata(chatId);
    const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';
    const isBotAdmin = groupMetadata.participants.some(p => p.id === botNumber && p.admin);
    const isUserAdmin = groupMetadata.participants.some(p => p.id === senderId && p.admin);

    if (!isUserAdmin) {
      return conn.sendMessage(chatId, { text: '❌ Hanya admin grup yang bisa menggunakan perintah ini!' }, { quoted: message }, { quoted: message });
    }

    const description = args.join(' ');
    if (!description) {
      return conn.sendMessage(chatId, { text: '⚠️ Harap masukkan deskripsi grup setelah perintah!' }, { quoted: message }, { quoted: message });
    }

    try {
      await conn.groupUpdateDescription(chatId, description);

      conn.sendMessage(chatId, { text: `✅ Deskripsi grup berhasil diperbarui menjadi:\n${description}` }, { quoted: message }, { quoted: message });
    } catch (err) {
      console.error(err);
      conn.sendMessage(chatId, { text: '❌ Gagal memperbarui deskripsi grup.' }, { quoted: message });
    }
  }
};