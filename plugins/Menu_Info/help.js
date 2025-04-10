const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'help',
  command: ['help', 'info'],
  tags: 'Info Menu',
  desc: 'Menampilkan informasi tentang command yang tersedia.',

  run: async (conn, message, { isPrefix }) => {
    const chatId = message?.key?.remoteJid;
    const senderId = message.key.participant || chatId.replace(/:\d+@/, '@');

    const textMessage =
      message.message?.conversation ||
      message.message?.extendedTextMessage?.text ||
      '';
    if (!textMessage) return;

    const prefix = isPrefix.find((p) => textMessage.startsWith(p));
    if (!prefix) return;

    const args = textMessage.slice(prefix.length).trim().split(/\s+/);
    const commandText = args.shift().toLowerCase();
    if (!module.exports.command.includes(commandText)) return;

    if (!args.length) {
      return conn.sendMessage(chatId, { text: `Gunakan perintah: ${prefix}help <name>` }, { quoted: message });
    }

    const pluginsDir = path.join(__dirname, '..'); 
    const categories = fs.readdirSync(pluginsDir).filter(folder => fs.lstatSync(path.join(pluginsDir, folder)).isDirectory());
    
    let foundPlugin = null;
    for (const category of categories) {
      const files = fs.readdirSync(path.join(pluginsDir, category)).filter(file => file.endsWith('.js'));
      for (const file of files) {
        const plugin = require(path.join(pluginsDir, category, file));
        if (plugin.name && plugin.name.toLowerCase() === args[0].toLowerCase()) {
          foundPlugin = plugin;
          break;
        }
      }
      if (foundPlugin) break;
    }

    if (!foundPlugin) {
      return conn.sendMessage(chatId, { text: `Command dengan nama *${args[0]}* tidak ditemukan.` }, { quoted: message });
    }

    const { name, command, desc } = foundPlugin;
    const commandList = command.map(cmd => `${prefix}${cmd}`).join(', ');
    const description = desc || 'Tidak ada deskripsi.';

    const helpMessage = `*Informasi Command*\n` +
      `${btn} *Nama:* ${name}\n` +
      `${btn} *Command:* ${commandList}\n` +
      `${btn} *Deskripsi:* ${description}\n` +
      `${btn} *Penggunaan:* ${prefix}${command[0]} [opsional]`;

    conn.sendMessage(chatId, { text: helpMessage }, { quoted: message });
  }
};