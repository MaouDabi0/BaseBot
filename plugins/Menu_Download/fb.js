const facebook = require("../../toolkit/scrape/facebook");

module.exports = {
  name: 'facebook',
  command: ['fb', 'fbdl', 'facebook'],
  tags: 'Download Menu',
  desc: 'Mendownload media dari Facebook',

  async run(conn, message, { isPrefix }) {
    const chatId = message.key.remoteJid;
    const isGroup = chatId.endsWith("@g.us");
    const senderId = isGroup ? message.key.participant : chatId.replace(/:\d+@/, "@");
    const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || "";

    if (!textMessage) return;

    const prefix = isPrefix.find((p) => textMessage.startsWith(p));
    if (!prefix) return;

    const args = textMessage.slice(prefix.length).trim().split(/\s+/).slice(1);
    const commandText = textMessage.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase();
    if (!module.exports.command.includes(commandText)) return;

    if (!global.isPremium(senderId)) {
      return conn.sendMessage(chatId, { text: '❌ Fitur ini hanya untuk pengguna premium!' }, { quoted: message });
    }

    if (!args[0]) {
      return conn.sendMessage(chatId, {
        text: `🚨 *Format salah!*\nGunakan: *${prefix}fb <url>*`
      }, { quoted: message });
    }

    const url = args[0];

    if (!/facebook\.\w+\/(reel|watch|share)/gi.test(url)) {
      return conn.sendMessage(chatId, {
        text: `❌ *Masukkan URL Facebook yang valid!*`
      }, { quoted: message });
    }

    try {
      await conn.sendMessage(chatId, { react: { text: "🕒", key: message.key } });

      const videoData = await facebook(url);

      if (!videoData || !videoData.video.length) {
        return conn.sendMessage(chatId, {
          text: "⚠️ *Gagal mengambil video! Pastikan link valid dan publik.*"
        }, { quoted: message });
      }

      const bestQualityVideo = videoData.video[0]?.url;
      if (!bestQualityVideo) {
        return conn.sendMessage(chatId, {
          text: "⚠️ *Video tidak ditemukan atau tidak dapat diunduh!*"
        }, { quoted: message });
      }

      const caption = `🎬 *Video Facebook Ditemukan!*\n\n📌 *Judul*: ${videoData.title || "Tidak diketahui"}\n⏳ *Durasi*: ${videoData.duration || "Tidak diketahui"}`;

      await conn.sendMessage(chatId, {
        image: { url: videoData.thumbnail },
        caption,
      }, { quoted: message });

      await conn.sendMessage(chatId, {
        video: { url: bestQualityVideo },
        caption: "✅ *Berikut videonya!*"
      }, { quoted: message });
    } catch (err) {
      console.error(err);
      return conn.sendMessage(chatId, {
        text: "⚠️ *Terjadi kesalahan, coba lagi nanti!*"
      }, { quoted: message });
    }
  },
};