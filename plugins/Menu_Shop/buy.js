const fs = require('fs');
const tokoPath = './toolkit/set/toko.json';

module.exports = {
  name: 'Buy',
  command: ['beli', 'buy'],
  tags: 'Shop Menu',
  desc: 'Membeli barang dari <toko>',

  run: async (conn, message, { args, isPrefix }) => {
    try {
      const chatId = message.key.remoteJid;
      const isGroup = chatId.endsWith('@g.us');
      const senderId = isGroup ? message.key.participant : chatId.replace(/:\d+@/, '@');
      const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';

      if (!textMessage) return;

      const prefix = isPrefix.find(p => textMessage.startsWith(p));
      if (!prefix) return;

      const commandText = textMessage.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase();
      if (!module.exports.command.includes(commandText)) return;

      if (!fs.existsSync(tokoPath)) {
        return conn.sendMessage(chatId, { text: "❌ File toko.json tidak ditemukan." }, { quoted: message });
      }

      const tokoData = JSON.parse(fs.readFileSync(tokoPath, 'utf8'));
      if (!tokoData.storeSetting) {
        return conn.sendMessage(chatId, { text: "⚠️ Tidak ada toko yang terdaftar!" }, { quoted: message });
      }

      if (args.length < 2) {
        return conn.sendMessage(chatId, {
          text: `⚠️ Gunakan format *${prefix}buy <NamaToko> <NamaBarang>*\nLihat daftar toko dengan *${prefix}shop*.`
        }, { quoted: message });
      }

      const tokoName = args[0];
      const barangName = args.slice(1).join(' ');

      if (!tokoData.storeSetting[tokoName]) {
        return conn.sendMessage(chatId, { text: `❌ Toko *${tokoName}* tidak ditemukan!` }, { quoted: message });
      }

      const tokoItems = tokoData.storeSetting[tokoName];
      const barang = tokoItems.find(item => item.name.toLowerCase() === barangName.toLowerCase());

      if (!barang) {
        return conn.sendMessage(chatId, { text: `❌ Barang *${barangName}* tidak ditemukan di toko *${tokoName}*.` }, { quoted: message });
      }

      await conn.sendMessage(chatId, {
        text: `✅ Kamu telah membeli *${barang.name}* dari *${tokoName}* seharga Rp${barang.price.toLocaleString()}.`
      }, { quoted: message });

    } catch (err) {
      console.error("❌ Error di plugin buy.js:", err);
      conn.sendMessage(chatId, { text: "❌ Terjadi kesalahan, coba lagi nanti." }, { quoted: message });
    }
  }
};