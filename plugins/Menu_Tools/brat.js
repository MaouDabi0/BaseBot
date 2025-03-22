const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

module.exports = {
  name: 'bratsticker',
  command: ['brat', 'bratvid'],
  tags: 'Tools Menu',
  desc: 'Membuat stiker bart',

  run: async (conn, message, { isPrefix }) => {
    const chatId = message.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    const senderId = isGroup ? message.key.participant : chatId.replace(/:\d+@/, '@');
    const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';

    if (!textMessage) return;

    const prefix = isPrefix.find(p => textMessage.startsWith(p));
    if (!prefix) return;

    const args = textMessage.slice(prefix.length).trim().split(/\s+/);
    const commandText = args.shift().toLowerCase();

    if (!module.exports.command.includes(commandText)) return;

    if (!args.length) {
      return conn.sendMessage(chatId, { 
        text: `Masukkan teks untuk ${commandText === "bratvid" ? "Brat Video" : "Brat Sticker"}!` 
      }, { quoted: message });
    }

    let isVideo = commandText === "bratvid";
    let bratUrl = `https://api.siputzx.my.id/api/m/brat?text=${encodeURIComponent(args.join(" "))}&isVideo=${isVideo}&delay=500`;

    try {
      let response = await axios.get(bratUrl, { 
        responseType: "arraybuffer",
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": isVideo ? "video/mp4,video/webm,video/*,*/*;q=0.8" : "image/png,image/jpeg,image/*,*/*;q=0.8"
        }
      });

      if (!response.data) {
        return conn.sendMessage(chatId, { text: `Gagal mengambil ${isVideo ? "Brat Video" : "Brat Sticker"}. Coba lagi nanti.` }, { quoted: message });
      }

      let inputPath = path.join(__dirname, `../../temp/brat.${isVideo ? "mp4" : "png"}`);
      let outputPath = path.join(__dirname, "../../temp/brat.webp");
      fs.writeFileSync(inputPath, response.data);

      if (isVideo) {
        exec(`ffmpeg -i ${inputPath} -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15" -c:v libwebp -loop 0 -preset default -an -vsync 0 ${outputPath}`, async (error) => {
          if (error) {
            console.error("Error converting to animated WebP:", error);
            return conn.sendMessage(chatId, { text: "Gagal mengubah video ke stiker bergerak." }, { quoted: message });
          }

          let stickerBuffer = fs.readFileSync(outputPath);
          await conn.sendMessage(chatId, { sticker: stickerBuffer }, { quoted: message });

          fs.unlinkSync(inputPath);
          fs.unlinkSync(outputPath);
        });

      } else {
        exec(`ffmpeg -i ${inputPath} -vf "scale=512:512:force_original_aspect_ratio=decrease" -c:v libwebp -lossless 1 ${outputPath}`, async (error) => {
          if (error) {
            console.error("Error converting to WebP:", error);
            return conn.sendMessage(chatId, { text: "Gagal mengubah gambar ke stiker." }, { quoted: message });
          }

          let stickerBuffer = fs.readFileSync(outputPath);
          await conn.sendMessage(chatId, { sticker: stickerBuffer }, { quoted: message });

          fs.unlinkSync(inputPath);
          fs.unlinkSync(outputPath);
        });
      }

    } catch (error) {
      console.error(`Error fetching ${isVideo ? "Brat Video" : "Brat Sticker"}:`, error);
      await conn.sendMessage(chatId, { 
        text: `Gagal mengambil ${isVideo ? "Brat Video" : "Brat Sticker"}. Coba lagi nanti.` 
      }, { quoted: message });
    }
  }
};