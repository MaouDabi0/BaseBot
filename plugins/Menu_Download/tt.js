const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = require("@whiskeysockets/baileys");
const tiktoks = require('../../toolkit/scrape/tiktok.js');

module.exports = {
  name: 'TikTok Search',
  command: ['tiktoksearch', 'tt', 'ttsearch'],
  tags: 'Download Menu',
  desc: 'Mencari dan mengunduh video TikTok berdasarkan kata kunci.',

  run: async (conn, message, { isPrefix }) => {
    try {
      const chatId = message.key.remoteJid;
      const isGroup = chatId.endsWith("@g.us");
      const senderId = isGroup ? message.key.participant : chatId.replace(/:\d+@/, "@");
      const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || "";

      if (!textMessage) return;

      const prefix = isPrefix.find((p) => textMessage.startsWith(p));
      if (!prefix) return;

      const args = textMessage.slice(prefix.length).trim().split(/\s+/).slice(1);
      const commandText = textMessage.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase();
      if (!module.exports.command.includes(commandText)) return;

      const inputText = args.join(' ').trim();
      if (!inputText) {
        return conn.sendMessage(chatId, { text: `• *Example :* ${prefix}${commandText} jedag jedug` }, { quoted: message });
      }

      await conn.sendMessage(chatId, { react: { text: '🕐', key: message.key } });

      const kemii = await tiktoks(inputText);
      if (!kemii || !kemii.no_watermark) {
        return conn.sendMessage(chatId, { text: '❌ Video tidak ditemukan atau terjadi kesalahan!' }, { quoted: message });
      }

      const media = await prepareWAMessageMedia({ video: { url: kemii.no_watermark } }, { upload: conn.waUploadToServer });

      const msg = generateWAMessageFromContent(chatId, {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2
            },
            interactiveMessage: proto.Message.InteractiveMessage.create({
              body: proto.Message.InteractiveMessage.Body.create({}),
              footer: proto.Message.InteractiveMessage.Footer.create({
                text: 'Done By Pixel',
              }),
              header: proto.Message.InteractiveMessage.Header.create({
                title: kemii.title,
                hasMediaAttachment: true,
                ...media
              }),
              nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                buttons: [
                  {
                    name: "quick_reply",
                    buttonParamsJson: `{"display_text":"Next Search","id": "${prefix}tiktoksearch ${inputText}"}`
                  }
                ],
              })
            })
          }
        }
      }, { userJid: chatId, quoted: message });

      await conn.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
    } catch (error) {
      conn.sendMessage(message.key.remoteJid, { text: `❌ Terjadi kesalahan! ${error.message}` }, { quoted: message });
      console.error('❌ Error pada plugin TikTok Search:', error);
    }
  }
};