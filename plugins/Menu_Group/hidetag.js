module.exports = {
  name: 'hidetag',
  command: ['hidetag', 'h'],
  tags: 'Group Menu',
  desc: 'Kirim pesan ke semua anggota grup tanpa menyebut mereka',

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

    if (!isGroup) {
      return conn.sendMessage(chatId, { text: '⚠️ Perintah ini hanya bisa digunakan dalam grup!' }, { quoted: message });
    }

    const groupMetadata = await conn.groupMetadata(chatId);
    const isUserAdmin = groupMetadata.participants.some(p => p.id === senderId && p.admin);

    if (!isUserAdmin) {
      return conn.sendMessage(chatId, { text: '❌ Hanya admin grup yang bisa menggunakan perintah ini!' }, { quoted: message });
    }

    const textToSend = args.join(' ');
    if (!textToSend) {
      return conn.sendMessage(chatId, { text: `⚠️ Harap masukkan teks yang ingin dikirim!\nContoh: ${prefix}hidetag Pesan rahasia` }, { quoted: message });
    }

    try {
      await conn.sendMessage(chatId, { text: textToSend }, { quoted: message });
    } catch (err) {
      console.error(err);
      conn.sendMessage(chatId, { text: '❌ Gagal mengirim pesan.' }, { quoted: message });
    }
  }
};