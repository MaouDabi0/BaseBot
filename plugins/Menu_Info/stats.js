const os = require('os');
const { execSync } = require('child_process');
const { Format } = require('../../toolkit/helper');
const { performance } = require('perf_hooks');

module.exports = {
  name: 'stats',
  command: ['stats', 'info', 'st', 'ping', 'device'],
  tags: 'Info Menu',
  desc: 'Menampilkan status device dan statik bot',

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

      const chatList = conn.store?.chats ? Object.values(conn.store.chats) : [];
      const totalChat = chatList.length;
      const totalGroupChat = chatList.filter(c => c.id.endsWith('@g.us')).length;
      const totalPrivateChat = totalChat - totalGroupChat;

      global.commandCount = (global.commandCount || 0) + 1;
      const totalCmd = global.commandCount;

      const thumbnail = global.thumbnail;

      const uptime = process.uptime();
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      const platform = os.platform();
      const architecture = os.arch();
      const botName = global.botName || 'Bot';
      const cpuInfo = os.cpus()[0]?.model || 'Tidak diketahui';

      let totalDisk = 'Tidak diketahui';
      let usedDisk = 'Tidak diketahui';
      let freeDisk = 'Tidak diketahui';
      try {
        const diskInfo = execSync('df -h /storage/emulated', { encoding: 'utf8' }).split('\n')[1].split(/\s+/);
        totalDisk = diskInfo[1];
        usedDisk = diskInfo[2];
        freeDisk = diskInfo[3];
      } catch (e) {
        console.error('❌ Gagal mendapatkan informasi penyimpanan:', e.message);
      }

      const statsMessage = `
Ini adalah status dari bot ${botName}

Stats Bot${Obrack} *${botFullName}* ${Cbrack}
┃
┣ ${btn} *Bot Name:* ${botName}
┣ ${btn} *Time Server:* ${Format.time()}
┣ ${btn} *Uptime:* ${Format.uptime(uptime)}
┖ ${btn} *Respon:* ${responseTime} ms

Stats Chat
┃
┖ ${btn} *Total Chat:* ${totalChat}
   ┣ ${btn} *Private:* ${totalPrivateChat}
   ┣ ${btn} *Group:* ${totalGroupChat}
   ┖ ${btn} *Total Cmd:* ${totalCmd}

Stats System
┃
┣ ${btn} *Platform:* ${platform} (${architecture})
┣ ${btn} *Cpu:* ${cpuInfo}
┣ ${btn} *Ram:* ${(usedMemory / 1024 / 1024).toFixed(2)} MB / ${(totalMemory / 1024 / 1024).toFixed(2)} MB
┖ ${btn} *Storage:* ${usedDisk} / ${totalDisk} (Free: ${freeDisk})
      `.trim();

      const adReply = {
        text: statsMessage,
        contextInfo: {
          externalAdReply: {
            title: "Bot Stats",
            body: "Ini adalah statistik bot",
            thumbnailUrl: thumbnail,
            sourceUrl: "https://github.com/maoudabi0",
            mediaType: 1,
            renderLargerThumbnail: true,
            showAdAttribution: true
          },
          forwardingScore: 19,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363310100263711@newsletter',
            serverMessageId: 152
          }
        }
      };

      await conn.sendMessage(remoteJid, adReply, { quoted: message });

    } catch (err) {
      console.error('❌ Error pada plugin stats:', err.message);
    }
  }
};