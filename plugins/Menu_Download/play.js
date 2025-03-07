const play = require("play-dl");
const yts = require("yt-search");
const fs = require("fs");
const path = require("path");
const { isPrefix } = require('../../toolkit/setting');

module.exports = {
  name: 'play',
  command: ["play"],
  tags: ["Download Menu"],

  run: async (conn, message, { args, isPrefix }) => {
    try {
      // Ambil teks pesan
      const messageText = message.message?.conversation || 
                          message.message?.extendedTextMessage?.text || 
                          "";

      if (!messageText) return; // Pastikan ada teks

      // Validasi prefix
      const prefix = isPrefix.find(p => messageText.startsWith(p));
      if (!prefix) return;

      // Ambil perintah setelah prefix
      const commandText = messageText.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase();
      if (!module.exports.command.includes(commandText)) return;

      // Pastikan args tidak kosong
      if (!Array.isArray(args) || args.length === 0) {
        return conn.sendMessage(message.key.remoteJid, { text: "Masukkan judul lagu yang ingin dicari!" });
      }

      const searchText = args.join(" ");
      console.log(`🔍 Mencari lagu: ${searchText}`);

      // Gunakan yt-search untuk mencari video
      const searchResults = await yts(searchText);
      if (!searchResults.videos || searchResults.videos.length === 0) {
        return conn.sendMessage(message.key.remoteJid, { text: "Lagu tidak ditemukan!" });
      }

      const video = searchResults.videos[0]; // Ambil hasil pertama
      if (!video || !video.url) {
        return conn.sendMessage(message.key.remoteJid, { text: "Gagal mendapatkan URL lagu!" });
      }

      console.log(`🎵 Lagu ditemukan: ${video.title} (${video.url})`);

      const tempFolder = path.resolve(__dirname, "temp");
      if (!fs.existsSync(tempFolder)) fs.mkdirSync(tempFolder, { recursive: true });

      const filePath = path.join(tempFolder, `${video.videoId}.mp3`);

      // Pastikan URL valid sebelum download
      if (!video.url.startsWith("http")) {
        return conn.sendMessage(message.key.remoteJid, { text: "Gagal mendapatkan URL lagu yang valid!" });
      }

      // Ambil stream audio dengan play-dl
      const stream = await play.stream(video.url, { quality: 2 });
      const writeStream = fs.createWriteStream(filePath);
      stream.stream.pipe(writeStream);

      writeStream.on("finish", async () => {
        const audioBuffer = fs.readFileSync(filePath);
        await conn.sendMessage(message.key.remoteJid, { audio: audioBuffer, mimetype: "audio/mpeg" });

        // Hapus file setelah dikirim
        fs.unlinkSync(filePath);
        console.log(`✅ Lagu ${video.title} berhasil dikirim!`);
      });

      conn.sendMessage(message.key.remoteJid, { text: `Mengunduh lagu: ${video.title}` });

    } catch (error) {
      console.error("❌ Error di play.js:", error);
      conn.sendMessage(message.key.remoteJid, { text: "Terjadi kesalahan saat mengambil lagu." });
    }
  }
};
