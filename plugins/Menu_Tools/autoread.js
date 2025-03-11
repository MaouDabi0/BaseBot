const fs = require('fs');
const path = require('path');
const { isPrefix } = require('../../toolkit/setting');

module.exports = {
  name: 'autoread',
  command: ['autoread', 'ad'],
  tags: 'Owner Menu',
  desc: 'Setting autoread gc/private',

  run: async (conn, message, options = {}) => {
    const chatId = message.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    const senderId = isGroup ? message.key.participant : chatId.replace(/:\d+@/, '@');
    const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';

    if (!textMessage) return;

    const prefix = isPrefix.find(p => textMessage.startsWith(p));
    if (!prefix) return;

    const args = textMessage.slice(prefix.length).trim().split(/\s+/).slice(1);
    const commandText = textMessage.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase();
    if (!module.exports.command.includes(commandText)) return;

    const configPath = path.join(__dirname, '../../toolkit/set/config.json');

    let config;
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (error) {
      return conn.sendMessage(chatId, { text: '❌ Gagal membaca konfigurasi bot.' }, { quoted: message });
    }

    if (!config.ownerSetting.ownerNumber.includes(senderId.replace(/\D/g, ''))) {
      return conn.sendMessage(chatId, { text: '❌ Fitur ini hanya dapat digunakan oleh Owner bot!' }, { quoted: message });
    }

    if (!args[0]) {
      return conn.sendMessage(chatId, {
        text: `🔹 *Status Auto Read:*\n` +
              `- Group: ${config.botSetting.autoread.group ? '✅ Aktif' : '❌ Nonaktif'}\n` +
              `- Private: ${config.botSetting.autoread.private ? '✅ Aktif' : '❌ Nonaktif'}\n\n` +
              `➤ *Gunakan:*\n` +
              `${prefix}autoread group on/off\n` +
              `${prefix}autoread private on/off\n\n` +
              `Contoh:\n${prefix}autoread group on\n${prefix}autoread private off`
      }, { quoted: message });
    }

    let type = args[0].toLowerCase();
    let state = args[1]?.toLowerCase();

    if (!['group', 'private'].includes(type)) {
      return conn.sendMessage(chatId, { text: `❌ Gunakan *${prefix}autoread group on/off* atau *${prefix}autoread private on/off*` }, { quoted: message });
    }

    if (!['on', 'off'].includes(state)) {
      return conn.sendMessage(chatId, { text: `❌ Gunakan *on* atau *off*` }, { quoted: message });
    }

    config.botSetting.autoread[type] = state === 'on';

    try {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    } catch (error) {
      return conn.sendMessage(chatId, { text: '❌ Gagal menyimpan konfigurasi.' }, { quoted: message });
    }

    global.readGroup = config.botSetting.autoread.group;
    global.readPrivate = config.botSetting.autoread.private;

    conn.sendMessage(chatId, { text: `✅ Auto Read untuk *${type}* telah *${state === 'on' ? 'diaktifkan' : 'dinonaktifkan'}*!` }, { quoted: message });
  }
};