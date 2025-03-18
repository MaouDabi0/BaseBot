module.exports = {
  name: 'autobio',
  command: ['autobio', 'bio'],
  tags: 'Owner Menu',
  desc: 'Mengatur autobio',

  run: async (conn, message, { isPrefix }) => {
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
        { text: 'Hanya owner yang dapat menggunakan perintah ini.' },
        { quoted: message }
      );
    }

    if (!args[1] || !['on', 'off'].includes(args[1].toLowerCase())) {
      return conn.sendMessage(
        chatId,
        { text: 'Gunakan: .autobio on/off' },
        { quoted: message }
      );
    }

    const status = args[1].toLowerCase() === 'on';
    global.autoBio = status;

    conn.sendMessage(
      chatId,
      { text: `Auto Bio telah ${status ? 'diaktifkan' : 'dimatikan'}` },
      { quoted: message }
    );

    if (status) {
      updateBio(conn);
    }
  },

  updateBio: async (conn) => {
    if (global.bioInterval) clearInterval(global.bioInterval);

    global.bioInterval = setInterval(async () => {
      if (!global.autoBio) {
        clearInterval(global.bioInterval);
        return;
      }

      const uptime = process.uptime();
      const bioText = `${botName} Aktif ${Format.uptime(uptime)}`;

      try {
        await conn.updateProfileStatus(bioText);
      } catch (err) {
        console.error('❌ Gagal memperbarui bio:', err);
      }
    }, 60000);
  }
};