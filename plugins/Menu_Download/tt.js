const { getTiktokVideo } = require('../../toolkit/scrape/tiktok.js');

module.exports = {
  name: 'tiktok',
  command: ['tiktok', 'tt'],
  tags: 'Download Menu',
  desc: 'Download video dari TikTok tanpa watermark.',

  async run(conn, message, { isPrefix }) {
    const chatId = message?.key?.remoteJid;
    const senderId = message.key.participant || chatId;
    const textMessage =
      message.message?.conversation ||
      message.message?.extendedTextMessage?.text ||
      "";

    if (!textMessage) return;

    const prefix = isPrefix.find((p) => textMessage.startsWith(p));
    if (!prefix) return;

    const args = textMessage.slice(prefix.length).trim().split(/\s+/);
    const commandText = args.shift().toLowerCase();
    if (!module.exports.command.includes(commandText)) return;

    if (!args[0]) {
      return conn.sendMessage(chatId, { text: `Example:\n${prefix}${commandText} https://vt.tiktok.com/ZSF4cWcA2/` }, { quoted: message });
    }

    if (!args[0].includes('tiktok.com')) {
      return conn.sendMessage(chatId, { text: `Link yang kamu kirim tidak valid.` }, { quoted: message });
    }

    await conn.sendMessage(chatId, { react: { text: '🕒', key: message.key } });

    try {
      const result = await getTiktokVideo(args[0]);

      let txt = '乂  *TIKTOK - DOWNLOADER*\n';
      txt += `\n◦ *Title* : ${result.title}`;
      txt += `\n◦ *User* : ${result.author.nickname} (@${result.author.unique_id})`;
      txt += `\n◦ *Durasi* : ${result.duration}s`;
      txt += `\n◦ *Likes* : ${result.digg_count.toLocaleString()}`;
      txt += `\n◦ *Views* : ${result.play_count.toLocaleString()}`;
      txt += `\n◦ *Shares* : ${result.share_count.toLocaleString()}`;
      txt += `\n◦ *Comments* : ${result.comment_count.toLocaleString()}`;
      txt += `\n◦ *Download* : Tanpa Watermark`;

      await conn.sendMessage(chatId, {
        video: { url: 'https://tikwm.com' + result.play },
        caption: txt
      }, { quoted: message, ephemeralExpiration: message.expiration });

    } catch (err) {
      console.error(err);
      conn.sendMessage(chatId, { text: 'Maaf, terjadi kesalahan saat memproses video.' }, { quoted: message });
    }
  }
}