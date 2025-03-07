const fs = require('fs');
const configPath = './toolkit/set/config.json';

module.exports = {
  name: 'Buy',
  command: ['beli', 'buy'],
  tags: 'Shop Menu',

  run: async (conn, message, { args, isPrefix }) => {
    try {
      const textMessage = message.message?.conversation || '';

      const prefix = isPrefix.find(p => textMessage.startsWith(p));
      if (!prefix) return;

      const commandText = textMessage.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase();
      if (!module.exports.command.includes(commandText)) return;

      if (!fs.existsSync(configPath)) {
        return conn.sendMessage(
          message.key.remoteJid,
          { text: "❌ Konfigurasi toko tidak ditemukan." },
          { quoted: message }
        );
      }

      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (!args[0] || isNaN(args[0])) {
        return conn.sendMessage(
          message.key.remoteJid,
          {
            text: `⚠️ Gunakan format *${prefix}beli <nomor produk>*\nLihat daftar produk dengan *${prefix}shop*.`
          },
          { quoted: message }
        );
      }

      let index = parseInt(args[0]) - 1;
      if (!global.sewaList[index]) {
        return conn.sendMessage(
          message.key.remoteJid,
          { text: "❌ Produk tidak ditemukan!" },
          { quoted: message }
        );
      }

      let product = global.sewaList[index];
      await conn.sendMessage(
        message.key.remoteJid,
        {
          text: `✅ Kamu telah membeli *${product.name}* seharga Rp${product.price.toLocaleString()}.`
        },
        { quoted: message }
      );
    } catch (err) {
      console.error("❌ Error di plugin buy.js:", err);
    }
  }
};
