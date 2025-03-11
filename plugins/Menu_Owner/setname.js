const fs = require("fs");
const configPath = "./toolkit/set/config.json";

module.exports = {
  name: "setname",
  command: ["setname", "setbotfullname"],
  tags: ["Owner Menu"],
  desc: 'Mengatur nama bot',

  run: async (conn, message, { isPrefix }) => {
    try {
      const chatId = message.key.remoteJid;
      const isGroup = chatId.endsWith("@g.us");
      const senderId = isGroup ? message.key.participant : chatId.replace(/:\d+@/, "@");
      const textMessage =
        message.message?.conversation ||
        message.message?.extendedTextMessage?.text ||
        "";

      if (!textMessage) return;

      const prefix = isPrefix.find((p) => textMessage.startsWith(p));
      if (!prefix) return;

      const args = textMessage.slice(prefix.length).trim().split(/\s+/).slice(1);
      const commandText = textMessage.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase();
      if (!module.exports.command.includes(commandText)) return;

      if (!args.length) {
        return conn.sendMessage(chatId, { text: "❌ Masukkan nama baru untuk bot!" }, { quoted: message });
      }

      let newName = args.join(" ");
      let config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

      if (commandText === "setname") {
        config.botSetting.botName = newName;
      } else if (commandText === "setbotfullname") {
        config.botSetting.botFullName = newName;
      }

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      conn.sendMessage(
        chatId,
        { text: `✅ *Nama bot berhasil diubah!*\n📌 Nama baru: *${newName}*` },
        { quoted: message }
      );

      setTimeout(() => {
        process.exit(1);
      }, 2000);
    } catch (err) {
      console.error(err);
      conn.sendMessage(chatId, { text: "⚠️ Terjadi kesalahan saat mengubah nama bot!" }, { quoted: message });
    }
  },
  limit: 1,
};