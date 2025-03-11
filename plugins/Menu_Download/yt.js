const fetch = require("node-fetch");

module.exports = {
  name: 'ytDownload',
  command: ["ytmp4", "ytmp3"],
  tags: ['Download Menu'],
  desc: 'Mendownload media berupa musik dan video dari YouTube',

  run: async (conn, message, { isPrefix }) => {
    try {
      const chatId = message?.key?.remoteJid;
      const isGroup = chatId.endsWith("@g.us");
      const senderId = message.key.participant || chatId.replace(/:\d+@/, "@");

      const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
      if (!textMessage) return;

      const prefix = isPrefix.find((p) => textMessage.startsWith(p));
      if (!prefix) return;

      const args = textMessage.slice(prefix.length).trim().split(/\s+/);
      const commandText = args.shift().toLowerCase();

      if (!module.exports.command.includes(commandText)) return;

      if (!args[0]) {
        return conn.sendMessage(chatId, { text: "❌ Masukkan link YouTube yang valid!" }, { quoted: message });
      }

      let url = args[0].trim();
      if (!/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(url)) {
        return conn.sendMessage(chatId, { text: "❌ Link YouTube tidak valid!" }, { quoted: message });
      }

      let type = commandText === "ytmp4" ? "mp4" : "mp3";
      let apiUrl = `https://ai.xterm.codes/api/yt?url=${encodeURIComponent(url)}&type=${type}&apikey=Bell409`;

      let res = await fetch(apiUrl, { timeout: 15000 });
      if (!res.ok) throw new Error(`🌐 Gagal mengakses API! (Status: ${res.status})`);

      let json = await res.json();
      if (!json.status || !json.url) throw new Error("❌ Gagal mendapatkan data dari API!");

      let caption = `*YouTube ${type.toUpperCase()}*\n\n` +
        `📌 *Judul:* ${json.title}\n` +
        `⏳ *Durasi:* ${json.duration}\n` +
        `📥 *Ukuran:* ${json.size}\n\n` +
        `⚡ Mohon tunggu, sedang mengirim file...`;

      let sendMsg = { image: { url: json.thumbnail }, caption };
      await conn.sendMessage(chatId, sendMsg, { quoted: message });

      // Coba kirim file, retry jika gagal
      let maxRetry = 3;
      for (let attempt = 1; attempt <= maxRetry; attempt++) {
        try {
          let media = {
            document: { url: json.url },
            mimetype: type === "mp4" ? "video/mp4" : "audio/mpeg",
            fileName: `${json.title}.${type}`,
          };
          await conn.sendMessage(chatId, media, { quoted: message });
          return; // Berhenti jika sukses
        } catch (err) {
          console.warn(`⚠️ Gagal mengirim file (Percobaan ${attempt}/${maxRetry}):`, err);
          if (attempt === maxRetry) throw new Error("❌ Gagal mengirim file setelah beberapa percobaan!");
        }
      }
    } catch (err) {
      console.error("❌ Error di ytDownload.js:", err);
      conn.sendMessage(message.key.remoteJid, { text: `⚠️ Terjadi kesalahan: ${err.message}` }, { quoted: message });
    }
  },
};