const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'autotyping',
  command: ['autotyping', 'at'],
  tags: 'Owner Menu',
  desc: 'Mengatur autotyping bot',

  run: async (conn, message, { isPrefix }) => {
    const chatId = message.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    const senderId = isGroup ? message.key.participant : chatId.replace(/:\d+@/, '@');
    const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';

    if (!textMessage) return;

    const prefix = isPrefix.find(p => textMessage.startsWith(p));
    if (!prefix) return;

    const args = textMessage.slice(prefix.length).trim().split(/\s+/).slice(1);
    const commandText = textMessage.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase();
    if (!module.exports.command.includes(commandText)) return;

    const configPath = path.join(__dirname, '../../toolkit/set/config.json');

    let config;
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (error) {
      return conn.sendMessage(chatId, { text: '❌ Gagal membaca konfigurasi bot.' }, { quoted: message });
    }

    if (!config.ownerSetting.ownerNumber.includes(senderId.replace(/@s.whatsapp.net$/, ''))) {
      return conn.sendMessage(chatId, { text: '❌ Fitur ini hanya dapat digunakan oleh Owner bot!' }, { quoted: message });
    }

    if (!args[0]) {
      return conn.sendMessage(chatId, {
        text: `🔹 *Status Auto Typing:* ${config.botSetting.autoTyping ? '✅ Aktif' : '❌ Nonaktif'}\n\n➤ *Gunakan:*\n${prefix}autotyping on/off ➝ Atur Auto Typing`
      }, { quoted: message });
    }

    let state = args[0].toLowerCase();

    if (!['on', 'off'].includes(state)) {
      return conn.sendMessage(chatId, { text: `❌ Gunakan *on* atau *off*` }, { quoted: message });
    }

    config.botSetting.autoTyping = state === 'on';

    try {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    } catch (error) {
      return conn.sendMessage(chatId, { text: '❌ Gagal menyimpan konfigurasi.' }, { quoted: message });
    }

    global.autoTyping = config.botSetting.autoTyping;

    conn.sendMessage(chatId, { text: `✅ Auto Typing telah *${state === 'on' ? 'diaktifkan' : 'dinonaktifkan'}*!` }, { quoted: message });
  }
};