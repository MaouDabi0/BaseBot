module.exports = {
  name: 'clearchat',
  command: ['clearchat', 'cc'],
  tags: 'Tools Menu',
  desc: 'Clear all chat messages in group or private chat',

  run: async (conn, message, { isPrefix }) => {
    const chatId = message.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    const senderId = message.key.participant || chatId.replace(/:\d+@/, '@');

    const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
    if (!textMessage) return;

    const prefix = isPrefix.find(p => textMessage.startsWith(p));
    if (!prefix) return;

    const args = textMessage.slice(prefix.length).trim().split(/\s+/);
    const commandText = args.shift().toLowerCase();

    if (!module.exports.command.includes(commandText)) return;

    const clearType = args[0]?.toLowerCase();
    if (!clearType || !['group', 'private'].includes(clearType)) {
      return conn.sendMessage(chatId, { text: `⚠️ Penggunaan: ${prefix}clearchat group | ${prefix}clearchat private` }, { quoted: message });
    }

    if (clearType === 'group' && !isGroup) {
      return conn.sendMessage(chatId, { text: '⚠️ Perintah ini hanya bisa digunakan dalam grup!' }, { quoted: message });
    }

    if (clearType === 'private' && isGroup) {
      return conn.sendMessage(chatId, { text: '⚠️ Perintah ini hanya bisa digunakan di chat pribadi!' }, { quoted: message });
    }

    if (clearType === 'group') {
      const groupMetadata = await conn.groupMetadata(chatId);
      const isUserAdmin = groupMetadata.participants.some(p => p.id === senderId && p.admin);

      if (!isUserAdmin) {
        return conn.sendMessage(chatId, { text: '❌ Hanya admin grup yang bisa menggunakan perintah ini!' }, { quoted: message });
      }
    }

    try {
      console.log(`Attempting to clear ${clearType} chat for chatId: ${chatId}`);
      if (clearType === 'group') {
        await conn.clearMessages(chatId); // Membersihkan pesan di grup
        console.log(`Successfully cleared group chat for chatId: ${chatId}`);
        conn.sendMessage(chatId, { text: '✅ Semua chat grup berhasil dibersihkan!' }, { quoted: message });
      } else if (clearType === 'private') {
        await conn.clearMessages(chatId); // Membersihkan pesan di chat pribadi
        console.log(`Successfully cleared private chat for chatId: ${chatId}`);
        conn.sendMessage(chatId, { text: '✅ Semua chat pribadi berhasil dibersihkan!' }, { quoted: message });
      }
    } catch (err) {
      console.error('Error during clear chat operation:', err);
      conn.sendMessage(chatId, { text: '❌ Gagal membersihkan chat. Pastikan bot memiliki izin yang diperlukan.' }, { quoted: message });
    }
  }
};