const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

module.exports = {
  name: 'backup',
  command: ['backup'],
  tags: 'Owner Menu',
  desc: 'Membackup data bot',

  run: async (conn, message, { isPrefix }) => {
    const chatId = message.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    const senderId = isGroup ? message.key.participant : chatId.replace(/:\d+@/, '@');
    const textMessage =
      message.message?.conversation || message.message?.extendedTextMessage?.text || '';

    if (!textMessage) return;

    const prefix = isPrefix.find((p) => textMessage.startsWith(p));
    if (!prefix) return;

    const args = textMessage.slice(prefix.length).trim().split(/\s+/).slice(1);
    const commandText = textMessage.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase();
    if (!module.exports.command.includes(commandText)) return;

    if (!global.ownerNumber.includes(senderId.replace(/\D/g, ''))) {
      return conn.sendMessage(
        chatId,
        { text: 'Hanya owner yang dapat menggunakan perintah ini' },
        { quoted: message }
      );
    }

    const botName = global.botName.replace(/\s+/g, "_");
    const vers = global.version.replace(/\s+/g, ".");
    const zipFileName = `${botName}-${vers}.zip`;
    const zipFilePath = path.join(__dirname, "..", "..", zipFileName);

    try {
      const zip = new AdmZip();
      const includePaths = [
        "plugins",
        "toolkit",
        "package.json",
        "index.js",
        "main.js",
        "README.md",
        "LICENSE"
      ];

      includePaths.forEach((item) => {
        const itemPath = path.join(__dirname, "..", "..", item);
        if (fs.existsSync(itemPath)) {
          if (fs.lstatSync(itemPath).isDirectory()) {
            zip.addLocalFolder(itemPath, item);
          } else {
            zip.addLocalFile(itemPath);
          }
        }
      });

      zip.writeZip(zipFilePath);

      await conn.sendMessage(chatId, {
        document: fs.readFileSync(zipFilePath),
        mimetype: "application/zip",
        fileName: zipFileName,
        caption: `📦 *Backup berhasil dibuat!*\nBerikut adalah arsip ZIP dari bot.`
      }, { quoted: message });

      setTimeout(() => fs.unlinkSync(zipFilePath), 5000);
    } catch (error) {
      console.error("Backup Error:", error);
      conn.sendMessage(chatId, { text: "❌ *Gagal membuat backup!*" });
    }
  }
};