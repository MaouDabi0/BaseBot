
const fs = require('fs');

module.exports = {
  name: 'panel',
  command: ['panel'],
  tags: 'Toko Menu',
  desc: 'Menampilkan toko panel',

  run: async (conn, message, { isPrefix }) => {
    const chatId = message.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    const senderId = isGroup ? message.key.participant : chatId.replace(/:\d+@/, '@');

    const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';

    if (!textMessage) return;

    const prefix = isPrefix.find(p => textMessage.startsWith(p));
    if (!prefix) return;

    const args = textMessage.slice(prefix.length).trim().split(/\s+/);
    const commandText = args.shift().toLowerCase();

    if (!module.exports.command.includes(commandText)) return;

    const tokoPath = './toolkit/set/toko.json';
    let tokoData;
    try {
      tokoData = JSON.parse(fs.readFileSync(tokoPath, 'utf-8'));
    } catch (err) {
      return conn.sendMessage(chatId, { text: "❌ Gagal membaca file toko.json" }, { quoted: message });
    }

    const items = tokoData.storeSetting['panel'];
    if (!items || items.length === 0) {
      return conn.sendMessage(chatId, { text: "Toko ini belum memiliki barang." }, { quoted: message });
    }

    const sortedItems = items.sort((a, b) => a.name.localeCompare(b.name));

    const itemList = sortedItems.map((item, index) => `${side} ${btn} ${index + 1}. ${item.name}: ${item.price}
`).join('');
    
    conn.sendMessage(chatId, { 
      text: `Selamat datang di toko panel!

${head}${Obrack} Daftar panel ${Cbrack}
${itemList}${foot}`
    }, { quoted: message });
  }
};
