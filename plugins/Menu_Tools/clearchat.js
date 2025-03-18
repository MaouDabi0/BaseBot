module.exports = {
  name: 'clearchat',
  command: ['clearchat', 'cc'],
  tags: 'Tools Menu',
  desc: 'Hapus semua pesan hanya untuk Anda sendiri, di grup atau private chat',

  run: async (conn, message, { isPrefix }) => {
    const chatId = message.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    const senderId = message.key.participant || message.key.remoteJid;

    const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
    if (!textMessage) return;

    const prefix = isPrefix.find(p => textMessage.startsWith(p));
    if (!prefix) return;

    const args = textMessage.slice(prefix.length).trim().split(/\s+/);
    const commandText = args.shift().toLowerCase();

    if (!module.exports.command.includes(commandText)) return;

    const clearType = args[0]?.toLowerCase();
    if (!clearType || !['group', 'private'].includes(clearType)) {
      return conn.sendMessage(chatId, { 
        text: `⚠️ Penggunaan: ${prefix}clearchat group | ${prefix}clearchat private` 
      }, { quoted: message });
    }

    if (clearType === 'group' && !isGroup) {
      return conn.sendMessage(chatId, { text: '⚠️ Perintah ini hanya bisa digunakan dalam grup!' }, { quoted: message });
    }

    if (clearType === 'private' && isGroup) {
      return conn.sendMessage(chatId, { text: '⚠️ Perintah ini hanya bisa digunakan di chat pribadi!' }, { quoted: message });
    }

    try {
      console.log(`Attempting to clear ${clearType} chat for senderId: ${senderId} in chatId: ${chatId}`);

      // Menghapus pesan hanya untuk pengguna sendiri
      await conn.chatModify({ clear: { jid: chatId, fromMe: true } }, chatId);

      console.log(`Successfully cleared ${clearType} chat for senderId: ${senderId} in chatId: ${chatId}`);
      conn.sendMessage(chatId, { text: `✅ Semua pesan di ${clearType} berhasil dihapus untuk Anda!` }, { quoted: message });

    } catch (err) {
      console.error('Error during clear chat operation:', err);
      conn.sendMessage(chatId, { text: '❌ Gagal membersihkan chat. Pastikan bot memiliki izin yang diperlukan.' }, { quoted: message });
    }
  }
};