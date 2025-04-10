const fs = require('fs');
const configPath = './toolkit/set/config.json';

function getConfig() {
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

module.exports = {
  name: 'setlogic',
  command: ['setlogic'],
  tags: 'Ai Menu',
  desc: 'Menyetel/menseting logika AI',

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

    const ownerNumbers = getConfig().ownerSetting.ownerNumber;
    if (!ownerNumbers.includes(senderId.replace(/\D/g, ''))) {
      return conn.sendMessage(chatId, { text: '❌ Hanya owner yang dapat menggunakan perintah ini.' }, { quoted: message });
    }

    if (args.length === 0) {
      const config = getConfig();
      const botName = config.botSetting.botName || 'Bot'; // fallback kalau botName kosong
      const currentLogic = config.botSetting.logic || 'Belum disetel.';

      return conn.sendMessage(chatId, {
        text: `⚙️ Gunakan perintah:\n${prefix}setlogic [teks logika]\n\n📌 Contoh:\n${prefix}setlogic Ini adalah logika baru.\n\n*Logika saat ini (${botName}):*\n${currentLogic}`
      }, { quoted: message });
    }

    const newLogic = args.join(" ");

    try {
      let config = getConfig();
      config.botSetting.logic = newLogic;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      conn.sendMessage(chatId, { text: `✅ Logika AI berhasil diubah menjadi:\n\n"${newLogic}"` }, { quoted: message });
    } catch (error) {
      conn.sendMessage(chatId, { text: "⚠️ Terjadi kesalahan saat menyimpan pengaturan!" }, { quoted: message });
    }
  }
};