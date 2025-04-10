const fs = require('fs');
const path = require('path');
const catatanPath = path.join(__dirname, '../../toolkit/db/catatan.json');

module.exports = {
  name: 'editcatat',
  command: ['catat'],
  tags: 'Tools Menu',
  desc: 'Menambahkan isi ke dalam nama catatan',

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

    if (!fs.existsSync(catatanPath)) fs.writeFileSync(catatanPath, '{}');
    const catatan = JSON.parse(fs.readFileSync(catatanPath));

    if (!args[0]) return conn.sendMessage(chatId, { text: `Contoh: ${prefix}catat NamaCatatan TeksCatatan` }, { quoted: message });
    const nama = args.shift();
    if (!catatan[nama]) return conn.sendMessage(chatId, { text: `Catatan *${nama}* tidak ditemukan.` }, { quoted: message });

    let isiCatatan;
    if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
      isiCatatan = message.message.extendedTextMessage.contextInfo.quotedMessage.conversation
        || message.message.extendedTextMessage.contextInfo.quotedMessage.extendedTextMessage?.text
        || 'Tidak ada teks di reply.';
    } else {
      isiCatatan = args.join(' ');
    }

    if (!isiCatatan) return conn.sendMessage(chatId, { text: 'Teks catatan tidak boleh kosong.' }, { quoted: message });

    const key = `catatan${Object.keys(catatan[nama]).length + 1}`;
    catatan[nama][key] = isiCatatan;
    fs.writeFileSync(catatanPath, JSON.stringify(catatan, null, 2));
    conn.sendMessage(chatId, { text: `Berhasil menambahkan isi ke *${nama}*.` }, { quoted: message });
  }
};