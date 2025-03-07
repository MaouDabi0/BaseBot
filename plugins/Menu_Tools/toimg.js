const { uploadToCatbox } = require("../../toolkit/uploader");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "toimg",
  command: ["toimg"],
  tags: ["Tools Menu"],

  run: async function (conn, m, { args, isPrefix }) {
    try {
      const textMessage = m.message?.conversation || "";

      const prefix = isPrefix.find(p => textMessage.startsWith(p));
      if (!prefix) return;

      const commandText = textMessage.slice(prefix.length).trim().split(/\s+/)[0]?.toLowerCase();
      if (!module.exports.command.includes(commandText)) return;

      if (!m.message?.stickerMessage) {
        return conn.sendMessage(m.key.remoteJid, { text: "⚠️ Harap balas stiker untuk dikonversi ke gambar!" }, { quoted: m });
      }

      console.log("🖼️ Stiker ditemukan, mulai mengonversi...");

      const media = await conn.downloadMediaMessage(m.message);
      if (!media) throw new Error("Gagal mengunduh stiker!");

      // Simpan sebagai file sementara
      const tempFile = path.join(__dirname, "../../temp/sticker.webp");
      fs.writeFileSync(tempFile, media);

      console.log("📤 Mengunggah ke Catbox...");
      const imageUrl = await uploadToCatbox(tempFile);

      // Hapus file setelah diunggah
      fs.unlinkSync(tempFile);

      console.log("✅ Berhasil dikonversi:", imageUrl);
      return conn.sendMessage(m.key.remoteJid, { image: { url: imageUrl }, caption: "🎉 Stiker berhasil dikonversi ke gambar!" }, { quoted: m });

    } catch (error) {
      console.error("❌ Error pada plugin toimg:", error.message);
      return conn.sendMessage(m.key.remoteJid, { text: `❌ Gagal mengonversi stiker: ${error.message}` }, { quoted: m });
    }
  }
};