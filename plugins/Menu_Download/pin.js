const pinterest = require("../../toolkit/scrape/pinterest");

module.exports = {
  name: "Pinterest Downloader",
  command: ["pin", "pinterest"],
  tags: ["Download Menu"],
  desc: "Mendownload gambar dari Pinterest berdasarkan kata kunci atau link.",

  async run(conn, message, { isPrefix }) {
    const chatId = message.key.remoteJid;
    const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || "";

    if (!textMessage) return;

    const prefix = isPrefix.find(p => textMessage.startsWith(p));
    if (!prefix) return;

    const args = textMessage.slice(prefix.length).trim().split(/\s+/).slice(1);
    const commandText = textMessage.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase();
    if (!module.exports.command.includes(commandText)) return;

    if (!args.length) {
      return conn.sendMessage(chatId, { text: `🚨 *Format salah!*\nGunakan: *${prefix}pin <keyword>*` });
    }

    const query = args.join(" ");

    try {
      await conn.sendMessage(chatId, { react: { text: "🕒", key: message.key } });

      const images = await pinterest(query);

      if (!images || images.length === 0) {
        return conn.sendMessage(chatId, { text: `⚠️ Tidak ditemukan gambar untuk: *"${query}"*` });
      }

      const randomImage = images[Math.floor(Math.random() * images.length)];

      await conn.sendMessage(chatId, {
        image: { url: randomImage },
        caption: `🔎 *Hasil pencarian untuk*: ${query}`,
      });
    } catch (err) {
      console.error(err);
      return conn.sendMessage(chatId, { text: err });
    }
  },
};