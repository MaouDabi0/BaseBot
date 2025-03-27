const fs = require('fs');
const path = require('path');
const config = require('../../toolkit/set/config.json');

module.exports = {
  name: 'deltoko',
  command: ['deltoko', 'deletetoko'],
  tags: 'Shop Menu',
  desc: 'Menghapus toko',

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

    if (!config.ownerSetting.ownerNumber.includes(senderId.replace(/\D/g, ''))) {
      return conn.sendMessage(chatId, { text: '❌ Fitur ini hanya dapat digunakan oleh Owner bot!' }, { quoted: message });
    }

    const tokoName = args.join(' ').trim();
    if (!tokoName) {
      return conn.sendMessage(chatId, { text: "❌ Masukkan nama toko yang ingin dihapus!" }, { quoted: message });
    }

    const tokoPath = './toolkit/set/toko.json';
    const pluginFolder = './plugins/Menu_Shop';

    let tokoData;
    try {
      tokoData = JSON.parse(fs.readFileSync(tokoPath, 'utf-8'));
    } catch (err) {
      return conn.sendMessage(chatId, { text: "❌ Gagal membaca file toko.json" }, { quoted: message });
    }

    if (!tokoData.storeSetting || !tokoData.storeSetting[tokoName]) {
      return conn.sendMessage(chatId, { text: "⚠️ Toko tidak ditemukan dalam daftar." }, { quoted: message });
    }

    delete tokoData.storeSetting[tokoName];
    fs.writeFileSync(tokoPath, JSON.stringify(tokoData, null, 2));

    const tokoPluginPath = path.join(pluginFolder, `${tokoName}.js`);
    if (fs.existsSync(tokoPluginPath)) {
      fs.unlinkSync(tokoPluginPath);
    }

    await conn.sendMessage(chatId, { 
      text: `✅ Toko *"${tokoName}"* berhasil dihapus!\n📁 File toko di *plugins/Menu_Shop/${tokoName}.js* juga dihapus.`
    }, { quoted: message });

    await conn.sendMessage(chatId, { text: "🔄 Bot akan restart dalam 3 detik..." }, { quoted: message });

    setTimeout(() => {
      process.exit(1);
    }, 3000);
  }
};