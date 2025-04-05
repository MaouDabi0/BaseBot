const axios = require('axios');
const uploadImage = require('../../toolkit/scrape/uploadImage.js');
const { webp2png } = require('../../toolkit/scrape/webp2mp4.js');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { writeFileSync, readFileSync } = require('fs');
const { tmpdir } = require('os');
const { exec } = require('child_process');
const path = require('path');

module.exports = {
  name: 'qc',
  command: ['qc', 'quoted', 'quotly'],
  tags: 'Tools Menu',
  desc: 'Membuat quoted stiker',

  async run(conn, message, { isPrefix }) {
    const chatId = message.key.remoteJid;
    const isGroup = chatId.endsWith("@g.us");
    const senderId = isGroup ? message.key.participant : chatId.replace(/:\d+@/, "@");
    const pushName = message.pushName || "Pengguna WhatsApp";

    const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
    if (!textMessage) return;

    const prefix = isPrefix.find((p) => textMessage.startsWith(p));
    if (!prefix) return;

    const args = textMessage.slice(prefix.length).trim().split(/\s+/).slice(1);
    const commandText = textMessage.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase();
    if (!module.exports.command.includes(commandText)) return;

    if (textMessage.length > 100) return conn.sendMessage(chatId, { text: "Maksimal 100 karakter!" });

    let ppKosong = "https://nauval.mycdn.biz.id/download/1738516198286.jpeg"; 
    let pp = await conn.profilePictureUrl(senderId, "image").catch(() => ppKosong);

    conn.sendMessage(chatId, { react: { text: "🕛", key: message.key } });

    // **Menghitung ukuran berdasarkan panjang teks**
    const text = args.join(" ") || textMessage;
    const words = text.split(" ").length;
    const charCount = text.length;
    const lineCount = Math.ceil(charCount / 20); // Estimasi jumlah baris berdasarkan karakter

    // **Lebar menyesuaikan panjang teks, tinggi menyesuaikan jumlah baris**
    let width = Math.min(600 + words * 12, 850);  // Lebar meningkat dengan kata (maks 850px)
    let height = Math.min(300 + lineCount * 40, 500); // Tinggi meningkat dengan baris (maks 500px)

    let obj = {
      type: "quote",
      format: "png",
      backgroundColor: "#ffffffff",
      width,
      height,
      scale: 3,
      messages: [
        {
          entities: [],
          avatar: true,
          from: { id: 1, name: pushName, photo: { url: pp } },
          text,
          replyMessage: {},
        },
      ],
    };

    if (message.message.extendedTextMessage?.contextInfo?.quotedMessage) {
      const quotedMessage = message.message.extendedTextMessage.contextInfo.quotedMessage;
      const quotedType = Object.keys(quotedMessage)[0];

      if (quotedType === "conversation" || quotedType === "extendedTextMessage") {
        obj.messages[0].replyMessage = {
          name: await conn.getName(message.message.extendedTextMessage.contextInfo.participant),
          text: quotedMessage[quotedType].text || "",
          chatId: chatId.split("@")[0],
        };
      } else if (quotedType === "stickerMessage" || quotedType === "imageMessage") {
        let img = await downloadMediaMessage(quotedMessage);
        let up = quotedType === "stickerMessage" ? await webp2png(img) : await uploadImage(img);
        obj.messages[0].media = { url: up };
      }
    }

    try {
      const buffer = await generateQuotly(obj);
      const webpBuffer = await convertToWebp(buffer, width, height);
      await sendImageAsSticker(conn, chatId, webpBuffer, message);
    } catch (error) {
      conn.sendMessage(chatId, { text: "Gagal membuat kutipan." });
    }
  },
};

async function generateQuotly(obj) {
  try {
    const response = await axios.post("https://bot.lyo.su/quote/generate", obj, {
      headers: { "Content-Type": "application/json" },
    });

    const imageBase64 = response.data.result.image;
    if (!imageBase64) throw new Error("No image result found.");
    return Buffer.from(imageBase64, "base64");
  } catch (error) {
    console.error("Quotly error:", error);
    throw new Error("Failed to generate the quote image.");
  }
}

async function convertToWebp(buffer, width, height) {
  return new Promise((resolve, reject) => {
    const tmpPath = path.join(tmpdir(), `quote_${Date.now()}.png`);
    const outputPath = path.join(tmpdir(), `quote_${Date.now()}.webp`);
    
    writeFileSync(tmpPath, buffer);

    exec(
      `ffmpeg -i "${tmpPath}" -vf "scale=${width}:${height}:flags=lanczos" -c:v libwebp -lossless 1 -qscale 100 "${outputPath}"`,
      (err) => {
        if (err) return reject(err);
        resolve(readFileSync(outputPath));
      }
    );
  });
}

async function sendImageAsSticker(conn, chatId, webpBuffer, message) {
  await conn.sendMessage(chatId, { 
    sticker: webpBuffer,
    mimetype: "image/webp",
    packname: "Dabi Chan",
    author: "Quoted Sticker"
  }, { quoted: message });
}