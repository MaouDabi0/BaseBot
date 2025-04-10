module.exports = {
  name: 'kick',
  command: ['kick', 'tendang', 'keluar'],
  tags: 'Group Menu',
  desc: 'Mengeluarkan anggota dari grup (hanya bisa digunakan oleh admin).',

  run: async (conn, message, { isPrefix }) => {
    const chatId = message?.key?.remoteJid;
    const isGroup = chatId.endsWith("@g.us");
    const sender = isGroup ? message.key.participant : chatId;
    const mtype = Object.keys(message.message || {})[0];
    const textMessage =
      (mtype === "conversation" && message.message?.conversation) ||
      (mtype === "extendedTextMessage" && message.message?.extendedTextMessage?.text) ||
      "";

    if (!textMessage) return;

    const prefix = isPrefix.find((p) => textMessage.startsWith(p));
    if (!prefix) return;

    const args = textMessage.slice(prefix.length).trim().split(/\s+/);
    const commandText = args[0]?.toLowerCase();
    if (!module.exports.command.includes(commandText)) return;

    if (!isGroup) return conn.sendMessage(chatId, { text: "❌ Perintah ini hanya bisa digunakan dalam grup!" }, { quoted: message });

    let groupMetadata = await conn.groupMetadata(chatId);
    let groupAdmins = groupMetadata.participants.filter((p) => p.admin).map((p) => p.id);
    let botNumber = conn.user.id.split(":")[0] + "@s.whatsapp.net";

    if (!groupAdmins.includes(sender)) return conn.sendMessage(chatId, { text: "❌ Perintah ini hanya bisa digunakan oleh admin grup!" }, { quoted: message });
    if (!groupAdmins.includes(botNumber)) return conn.sendMessage(chatId, { text: "❌ Bot harus menjadi admin untuk menggunakan perintah ini!" }, { quoted: message });

    let mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    let quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    let targetUser = mentionedJid[0] || (quotedMessage ? message.message.extendedTextMessage.contextInfo.participant : null);

    if (!targetUser) return conn.sendMessage(chatId, { text: `❌ Gunakan format:\n${prefix}kick @user atau reply pesan target.` }, { quoted: message });

    if (groupAdmins.includes(targetUser)) return conn.sendMessage(chatId, { text: "❌ Tidak bisa mengeluarkan admin grup!" }, { quoted: message });

    await conn.groupParticipantsUpdate(chatId, [targetUser], "remove")
      .then(() => conn.sendMessage(chatId, { text: `✅ Berhasil mengeluarkan @${targetUser.split("@")[0]}`, mentions: [targetUser] }, { quoted: message }))
      .catch(() => conn.sendMessage(chatId, { text: "❌ Gagal mengeluarkan anggota. Pastikan bot adalah admin!" }, { quoted: message }));
  }
};