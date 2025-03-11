module.exports = {
  name: 'demote',
  command: ['demote', 'stopadmin', 'demoteadmin'],
  tags: 'Group Menu',
  desc: 'Turunkan admin grup menjadi anggota',

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
    const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';
    const isBotAdmin = groupMetadata.participants.some(p => p.id === botNumber && p.admin);
    const isUserAdmin = groupMetadata.participants.some(p => p.id === senderId && p.admin);

    if (!isUserAdmin) {
      return conn.sendMessage(chatId, { text: '❌ Hanya admin grup yang bisa menggunakan perintah ini!' }, { quoted: message });
    }

    if (!isBotAdmin) {
      return conn.sendMessage(chatId, { text: '❌ Bot bukan admin, tidak bisa menurunkan admin!' }, { quoted: message });
    }

    const mentionIds = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const targetId = mentionIds[0];

    if (!targetId) {
      return conn.sendMessage(chatId, { text: `⚠️ Harap mention atau reply admin yang ingin diturunkan!\nContoh: ${prefix}demote @user` }, { quoted: message });
    }

    const isTargetAdmin = groupMetadata.participants.some(p => p.id === targetId && p.admin);
    if (!isTargetAdmin) {
      return conn.sendMessage(chatId, { text: '❌ Pengguna yang disebutkan bukan admin grup!' }, { quoted: message });
    }

    try {
      await conn.groupParticipantsUpdate(chatId, [targetId], 'demote');

      conn.sendMessage(chatId, { text: `✅ Berhasil menurunkan @${targetId.split('@')[0]} dari admin grup!` }, { quoted: message, mentions: [targetId] });
    } catch (err) {
      console.error(err);
      conn.sendMessage(chatId, { text: '❌ Gagal menurunkan admin. Pastikan bot adalah admin dan ID yang dimaksud valid.' }, { quoted: message });
    }
  }
};