const { igdl } = require('ruhend-scraper');

module.exports = {
  name: 'instagram',
  command: ['instagram', 'ig', 'igdl', 'instegrem', 'insta'],
  tags: 'Download Menu',
  desc: 'Mengunduh video atau foto dari Instagram menggunakan link.',

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

      if (!args[0]) {
        return conn.sendMessage(chatId, { text: `Masukkan URL Instagram! Contoh: *${prefix}${commandText} https://www.instagram.com/p/C1Ck8sENM94/*` }, { quoted: message });
      }

      const url = args[0];
      if (!url.match(/(https?:\/\/(?:www\.)?instagram\.[a-z\.]{2,6}\/[\w\-\.]+(\/[^\s]*)?)/g)) {
        return conn.sendMessage(chatId, { text: 'URL tidak valid! Pastikan itu adalah tautan Instagram.' }, { quoted: message });
      }

      await conn.sendMessage(chatId, { text: '⏳ Sedang memproses, mohon tunggu...' }, { quoted: message });

      const res = await igdl(url);
      const data = res.data;

      if (!data || data.length === 0) {
        return conn.sendMessage(chatId, { text: 'Media tidak ditemukan atau URL salah.' }, { quoted: message });
      }

      for (let i = 0; i < Math.min(data.length, 20); i++) {
        const fileName = `${data[i].title?.replace(/[\/:*?"<>|]/g, '') || `instagram_${i + 1}`}.mp4`;
        const caption = data[i].description || 'Video Instagram';

        await new Promise(resolve => setTimeout(resolve, 2000));
        await conn.sendMessage(chatId, { 
          video: { url: data[i].url }, 
          mimetype: 'video/mp4', 
          fileName,
          caption
        }, { quoted: message });
      }

    } catch (error) {
      console.error(error);
      conn.sendMessage(message.key.remoteJid, { text: 'Terjadi kesalahan saat memproses permintaan. Coba lagi nanti!' }, { quoted: message });
    }
  }
}