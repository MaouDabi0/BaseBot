const fs = require("fs");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

module.exports = {
  name: "setpp",
  command: ["setpp", "setprofile"],
  tags: ["Owner Menu"],
  desc: "Mengubah foto profil bot (hanya untuk owner).",

  run: async (conn, message, { isPrefix }) => {
    try {
      const chatId = message?.key?.remoteJid;
      const isGroup = chatId.endsWith("@g.us");
      const senderId = isGroup ? message.key.participant : chatId;
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

      if (!global.ownerNumber.includes(senderId.replace(/\D/g, ''))) {
        return conn.sendMessage(chatId, { text: 'Hanya owner yang dapat menggunakan perintah ini' }, { quoted: message });
      }

      let mediaMessage;
      if (mtype === "imageMessage") {
        mediaMessage = message.message.imageMessage;
      } else if (mtype === "extendedTextMessage" && message.message.extendedTextMessage.contextInfo?.quotedMessage?.imageMessage) {
        mediaMessage = message.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
      }

      if (!mediaMessage) {
        return conn.sendMessage(chatId, { text: `📷 *Cara menggunakan perintah:*\n\nKirim gambar atau reply gambar dengan perintah:\n\`${isPrefix[0]}setpp\`` });
      }

      const stream = await downloadContentFromMessage(mediaMessage, "image");

      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      await conn.updateProfilePicture(conn.user.id, buffer);
      conn.sendMessage(chatId, { text: "✅ Foto profil bot berhasil diperbarui!" });
    } catch (error) {
      conn.sendMessage(chatId, { text: "❌ Terjadi kesalahan saat memperbarui foto profil bot." });
    }
  }
};