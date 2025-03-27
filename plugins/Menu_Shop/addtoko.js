const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'addtoko',
  command: ['addtoko'],
  tags: 'Shop Menu',
  desc: 'Menambahkan nama toko ke dalam daftar toko dan membuat file plugin toko',

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

    const config = require('../../toolkit/set/config.json');
    if (!config.ownerSetting.ownerNumber.includes(senderId.replace(/\D/g, ''))) {
      return conn.sendMessage(chatId, { text: 'Hanya owner yang dapat menggunakan perintah ini' }, { quoted: message });
    }

    const tokoName = args.join(' ').trim();
    if (!tokoName) {
      return conn.sendMessage(chatId, { text: "❌ Masukkan nama toko yang ingin ditambahkan!" }, { quoted: message });
    }

    const tokoPath = './toolkit/set/toko.json';
    const pluginFolder = './plugins/Menu_Toko';

    let tokoData;
    try {
      tokoData = JSON.parse(fs.readFileSync(tokoPath, 'utf-8'));
    } catch (err) {
      console.error('Error membaca toko.json:', err);
      return conn.sendMessage(chatId, { text: "❌ Gagal membaca file toko.json" }, { quoted: message });
    }

    if (!tokoData.storeSetting) tokoData.storeSetting = {};

    if (tokoData.storeSetting[tokoName]) {
      return conn.sendMessage(chatId, { text: "⚠️ Toko sudah ada dalam daftar." }, { quoted: message });
    }

    tokoData.storeSetting[tokoName] = [];
    fs.writeFileSync(tokoPath, JSON.stringify(tokoData, null, 2));

    if (!fs.existsSync(pluginFolder)) fs.mkdirSync(pluginFolder, { recursive: true });

    const tokoPluginPath = path.join(pluginFolder, `${tokoName}.js`);
    const tokoPluginCode = `
const fs = require('fs');

module.exports = {
  name: '${tokoName}',
  command: ['${tokoName}'],
  tags: 'Toko Menu',
  desc: 'Menampilkan toko ${tokoName}',

  run: async (conn, message, { isPrefix }) => {
    const chatId = message.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    const senderId = isGroup ? message.key.participant : chatId.replace(/:\\d+@/, '@');

    const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';

    if (!textMessage) return;

    const prefix = isPrefix.find(p => textMessage.startsWith(p));
    if (!prefix) return;

    const args = textMessage.slice(prefix.length).trim().split(/\\s+/);
    const commandText = args.shift().toLowerCase();

    if (!module.exports.command.includes(commandText)) return;

    const tokoPath = './toolkit/set/toko.json';
    let tokoData;
    try {
      tokoData = JSON.parse(fs.readFileSync(tokoPath, 'utf-8'));
    } catch (err) {
      return conn.sendMessage(chatId, { text: "❌ Gagal membaca file toko.json" }, { quoted: message });
    }

    const items = tokoData.storeSetting['${tokoName}'];
    if (!items || items.length === 0) {
      return conn.sendMessage(chatId, { text: "Toko ini belum memiliki barang." }, { quoted: message });
    }

    const sortedItems = items.sort((a, b) => a.name.localeCompare(b.name));

    const itemList = sortedItems.map((item, index) => \`\${side} \${btn} \${index + 1}. \${item.name}: \${item.price}\n\`).join('');
    
    conn.sendMessage(chatId, { 
      text: \`Selamat datang di toko ${tokoName}!\n\n\${head}\${Obrack} Daftar ${tokoName} \${Cbrack}\n\${itemList}\${foot}\`
    }, { quoted: message });
  }
};`;

    fs.writeFileSync(tokoPluginPath, tokoPluginCode);

    await conn.sendMessage(chatId, { 
      text: `✅ Toko *"${tokoName}"* berhasil ditambahkan!\n📁 File toko dibuat di *plugins/Menu_Toko/${tokoName}.js*`
    }, { quoted: message });

    await conn.sendMessage(chatId, { text: "🔄 Bot akan restart dalam 3 detik..." }, { quoted: message });

    setTimeout(() => {
      process.exit(1);
    }, 3000);
  }
};