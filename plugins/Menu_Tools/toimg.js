const { uploadToCatbox } = require("../../toolkit/scrape/uploader");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const fs = require("fs").promises;
const path = require("path");

module.exports = {
  name: 'toimg',
  command: ['toimg'],
  tags: 'Tools Menu',
  desc: 'Mengonversi stiker menjadi gambar',

  run: async function (conn, message, { isPrefix }) {
    try {
      const chatId = message.key.remoteJid;
      const isGroup = chatId.endsWith("@g.us");
      const senderId = isGroup ? message.key.participant : chatId.replace(/:\d+@/, "@");

      const messageText = 
        message.message?.conversation || 
        message.message?.extendedTextMessage?.text || 
        message.message?.imageMessage?.caption || 
        message.message?.videoMessage?.caption || 
        "";

      if (!messageText) return;

      const prefix = isPrefix.find((p) => messageText.startsWith(p));
      if (!prefix) return;

      const commandText = messageText.slice(prefix.length).trim().split(/\s+/)[0]?.toLowerCase();
      if (!module.exports.command.includes(commandText)) return;

      if (!global.isPremium(senderId)) {
        return conn.sendMessage(chatId, { text: "❌ Fitur ini hanya untuk pengguna premium!" }, { quoted: message });
      }

      const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const stickerMessage = quotedMessage?.stickerMessage || message.message?.stickerMessage;

      if (!stickerMessage) {
        return conn.sendMessage(chatId, { text: "⚠️ Harap balas atau kutip stiker untuk dikonversi ke gambar!" }, { quoted: message });
      }

      const stream = await downloadContentFromMessage(stickerMessage, "sticker");
      let buffer = Buffer.alloc(0);

      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      if (!buffer.length) throw new Error("Gagal mengunduh stiker!");

      const tempDir = path.join(__dirname, "../../temp");
      await fs.mkdir(tempDir, { recursive: true });

      const tempFile = path.join(tempDir, "sticker.webp");
      await fs.writeFile(tempFile, buffer);

      const imageUrl = await uploadToCatbox(tempFile);
      await fs.unlink(tempFile).catch(() => {});

      if (!imageUrl) throw new Error("Gagal mengunggah gambar ke Catbox!");

      return conn.sendMessage(chatId, { image: { url: imageUrl }, caption: "🎉 Stiker berhasil dikonversi ke gambar!" }, { quoted: message });

    } catch (error) {
      return conn.sendMessage(message.key.remoteJid, { text: `❌ Gagal mengonversi stiker: ${error.message}` }, { quoted: message });
    }
  }
};