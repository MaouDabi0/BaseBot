const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../../toolkit/db/database.json');

const readDB = () => {
  if (!fs.existsSync(dbPath)) return { autoai: [] };
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
};

const writeDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

module.exports = {
  name: 'resetaichat',
  command: ['resetaichat', 'resetai'],
  tags: 'Ai Menu',
  desc: 'Mereset data Auto-AI pada pengguna atau grup (Hanya Owner).',

  run: async (conn, message, { isPrefix }) => {
    try {
      const chatId = message?.key?.remoteJid;
      const senderId = message?.key?.participant || chatId;
      const textMessage = message.message?.conversation || 
                          message.message?.extendedTextMessage?.text || 
                          '';
      const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.participant;

      if (!textMessage) return;

      const prefix = isPrefix.find((p) => textMessage.startsWith(p));
      if (!prefix) return;

      const args = textMessage.slice(prefix.length).trim().split(/\s+/);
      const commandText = args.shift()?.toLowerCase();
      if (!module.exports.command.includes(commandText)) return;

      if (!global.ownerNumber.includes(senderId.replace(/\D/g, ''))) {
        return conn.sendMessage(chatId, { 
          text: '⚠️ Hanya owner yang dapat menggunakan perintah ini.' }, { quoted: message });
      }

      if (args.length < 1) {
        return conn.sendMessage(chatId, {
          text: `📌 *Cara penggunaan:*\n\n${prefix}resetaichat group (id grup)\n${prefix}resetaichat pengguna (nomor) atau reply pesan pengguna.` }, { quoted: message });
      }

      let db = readDB();
      if (!Array.isArray(db.autoai)) db.autoai = [];

      const type = args[0]?.toLowerCase();
      let targetId;

      if (type === 'pengguna') {
        if (args.length > 1) {
          targetId = args[1].replace(/\D/g, '');
        } else if (quotedMessage) {
          targetId = quotedMessage.split('@')[0];
        } else {
          return conn.sendMessage(chatId, {
            text: '⚠️ Silakan ketik `.resetaichat pengguna <nomor>` atau reply pesan pengguna yang ingin direset.'
          }, { quoted: message });
        }
      } else if (type === 'group') {
        if (args.length < 2) {
          return conn.sendMessage(chatId, {
            text: `⚠️ Untuk reset grup, masukkan ID grup!\n\nContoh: *${prefix}resetaichat group 1203630253289987*`
          }, { quoted: message });
        }
        targetId = args[1].replace(/\D/g, '');
      } else {
        return conn.sendMessage(chatId, {
          text: `⚠️ Jenis reset tidak valid! Gunakan *pengguna* atau *group*.\n\nContoh: *${prefix}resetaichat pengguna 6281234567890*`
        }, { quoted: message });
      }

      if (!targetId) {
        return conn.sendMessage(chatId, {
          text: '⚠️ ID tidak valid!'
        }, { quoted: message });
      }

      const formattedId = type === 'group' ? `${targetId}@g.us` : `${targetId}@s.whatsapp.net`;

      const entryIndex = db.autoai.findIndex(entry => entry[formattedId]);

      if (entryIndex !== -1) {
        db.autoai.splice(entryIndex, 1);
        writeDB(db);

        return conn.sendMessage(chatId, {
          text: `✅ Data Auto-AI untuk *${type}* dengan ID *${targetId}* telah direset.`
        }, { quoted: message });
      } else {
        return conn.sendMessage(chatId, {
          text: `⚠️ Tidak ditemukan data Auto-AI untuk *${type}* dengan ID *${targetId}*.`
        }, { quoted: message });
      }
      
    } catch (error) {
      conn.sendMessage(chatId, {
        text: `❌ Terjadi kesalahan: ${error.message || error}`
      }, { quoted: message });
    }
  },
};