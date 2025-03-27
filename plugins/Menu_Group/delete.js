module.exports = {
  name: 'delete',
  command: ['d', 'del'],
  tags: 'Group Menu',
  desc: 'Menghapus pesan pengguna di group',

  run: async (conn, message, { isPrefix }) => {
    try {
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
        return conn.sendMessage(chatId, { text: "❌ Perintah ini hanya bisa digunakan dalam grup!" }, { quoted: message });
      }

      const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const quotedKey = message.message?.extendedTextMessage?.contextInfo?.stanzaId;
      const quotedSender = message.message?.extendedTextMessage?.contextInfo?.participant;
      if (!quotedMessage || !quotedKey || !quotedSender) {
        return conn.sendMessage(chatId, { text: "❌ Harap kutip pesan yang ingin dihapus!" }, { quoted: message });
      }

      const groupMetadata = await conn.groupMetadata(chatId);
      const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';
      const isBotAdmin = groupMetadata.participants.some(p => p.id === botNumber && p.admin);
      const isUserAdmin = groupMetadata.participants.some(p => p.id === senderId && p.admin);

      if (!isUserAdmin) {
        return conn.sendMessage(chatId, { text: "❌ Hanya admin grup yang bisa menggunakan perintah ini!" }, { quoted: message });
      }

      if (!isBotAdmin) {
        return conn.sendMessage(chatId, { text: "❌ Bot harus menjadi admin untuk menghapus pesan!" }, { quoted: message });
      }

      const isQuotedFromBot = quotedSender === botNumber;

      if (isQuotedFromBot) {
        await conn.sendMessage(chatId, { delete: { remoteJid: chatId, fromMe: true, id: quotedKey } });
      } else {
        await conn.sendMessage(chatId, { delete: { remoteJid: chatId, fromMe: false, id: quotedKey, participant: quotedSender } });
      }

    } catch (error) {
      conn.sendMessage(chatId, { text: "⚠️ Gagal menghapus pesan." }, { quoted: message });
    }
  }
};