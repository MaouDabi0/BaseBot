const fs = require('fs');
const path = require('path');
const catatanPath = path.join(__dirname, '../../toolkit/db/catatan.json');

module.exports = {
  name: 'catatan',
  command: ['listcatatan', 'catatanlist', 'liat'],
  tags: 'Info Menu',
  desc: 'Menampilkan daftar atau isi catatan',

  run: async (conn, message, { isPrefix }) => {
    const chatId = message.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    const senderId = isGroup ? message.key.participant : chatId.replace(/:\d+@/, '@');
    const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';

    if (!textMessage) return;

    const prefix = isPrefix.find((p) => textMessage.startsWith(p));
    if (!prefix) return;

    const args = textMessage.slice(prefix.length).trim().split(/\s+/);
    const commandText = args.shift().toLowerCase();
    if (!module.exports.command.includes(commandText)) return;

    if (!fs.existsSync(catatanPath)) {
      return conn.sendMessage(chatId, { text: 'Belum ada catatan.' }, { quoted: message });
    }
    const catatan = JSON.parse(fs.readFileSync(catatanPath));

    if (commandText === 'listcatatan' || commandText === 'catatanlist') {
      const list = Object.keys(catatan).map((nama, idx) => `${idx + 1}. ${nama}`).join('\n');
      conn.sendMessage(chatId, { text: `Daftar semua catatan:\n\n${list}` }, { quoted: message });
    } else if (commandText === 'liat') {
      const nama = args[0];
      if (!nama) {
        return conn.sendMessage(chatId, { text: 'Masukkan nama catatan yang ingin dilihat.\nContoh: .liat catatan1' }, { quoted: message });
      }
      if (!catatan[nama]) {
        return conn.sendMessage(chatId, { text: `Catatan *${nama}* tidak ditemukan.` }, { quoted: message });
      }
      const listIsi = Object.values(catatan[nama]).map((isi, idx) => `${idx + 1}. ${isi}`).join('\n');
      conn.sendMessage(chatId, { text: `Isi catatan *${nama}*:\n\n${listIsi}` }, { quoted: message });
    }
  }
};