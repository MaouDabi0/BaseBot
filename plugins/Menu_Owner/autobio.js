const fs = require('fs');
const path = require('path');
const { Format } = require('../../toolkit/helper');

const configPath = path.join(__dirname, '../../toolkit/set/config.json');

module.exports = {
  name: 'autobio',
  command: ['autobio'],
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

    // Hanya owner yang bisa mengaktifkan/mematikan autobio
    if (!config.ownerSetting.ownerNumber.includes(sender.replace(/\D/g, ''))) {
      return conn.sendMessage(chatId, { text: 'Hanya owner yang dapat menggunakan perintah ini' }, { quoted: message });
    }

    if (!args[1] || !['on', 'off'].includes(args[1].toLowerCase())) {
      return conn.sendMessage(chatId, { text: 'Gunakan: .autobio on/off' }, { quoted: message });
    }

    const status = args[1].toLowerCase() === 'on';
    config.botSetting.autoBio = status;

    try {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
      conn.sendMessage(chatId, { text: `Auto Bio telah ${status ? 'diaktifkan' : 'dimatikan'}` }, { quoted: message });

      if (status) {
        updateBio(conn); // Memperbarui bio pertama kali setelah dinyalakan
      }
    } catch (err) {
      console.error('Gagal menyimpan config:', err);
      conn.sendMessage(chatId, { text: 'Gagal menyimpan perubahan ke config.json' }, { quoted: message });
    }
  }
};

// Fungsi untuk memperbarui bio bot setiap beberapa menit
async function updateBio(conn) {
  setInterval(async () => {
    let config;
    try {
      const configData = fs.readFileSync(configPath, 'utf-8');
      config = JSON.parse(configData);
    } catch (err) {
      console.error('Gagal membaca config:', err);
      return;
    }

    if (!config.botSetting.autoBio) return;
    const uptime = process.uptime();

    const bioText = `${botName} Aktif ${Format.uptime(uptime)}`;

    try {
      await conn.updateProfileStatus(bioText);
    } catch (err) {
      console.error('Gagal memperbarui bio:', err);
    }
  }, 60000); // Update setiap 1 menit
}