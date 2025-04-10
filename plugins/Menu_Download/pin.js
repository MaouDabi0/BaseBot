const axios = require('axios');
const { generateWAMessageContent, generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys');

module.exports = {
  name: 'pinterest',
  command: ['pinterest', 'pin'],
  tags: 'Download Menu',
  desc: 'Mencari gambar dari Pinterest berdasarkan query.',

  run: async (conn, message, { isPrefix }) => {
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

    const text = args.join(' ');
    if (!text) {
      return conn.sendMessage(chatId, { text: `Contoh:\n${prefix}pin anime` }, { quoted: message });
    }

    await conn.sendMessage(chatId, { react: { text: '🔎', key: message.key } });

    async function createImage(url) {
      const { imageMessage } = await generateWAMessageContent({
        image: { url }
      }, {
        upload: conn.waUploadToServer
      });
      return imageMessage;
    }

    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }

    try {
      let { data } = await axios.get(`https://www.pinterest.com/resource/BaseSearchResource/get/?source_url=%2Fsearch%2Fpins%2F%3Fq%3D${encodeURIComponent(text)}&data=%7B%22options%22%3A%7B%22isPrefetch%22%3Afalse%2C%22query%22%3A%22${encodeURIComponent(text)}%22%2C%22scope%22%3A%22pins%22%2C%22no_fetch_context_on_resource%22%3Afalse%7D%2C%22context%22%3A%7B%7D%7D`);
      let results = data?.resource_response?.data?.results;

      if (!results || results.length === 0) {
        return conn.sendMessage(chatId, { text: 'Tidak ada hasil ditemukan.' }, { quoted: message });
      }

      let res = results.map(v => v.images.orig.url);
      shuffleArray(res);
      let ult = res.splice(0, 5);
      let push = [];
      let i = 1;

      for (let img of ult) {
        push.push({
          body: proto.Message.InteractiveMessage.Body.fromObject({
            text: `Image ke-${i++}`
          }),
          footer: proto.Message.InteractiveMessage.Footer.fromObject({
            text: text
          }),
          header: proto.Message.InteractiveMessage.Header.fromObject({
            title: 'Pinterest Result',
            hasMediaAttachment: true,
            imageMessage: await createImage(img)
          }),
          nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({})
        });
      }

      const msg = generateWAMessageFromContent(chatId, {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2
            },
            interactiveMessage: proto.Message.InteractiveMessage.fromObject({
              body: proto.Message.InteractiveMessage.Body.create({
                text: 'Berikut hasil pencarian Pinterest kamu:'
              }),
              footer: proto.Message.InteractiveMessage.Footer.create({
                text: global.namaowner
              }),
              header: proto.Message.InteractiveMessage.Header.create({
                hasMediaAttachment: false
              }),
              carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                cards: [...push]
              })
            })
          }
        }
      }, {});

      await conn.relayMessage(chatId, msg.message, { messageId: msg.key.id });

    } catch (e) {
      console.error(e);
      await conn.sendMessage(chatId, { text: 'Terjadi kesalahan saat mencari gambar.' }, { quoted: message });
    }
  }
};