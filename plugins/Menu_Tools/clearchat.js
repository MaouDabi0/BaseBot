module.exports = {
  name: 'clearchat',
  command: ['clearchat', 'cc'],
  tags: 'Tools Menu',
  desc: 'Bersihkan semua riwayat chat untuk Anda sendiri',

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
    const commandText = args.shift().toLowerCase();
    if (!module.exports.command.includes(commandText)) return;

    try {
      console.log(`Attempting to clear chat for chatId: ${chatId}`);

      await conn.chatModify({ clear: { jid: chatId, fromMe: true } }, chatId);

      console.log(`Successfully cleared chat for chatId: ${chatId}`);
      conn.sendMessage(chatId, { text: `✅ Semua riwayat chat berhasil dibersihkan!` }, { quoted: message });

    } catch (err) {
      console.error('Error during clear chat operation:', err);
      conn.sendMessage(chatId, { text: '❌ Gagal membersihkan riwayat chat. Pastikan bot memiliki izin yang diperlukan.' }, { quoted: message });
    }
  }
};