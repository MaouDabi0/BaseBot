const { download, pinDownload } = require('../../toolkit/helper');
const axios = require('axios');
const cheerio = require('cheerio');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'pin',
  command: ['pin'],
  tags: ['Download Menu'],
  desc: "Mendownload media dari pinterest",

  run: async (conn, message, { isPrefix }) => {
    const chatId = message.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    const senderId = isGroup ? message.key.participant : chatId.replace(/\D/g, '');

    const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
    const prefix = isPrefix.find(p => textMessage.startsWith(p));
    if (!prefix) return;

    const args = textMessage.slice(prefix.length).trim().split(/\s+/);
    const commandText = args.shift().toLowerCase();

    if (!module.exports.command.includes(commandText)) return;

    if (args.length === 0) {
      return conn.sendMessage(message.from, '❌ Masukkan nama media atau URL Pinterest.', { quoted: message });
    }

    const input = args.join(' ');

    if (input.startsWith('https://www.pinterest.com/')) {
      await pinDownload(input, conn, message);
    } else {
      try {
        const searchUrl = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(input)}`;
        const response = await axios.get(searchUrl);
        const $ = cheerio.load(response.data);
        const imgSrc = $('img[src^="https://i.pinimg.com"]').first().attr('src');

        if (imgSrc) {
          const fileName = path.basename(imgSrc);
          const tempPath = path.join(__dirname, `../temp/${fileName}`);

          await download(imgSrc, tempPath);

          await conn.sendMessage(message.from, fs.readFileSync(tempPath), { 
            caption: `Berikut adalah gambar terkait: ${input}`, 
            mimetype: 'image/jpeg' 
          });

          fs.unlinkSync(tempPath);
        } else {
          await conn.sendMessage(message.from, '❌ Tidak dapat menemukan gambar terkait.', { quoted: message });
        }
      } catch (error) {
        console.error('❌ Error saat mencari gambar:', error);
        await conn.sendMessage(message.from, '❌ Gagal mencari gambar, coba lagi nanti.', { quoted: message });
      }
    }
  }
};