module.exports = {
  name: 'owner',
  command: ['owner', 'contact', 'admin'],
  tags: 'Info Menu',
  desc: 'Mengirim kontak owner bot',

  run: async (conn, msg, { isPrefix }) => {
    try {
      const remoteJid = msg.key.remoteJid;
      const isGroup = remoteJid.endsWith('@g.us');
      const senderId = isGroup ? msg.key.participant : remoteJid.replace(/:\d+@/, '@');
      const textMessage = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';

      if (!textMessage) return;

      const prefix = isPrefix.find(p => textMessage.startsWith(p));
      if (!prefix) return;

      const args = textMessage.slice(prefix.length).trim().split(/\s+/);
      const commandText = args.shift()?.toLowerCase();
      if (!module.exports.command.includes(commandText)) return;

      const owner = global.ownerName || 'Owner';
      const ownerNumber = global.contact;
      const bot = global.botName || 'Bot';

      if (!ownerNumber) {
        console.error('❌ ownerNumber tidak ditemukan. Pastikan config.json terisi dengan benar.');
        await conn.sendMessage(remoteJid, { text: 'Kontak owner tidak tersedia saat ini.' }, { quoted: msg });
        return;
      }

      const contactInfo = {
        contacts: {
          displayName: owner,
          contacts: [{
            vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${owner}\nTEL;type=CELL;type=VOICE;waid=${ownerNumber}:+${ownerNumber}\nEND:VCARD`
          }]
        }
      };

      await conn.sendMessage(remoteJid, contactInfo, { quoted: msg });
      await conn.sendMessage(remoteJid, { text: `Ini adalah kontak owner *${bot}*` }, { quoted: msg });

    } catch (error) {
      console.error('❌ Terjadi kesalahan di plugin owner:', error);
    }
  }
};