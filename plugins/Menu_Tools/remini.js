const remini = require('../../toolkit/scrape/remini');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {
  name: 'remini',
  command: ['remini'],
  tags: 'Tools Menu',

  run: async (conn, message, { isPrefix }) => {
    try {
      const messageText =
        message.body ||
        message.message?.conversation ||
        message.message?.extendedTextMessage?.text ||
        message.message?.imageMessage?.caption ||
        '';

      if (!messageText) return;

      const prefix = isPrefix.find(p => messageText.startsWith(p));
      if (!prefix) return;

      const args = messageText.slice(prefix.length).trim().split(/\s+/);
      const commandText = args[0]?.toLowerCase();
      if (!module.exports.command.includes(commandText)) return;

      const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const isImage = quotedMessage?.imageMessage;

      if (!isImage) {
        return conn.sendMessage(
          message.key.remoteJid,
          {
            text: `Balas gambar dengan caption *${prefix}remini [mode]*\n\nMode tersedia:\n- enhance\n- recolor\n- dehaze`,
          },
          { quoted: message }
        );
      }

      let media;
      try {
        media = await downloadMediaMessage({ message: quotedMessage }, 'buffer', {});
        if (!media) throw new Error('Media tidak terunduh!');
      } catch (error) {
        return conn.sendMessage(
          message.key.remoteJid,
          { text: `❌ Gagal mengunduh media! ${error.message}` },
          { quoted: message }
        );
      }

      await conn.sendMessage(message.key.remoteJid, { react: { text: '🕒', key: message.key } });

      const mode = (args[1] || 'enhance').toLowerCase(); // args[1] adalah mode
      let result;
      try {
        result = await remini(media, mode);
        if (!result) throw new Error('Gagal memproses gambar.');
      } catch (error) {
        return conn.sendMessage(
          message.key.remoteJid,
          { text: `❌ Gagal memproses gambar! ${error.message}` },
          { quoted: message }
        );
      }

      await conn.sendMessage(message.key.remoteJid, { image: result, caption: `Berhasil! Mode: *${mode}*` }, { quoted: message });
    } catch (error) {
      conn.sendMessage(
        message.key.remoteJid,
        { text: `❌ Terjadi kesalahan saat memproses gambar, coba lagi! ${error.message}` },
        { quoted: message }
      );
      console.error('❌ Error pada plugin remini:', error);
    }
  }
};