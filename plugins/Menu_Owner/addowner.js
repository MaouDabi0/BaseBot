const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '../../toolkit/set/config.json');

module.exports = {
  name: 'addowner',
  command: ['addowner', 'adow'],
  tags: 'Owner Menu',
  desc: 'Menambah owner bot',

  run: async (conn, message, { isPrefix }) => {
    const chatId = message?.key?.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    const senderId = isGroup ? message.key.participant : chatId;
    const mtype = Object.keys(message.message || {})[0];
    const textMessage =
      (mtype === 'conversation' && message.message?.conversation) ||
      (mtype === 'extendedTextMessage' && message.message?.extendedTextMessage?.text) ||
      '';

    if (!textMessage) return;

    const prefix = isPrefix.find(p => textMessage.startsWith(p));
    if (!prefix) return;

    const args = textMessage.slice(prefix.length).trim().split(/\s+/);
    const commandText = args[0]?.toLowerCase();
    if (!module.exports.command.includes(commandText)) return;

    let config;
    try {
      const configData = fs.readFileSync(configPath, 'utf-8');
      config = JSON.parse(configData);
    } catch (err) {
      console.error('Gagal membaca config:', err);
      return conn.sendMessage(chatId, { text: 'Gagal membaca config.json' }, { quoted: message });
    }

    if (!global.ownerNumber.includes(senderId.replace(/\D/g, ''))) {
      return conn.sendMessage(chatId, { text: 'Hanya owner yang dapat menggunakan perintah ini' }, { quoted: message });
    }

    if (!args[1]) {
      return conn.sendMessage(chatId, { text: 'Masukkan nomor yang akan dijadikan owner' }, { quoted: message });
    }

    let number = args[1].replace(/\D/g, '');
    if (!number.startsWith('62')) number = '62' + number;

    if (config.ownerSetting.ownerNumber.includes(number)) {
      return conn.sendMessage(chatId, { text: 'Nomor sudah terdaftar' }, { quoted: message });
    }

    config.ownerSetting.ownerNumber.push(number);

    try {
      const fd = fs.openSync(configPath, 'w');
      fs.writeFileSync(fd, JSON.stringify(config, null, 2), 'utf-8');
      fs.fsyncSync(fd);
      fs.closeSync(fd);

      conn.sendMessage(chatId, { text: `Nomor ${number} sudah ditambahkan sebagai owner` }, { quoted: message });
    } catch (err) {
      console.error('Gagal menyimpan config:', err);
      conn.sendMessage(chatId, { text: 'Gagal menyimpan perubahan ke config.json' }, { quoted: message });
    }
  }
};