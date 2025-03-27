module.exports = {
  name: 'Eval',
  command: ['>', '=>', '~>'],
  tags: 'Owner Menu',
  desc: 'Mengeksekusi kode JavaScript secara langsung',

  run: async (conn, message) => {
    try {
      const chatId = message.key.remoteJid;
      const senderId = chatId.endsWith('@g.us')
        ? message.key.participant
        : chatId.replace(/:\d+@/, '@');
      const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';

      const prefix = ['>', '=>', '~>'].find((p) => textMessage.startsWith(p));
      if (!prefix) return;

      if (!global.ownerNumber.includes(senderId.replace(/\D/g, ''))) {
        return conn.sendMessage(chatId, { text: '❌ Hanya owner yang dapat menggunakan perintah ini!' }, { quoted: message });
      }

      const code = textMessage.slice(prefix.length).trim();
      if (!code) {
        return conn.sendMessage(chatId, { text: '⚠️ Harap masukkan kode JavaScript yang ingin dijalankan!' }, { quoted: message });
      }

      try {
        let result;
        if (prefix === '~>') {
          console.log('🟢 Debug:', code);
          result = await eval(`(async () => { console.log = (msg) => conn.sendMessage(chatId, { text: String(msg) }); ${code} })()`);
        } else if (prefix === '=>') {
          result = await eval(`(async () => ${code})()`);
        } else {
          result = await eval(`(async () => { ${code} })()`);
        }

        const output = typeof result === 'object' ? JSON.stringify(result, null, 2) : result;
        const response = output !== undefined ? `✅ *Output:*\n\`\`\`${output}\`\`\`` : '✅ *Kode berhasil dijalankan tanpa output.*';

        conn.sendMessage(chatId, { text: response }, { quoted: message });
      } catch (err) {
        conn.sendMessage(chatId, { text: `❌ *Error:* ${err.message}` }, { quoted: message });
      }
    } catch (error) {
      console.error('Eval Error:', error);
      conn.sendMessage(message.key.remoteJid, {
        text: `❌ *Gagal menjalankan perintah!*\nError: ${error.message}`
      });
    }
  }
};