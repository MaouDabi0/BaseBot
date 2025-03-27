const fs = require('fs');
const config = require('../../toolkit/set/config.json');

module.exports = {
  name: 'delbarang',
  command: ['delbarang', 'deleteitem', 'dropitem'],
  tags: 'Shop Menu',
  desc: 'Menghapus barang dari toko di toko.json',

  run: async (conn, message, { isPrefix }) => {
    const chatId = message.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    const senderId = isGroup ? message.key.participant : chatId.replace(/\D/g, '');
    const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';

    if (!textMessage) return;

    const prefix = isPrefix.find(p => textMessage.startsWith(p));
    if (!prefix) return;

    const args = textMessage.slice(prefix.length).trim().split(/\s+/);
    const commandText = args.shift().toLowerCase();

    if (!module.exports.command.includes(commandText)) return;

    if (!config.ownerSetting.ownerNumber.includes(senderId.replace(/\D/g, ''))) {
      return conn.sendMessage(chatId, { text: '❌ Fitur ini hanya dapat digunakan oleh Owner bot!' }, { quoted: message });
    }

    const tokoName = args.shift();
    const itemName = args.join(' ').trim();

    if (!tokoName || !itemName) {
      return conn.sendMessage(chatId, { text: '❌ Masukkan nama toko dan barang yang ingin dihapus!' }, { quoted: message });
    }

    const tokoPath = './toolkit/set/toko.json';

    let tokoData;
    try {
      tokoData = JSON.parse(fs.readFileSync(tokoPath, 'utf-8'));
    } catch (err) {
      return conn.sendMessage(chatId, { text: '❌ Gagal membaca file toko.json' }, { quoted: message });
    }

    if (!tokoData.storeSetting[tokoName]) {
      return conn.sendMessage(chatId, { text: `❌ Toko *${tokoName}* tidak ditemukan!` }, { quoted: message });
    }

    const items = tokoData.storeSetting[tokoName];
    const itemIndex = items.findIndex(item => item.name.toLowerCase() === itemName.toLowerCase());

    if (itemIndex === -1) {
      return conn.sendMessage(chatId, { text: `❌ Barang *${itemName}* tidak ditemukan di toko *${tokoName}*` }, { quoted: message });
    }

    items.splice(itemIndex, 1);
    tokoData.storeSetting[tokoName] = items;

    fs.writeFileSync(tokoPath, JSON.stringify(tokoData, null, 2));

    await conn.sendMessage(chatId, { text: `✅ Barang *${itemName}* berhasil dihapus dari toko *${tokoName}*` }, { quoted: message });
  }
};