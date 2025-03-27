const { ytsearch, ytmp3, ytmp4 } = require('ruhend-scraper');
const fetch = require('node-fetch');

module.exports = {
  name: 'youtube',
  command: ['ytsearch', 'yts', 'ytmp3', 'yta', 'ytaudio', 'ytmp4', 'ytv'],
  tags: 'Download Menu',
  desc: 'Download audio, video, atau mencari video dari YouTube',

  run: async (conn, message) => {
    try {
      const chatId = message.key.remoteJid;
      const isGroup = chatId.endsWith('@g.us');
      const senderId = isGroup ? message.key.participant : chatId.replace(/:\d+@/, '@');
      const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';

      if (!textMessage) return;

      const prefix = isPrefix.find((p) => textMessage.startsWith(p));
      if (!prefix) return;

      const args = textMessage.slice(prefix.length).trim().split(/\s+/);
      const commandText = args.shift().toLowerCase();
      if (!module.exports.command.includes(commandText)) return;

      if (['ytsearch', 'yts'].includes(commandText)) {
        if (!args.length) {
          return conn.sendMessage(chatId, { text: `Masukkan info yang ingin dicari!\nContoh: *${prefix}${commandText} laila canggung*` }, { quoted: message });
        }
        const { video, channel } = await ytsearch(args.join(' '));
        const sthumb = "https://qu.ax/OcWmv.jpeg";
        const teks = [...video, ...channel].map(v => {
          switch (v.type) {
            case 'video':
              return `🎀 *${v.title}*\n🔗 ${v.url}\n🕒 Duration: ${v.durationH}\n📅 Uploaded: ${v.publishedTime}\n📈 ${v.view} views`;
            case 'channel':
              return `🎀 *${v.channelName}*\n🔗 ${v.url}\n📛 _${v.subscriberH} Subscriber_\n🎥 ${v.videoCount} video`;
          }
        }).filter(Boolean).join('\n\n───────────────────\n\n');

        await conn.sendMessage(chatId, { text: `*Salin link YouTube-nya*\nKetik *${prefix}ytmp3 [link]* untuk audio\nKetik *${prefix}ytmp4 [link]* untuk video\n\n${teks}` }, { quoted: message });
        return;
      }

      if (['ytmp3', 'yta', 'ytaudio'].includes(commandText)) {
        if (!args[0]) {
          return conn.sendMessage(chatId, { text: `Masukkan link YouTube!\nContoh: *${prefix}${commandText} https://youtu.be/MvsAesQ-4zA*` }, { quoted: message });
        }

        const { title, audio, thumbnail } = await ytmp3(args[0]);
        const media = await (await fetch(audio)).buffer();

        await conn.sendMessage(chatId, { text: `🎵 Mengunduh audio dari *${title}*...` }, { quoted: message });
        await conn.sendMessage(chatId, { audio: media, mimetype: 'audio/mpeg', ptt: false }, { quoted: message });
        return;
      }

      if (['ytmp4', 'ytv'].includes(commandText)) {
        if (!args[0]) {
          return conn.sendMessage(chatId, { text: `Masukkan link YouTube!\nContoh: *${prefix}${commandText} https://youtu.be/MvsAesQ-4zA*` }, { quoted: message });
        }

        const { title, video, author, description, duration, views, upload, thumbnail } = await ytmp4(args[0]);
        let caption = `📹 *YouTube Video*\n⭔ *Judul:* ${title}\n⭔ *Author:* ${author}\n⭔ *Deskripsi:* ${description}\n⭔ *Durasi:* ${duration}\n⭔ *Views:* ${views}\n⭔ *Upload:* ${upload}`;
        
        await conn.sendMessage(chatId, { image: { url: thumbnail }, caption }, { quoted: message });
        await conn.sendMessage(chatId, { video: { url: video }, caption }, { quoted: message });
        return;
      }
      
    } catch (error) {
      console.error(error);
      conn.sendMessage(message.key.remoteJid, { text: 'Terjadi kesalahan saat memproses permintaan. Coba lagi nanti!' }, { quoted: message });
    }
  }
}