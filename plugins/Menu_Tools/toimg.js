const { uploadToCatbox } = require("../../toolkit/uploader");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const fs = require("fs").promises;
const path = require("path");

module.exports = {
  name: "toimg",
  command: ["toimg"],
  tags: ["Tools Menu"],
  desc: 'Mengonversi sticker menjadi media',

  run: async function (conn, m, { args, isPrefix }) {
    try {
      const messageText =
        m.message?.conversation ||
        m.message?.extendedTextMessage?.text ||
        m.message?.imageMessage?.caption ||
        m.message?.videoMessage?.caption ||
        "";

      if (!messageText) return;

      const prefix = isPrefix.find(p => messageText.startsWith(p));
      if (!prefix) return;

      const commandText = messageText.slice(prefix.length).trim().split(/\s+/)[0]?.toLowerCase();
      if (!module.exports.command.includes(commandText)) return;

      const quotedMsg = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const stickerMessage = quotedMsg?.stickerMessage || m.message?.stickerMessage;

      if (!stickerMessage) {
        return conn.sendMessage(m.key.remoteJid, { text: "⚠️ Harap balas atau kutip stiker untuk dikonversi ke gambar!" }, { quoted: m });
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

      await fs.unlink(tempFile);

      return conn.sendMessage(m.key.remoteJid, { image: { url: imageUrl }, caption: "🎉 Stiker berhasil dikonversi ke gambar!" }, { quoted: m });

    } catch (error) {
      return conn.sendMessage(m.key.remoteJid, { text: `❌ Gagal mengonversi stiker: ${error.message}` }, { quoted: m });
    }
  }
};