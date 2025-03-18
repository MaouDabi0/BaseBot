const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '../../toolkit/set/config.json');

module.exports = {
  name: 'public',
  command: ['public'],
  tags: 'Owner Menu',
  desc: 'Mengatur mode publik bot',

  run: async (conn, message, { isPrefix }) => {
    try {
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

      if (!global.ownerNumber.includes(senderId.replace(/\D/g, ''))) {
        return conn.sendMessage(
          chatId,
          { text: '❌ Hanya owner yang dapat menggunakan perintah ini.' },
          { quoted: message }
        );
      }

      if (!args[1] || !['on', 'off'].includes(args[1].toLowerCase())) {
        return conn.sendMessage(
          chatId,
          { text: '⚠ Gunakan perintah: .public on/off' },
          { quoted: message }
        );
      }

      const status = args[1].toLowerCase() === 'on';

      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      config.botSetting.public = status;

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      global.public = status;

      conn.sendMessage(
        chatId,
        { text: `✅ Mode publik telah ${status ? 'diaktifkan' : 'dimatikan'}` },
        { quoted: message }
      );
    } catch (error) {
      console.error('Error mengubah mode publik:', error);
      conn.sendMessage(chatId, { text: '❌ Terjadi kesalahan!' }, { quoted: message });
    }
  }
};