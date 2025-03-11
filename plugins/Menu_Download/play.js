const fetch = require("node-fetch");
const { ytmp3, ytsearch } = require("ruhend-scraper");

module.exports = {
  name: 'play',
  command: ['play', 'song', 'lagu', 'ply'],
  tags: ['Download Menu'],
  desc: 'Mendownload media dalam bentuk musik atau mp3 dari YouTube',

  run: async (conn, message, { isPrefix }) => {
    try {
      const chatId = message?.key?.remoteJid;
      const senderId = message.key.participant || chatId.replace(/:\d+@/, "@");

      const textMessage =
        message.message?.conversation ||
        message.message?.extendedTextMessage?.text ||
        "";
      if (!textMessage) return;

      const prefix = isPrefix.find((p) => textMessage.startsWith(p));
      if (!prefix) return;

      const args = textMessage.slice(prefix.length).trim().split(/\s+/);
      const commandText = args.shift().toLowerCase();
      if (!module.exports.command.includes(commandText)) return;

      let text = args.join(" ");
      if (!text) {
        return conn.sendMessage(
          chatId,
          {
            text: `Masukkan lagu yang ingin dicari.\nContoh: *${prefix}play migration of bird ardie son*`,
          },
          { quoted: message }
        );
      }

      let vid = (await ytsearch(text)).video[0];
      if (!vid) {
        return conn.sendMessage(
          chatId,
          { text: "❌ Lagu tidak ditemukan. Coba judul lain!" },
          { quoted: message }
        );
      }

      let { title, videoId, durationH, viewH, publishedTime } = vid;
      let url = `https://youtu.be/${videoId}`;
      let thumb = `https://i.ytimg.com/vi/${videoId}/0.jpg`;

      let caption = 
        `${head} ${Obrack} Now Playing ${Cbrack}\n` +
        `${side} ${btn} *Judul:* ${title}\n` +
        `${side} ${btn} *Durasi:* ${durationH}\n` +
        `${side} ${btn} *Views:* ${viewH}\n` +
        `${side} ${btn} *Upload:* ${publishedTime}\n` +
        `${side} ${btn} *Link:* ${url}\n` +
        `${foot}${garis}`

      await conn.sendMessage(
        chatId,
        { image: { url: thumb }, caption },
        { quoted: message }
      );

      let { audio } = await ytmp3(url);
      let audioBuffer = await (await fetch(audio)).buffer();

      await conn.sendMessage(
        chatId,
        {
          audio: audioBuffer,
          mimetype: "audio/mp4",
          fileName: `${title}.mp3`,
        },
        { quoted: message }
      );
    } catch (err) {
      console.error(err);
      conn.sendMessage(
        message.chat,
        { text: "⚠️ Terjadi kesalahan saat memproses permintaan!" },
        { quoted: message }
      );
    }
  },
};