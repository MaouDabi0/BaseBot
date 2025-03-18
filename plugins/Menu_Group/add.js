module.exports = {
  name: "add",
  command: ["add", "invite", "tambahkan"],
  tags: ["Group Menu"],
  desc: "Menambahkan anggota ke grup (hanya bisa digunakan oleh admin).",

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

    if (!isGroup) return conn.sendMessage(chatId, { text: "❌ Perintah ini hanya bisa digunakan dalam grup!" });

    let groupMetadata = await conn.groupMetadata(chatId);
    let groupAdmins = groupMetadata.participants.filter((p) => p.admin).map((p) => p.id);
    let botNumber = conn.user.id.split(":")[0] + "@s.whatsapp.net";

    if (!groupAdmins.includes(sender)) return conn.sendMessage(chatId, { text: "❌ Perintah ini hanya bisa digunakan oleh admin grup!" });
    if (!groupAdmins.includes(botNumber)) return conn.sendMessage(chatId, { text: "❌ Bot harus menjadi admin untuk menggunakan perintah ini!" });

    let mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    let quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    let quotedSender = quotedMessage ? message.message.extendedTextMessage.contextInfo.participant : null;
    
    let targetUser = mentionedJid[0] || quotedSender || (args[1] ? args[1].replace(/[^0-9]/g, "") + "@s.whatsapp.net" : null);

    if (!targetUser) return conn.sendMessage(chatId, { text: `❌ Gunakan format:\n${prefix}add @user\n${prefix}add 628xxxxxxxxx\natau reply pesan target.` });

    await conn.groupParticipantsUpdate(chatId, [targetUser], "add")
      .then(() => conn.sendMessage(chatId, { text: `✅ Berhasil menambahkan @${targetUser.split("@")[0]}`, mentions: [targetUser] }))
      .catch(() => conn.sendMessage(chatId, { text: "❌ Gagal menambahkan anggota. Pastikan nomor aktif dan bot adalah admin!" }));
  }
};