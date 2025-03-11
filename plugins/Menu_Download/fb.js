const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
  name: "Facebook Downloader",
  command: ["fb", "fbdl", "facebook"],
  tags: ["Download Menu"],
  desc: "Mendownload media dari Facebook",

  async run(conn, message, { isPrefix }) {
    const chatId = message.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    const senderId = isGroup ? message.key.participant : chatId.replace(/:\d+@/, '@');
    const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';

    if (!textMessage) return;

    const prefix = isPrefix.find(p => textMessage.startsWith(p));
    if (!prefix) return;

    const args = textMessage.slice(prefix.length).trim().split(/\s+/).slice(1);
    const commandText = textMessage.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase();
    if (!module.exports.command.includes(commandText)) return;

    if (!textMessage) {
      return conn.sendMessage(chatId, {
        text: `🚨 *Format salah!*\nGunakan: *${isPrefix}fb <url>*`,
      });
    }

    if (!textMessage.match(/facebook.com|fb.watch/)) {
      return conn.sendMessage(chatId, {
        text: `❌ *Masukkan URL Facebook yang valid!*`,
      });
    }

    try {
      await conn.sendMessage(chatId, { react: { text: "🕒", key: message.key } });

      let videoUrl = await getFbVideo(textMessage);
      
      if (!videoUrl) {
        return conn.sendMessage(chatId, {
          text: "⚠️ *Gagal mengambil video! Pastikan link valid dan publik.*",
        });
      }

      await conn.sendMessage(chatId, {
        video: { url: videoUrl },
        caption: "🎬 *Berikut videonya!*",
      });

    } catch (err) {
      console.error(err);
      return conn.sendMessage(chatId, {
        text: "⚠️ *Terjadi kesalahan, coba lagi nanti!*",
      });
    }
  },
};

async function getFbVideo(url) {
  try {
    let { data } = await axios.get(`https://www.getfvid.com/downloader`, {
      params: { url },
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    let $ = cheerio.load(data);
    let videoLink = $(".btn-download").attr("href");

    return videoLink || null;
  } catch (error) {
    console.error("FB Downloader Error:", error);
    return null;
  }
}