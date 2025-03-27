const fs = require('fs');
const path = require('path');
const config = require('../../toolkit/set/config.json');

module.exports = {
  name: 'settoko',
  command: ['settoko'],
  tags: 'Shop Menu',
  desc: 'Mengatur atau menulis barang dan harga ke dalam toko.json',

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

    if (!config.ownerSetting.ownerNumber.includes(senderId.replace(/\D/g, ''))) {
      return conn.sendMessage(chatId, { text: '❌ Fitur ini hanya dapat digunakan oleh Owner bot!' }, { quoted: message });
    }

    const tokoName = args.shift();
    const itemName = args.shift();
    const itemPrice = args.shift();

    if (!tokoName || !itemName || !itemPrice) {
      return conn.sendMessage(chatId, { text: "❌ Format: settoko <nama_toko> <nama_barang> <harga>" }, { quoted: message });
    }

    const tokoPath = './toolkit/set/toko.json';
    let tokoData;
    try {
      tokoData = JSON.parse(fs.readFileSync(tokoPath, 'utf-8'));
    } catch (err) {
      return conn.sendMessage(chatId, { text: "❌ Gagal membaca file tokoon" }, { quoted: message });
    }

    if (!tokoData.storeSetting[tokoName]) {
      return conn.sendMessage(chatId, { text: "❌ Toko tidak ditemukan" }, { quoted: message });
    }

    tokoData.storeSetting[tokoName].push({ name: itemName, price: itemPrice });
    fs.writeFileSync(tokoPath, JSON.stringify(tokoData, null, 2));

    await conn.sendMessage(chatId, { 
      text: `✅ Barang *"${itemName}"* dengan harga *${itemPrice}* berhasil ditambahkan ke toko *"${tokoName}"*!`
    }, { quoted: message });
  }
};