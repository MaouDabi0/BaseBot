const os = require('os');
const { exec } = require('child_process');
const { isPrefix } = require("../../toolkit/setting");
const { Format } = require('../../toolkit/helper');

module.exports = {
  name: 'stats',
  command: ['stats', 'info', 'st', 'device'],
  category: 'Info',

  run: async (conn, message) => {
    try {
      const remoteJid = message?.key?.remoteJid;
      if (!remoteJid) return console.error('❌ JID tidak valid atau tidak ditemukan!');

      const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';

      // Cek prefix yang digunakan
      const prefix = isPrefix.find(p => textMessage.startsWith(p));
      if (!prefix) return;

      const args = textMessage.slice(prefix.length).trim().split(/\s+/);
      const commandText = args[0]?.toLowerCase();
      if (!module.exports.command.includes(commandText)) return;

      const uptime = process.uptime();
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      const platform = os.platform();
      const architecture = os.arch();
      const botName = global.botName || 'Bot';
      const cpuInfo = os.cpus()[0]?.model || 'Tidak diketahui';

      let storageInfo = 'Sedang memuat...';
      exec('df -h ~', async (err, stdout) => {
        if (!err) storageInfo = stdout.trim();

        const statsMessage = `
*Stats ${botName}*
📱 *Nama Bot:* ${botName}
🕒 *Waktu Server:* ${Format.time()}
⏲️ *Uptime:* ${Format.uptime(uptime)}

💻 *Platform:* ${platform} (${architecture})
⚙️ *CPU:* ${cpuInfo}

📂 *Memori:*
RAM: ${(usedMemory / 1024 / 1024).toFixed(2)} MB / ${(totalMemory / 1024 / 1024).toFixed(2)} MB

💾 *Penyimpanan:*
${storageInfo}
        `.trim();

        await conn.sendMessage(remoteJid, { text: statsMessage }, { quoted: message });
      });

    } catch (err) {
      console.error('❌ Error pada plugin stats:', err.message);
    }
  }
};