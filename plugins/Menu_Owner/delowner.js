const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '../../toolkit/set/config.json');

module.exports = {
  name: 'delowner',
  command: ['delowner', 'rmow'],
  tags: 'Owner Menu',

  run: async (conn, message, { isPrefix }) => {
    const textMessage = message.message?.conversation || '';
    const chatId = message.key.remoteJid;
    const sender = message.key.participant || message.key.remoteJid;

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

    // Validasi hanya owner yang bisa menghapus owner
    if (!config.ownerSetting.ownerNumber.includes(sender.replace(/\D/g, ''))) {
      return conn.sendMessage(chatId, { text: 'Hanya owner yang dapat menggunakan perintah ini' }, { quoted: message });
    }

    if (!args[1]) {
      return conn.sendMessage(chatId, { text: 'Masukkan nomor owner yang ingin dihapus' }, { quoted: message });
    }

    let number = args[1].replace(/\D/g, '');
    if (!number.startsWith('62')) number = '62' + number;

    const index = config.ownerSetting.ownerNumber.indexOf(number);
    if (index === -1) {
      return conn.sendMessage(chatId, { text: 'Nomor tidak ditemukan dalam daftar owner' }, { quoted: message });
    }

    config.ownerSetting.ownerNumber.splice(index, 1);

    try {
      const fd = fs.openSync(configPath, 'w');
      fs.writeFileSync(fd, JSON.stringify(config, null, 2), 'utf-8');
      fs.fsyncSync(fd);
      fs.closeSync(fd);

      conn.sendMessage(chatId, { text: `Nomor ${number} telah dihapus dari daftar owner` }, { quoted: message });
    } catch (err) {
      console.error('Gagal menyimpan config:', err);
      conn.sendMessage(chatId, { text: 'Gagal menyimpan perubahan ke config.json' }, { quoted: message });
    }
  }
};