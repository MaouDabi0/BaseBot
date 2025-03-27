const { exec } = require('child_process');

module.exports = {
  name: 'Shell',
  command: ['sh', '$', 'shell'],
  tags: 'Owner Menu',
  desc: 'Menjalankan perintah shell di server',

  run: async (conn, message) => {
    try {
      const chatId = message.key.remoteJid;
      const senderId = chatId.endsWith('@g.us') 
        ? message.key.participant 
        : chatId.replace(/:\d+@/, '@');
      const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';

      if (!textMessage) return;

      const args = textMessage.trim().split(/\s+/).slice(1);
      const commandText = textMessage.trim().split(/\s+/)[0].toLowerCase();
      if (!module.exports.command.includes(commandText)) return;

      if (!global.ownerNumber.includes(senderId.replace(/\D/g, ''))) {
        return conn.sendMessage(chatId, { text: '❌ Hanya owner yang dapat menggunakan perintah ini!' }, { quoted: message });
      }

      if (args.length === 0) {
        return conn.sendMessage(chatId, { text: '⚠️ Harap masukkan perintah shell yang valid!' }, { quoted: message });
      }

      const shellCommand = args.join(' ');

      exec(shellCommand, (error, stdout, stderr) => {
        if (error) {
          return conn.sendMessage(chatId, { text: `❌ *Error:* ${error.message}` }, { quoted: message });
        }
        if (stderr) {
          return conn.sendMessage(chatId, { text: `⚠️ *Stderr:* ${stderr}` }, { quoted: message });
        }
        conn.sendMessage(chatId, { text: `✅ *Output:*\n${stdout || 'Perintah berhasil dijalankan tanpa output.'}` }, { quoted: message });
      });

    } catch (error) {
      console.error('Shell Error:', error);
      conn.sendMessage(message.key.remoteJid, {
        text: `❌ *Gagal menjalankan perintah!*\nError: ${error.message}`
      });
    }
  }
};