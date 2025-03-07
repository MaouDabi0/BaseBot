const os = require('os');
const { Format } = require('../../toolkit/helper');
const { performance } = require('perf_hooks');

module.exports = {
  name: 'stats',
  command: ['stats', 'info', 'st', 'device'],
  tags: 'Info Menu',

  run: async (conn, message, { isPrefix }) => {
    try {
      const remoteJid = message?.key?.remoteJid;
      if (!remoteJid) return console.error('❌ JID tidak valid atau tidak ditemukan!');

      const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';

      const startTime = performance.now();
      const endTime = performance.now();
      const responseTime = (endTime - startTime).toFixed(2);

      const prefix = isPrefix.find(p => textMessage.startsWith(p));
      if (!prefix) return;

      const args = textMessage.slice(prefix.length).trim().split(/\s+/);
      const commandText = args[0]?.toLowerCase();
      if (!module.exports.command.includes(commandText)) return;

      const totalChat = conn.chats ? Object.keys(conn.chats).length : 0;
      const totalGroupChat = conn.chats ? Object.values(conn.chats).filter(c => c.id.endsWith('@g.us')).length : 0;
      const totalPrivateChat = totalChat - totalGroupChat;

      let totalCmd = (global.commandCount || 0) + 1;

      const uptime = process.uptime();
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      const platform = os.platform();
      const architecture = os.arch();
      const botName = global.botName || 'Bot';
      const cpuInfo = os.cpus()[0]?.model || 'Tidak diketahui';

      const statsMessage = `
Ini adalah status dari bot ${botName}

Stats Bot ${Obrack} *${botFullName}* ${Cbrack}
┃
┣ ${btn} *Bot Name:* ${botName}
┣ ${btn} *Time Server:* ${Format.time()}
┣ ${btn} *Uptime:* ${Format.uptime(uptime)}
┖ ${btn} *Respon:* ${responseTime} ms

Stats Chat
┃
┖ ${btn} *Total Chat:* ${totalChat}
   ┣ ${btn} *Private:* ${totalGroupChat}
   ┣ ${btn} *Group:* ${totalGroupChat}
   ┖ ${btn} *Total Cmd:* ${totalCmd}

Stats System
┃
┣ ${btn} *Platform:* ${platform} (${architecture})
┣ ${btn} *Cpu:* ${cpuInfo}
┖ ${btn} *Ram:* ${(usedMemory / 1024 / 1024).toFixed(2)} MB / ${(totalMemory / 1024 / 1024).toFixed(2)} MB
      `.trim();

      const adReply = {
        text: statsMessage,
        contextInfo: {
          externalAdReply: {
            title: "Bot Stats",
            body: "Klik untuk bergabung ke grup!",
            thumbnailUrl: "https://files.catbox.moe/7t0628.jpg",
            sourceUrl: "https://chat.whatsapp.com/GZTv7EZGOiL4E41Z0A4rgn",
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      };

      await conn.sendMessage(remoteJid, adReply, { quoted: message });

    } catch (err) {
      console.error('❌ Error pada plugin stats:', err.message);
    }
  }
};