const path = require('path');
const fs = require('fs');

const recentMessages = new Set();

// **Load Config dengan Error Handling**
const configPath = path.join(__dirname, '../../toolkit/set/config.json');
let config = { type: 'Default' };

try {
  if (fs.existsSync(configPath)) {
    config = require(configPath);
  }
} catch (error) {
  console.error("❌ Gagal membaca config.json:", error);
}

// **Ambil Setting dari Config**
const setting = {
  chshort: config.chshort || 'Tidak tersedia',
  footer: config.footer || 'Footer default',
  sosmed: config.sosmed || 'https://example.com',
  tipe: config.type || 'Default',
  botNickName: config.botNickName || 'Bot',
};

module.exports = {
  name: ['menu'],
  tags: ['Main Menu'],
  command: ['menu', '.menu'],

  run: async (conn, m) => {
    try {
      if (!m?.key) return;

      const { remoteJid: sender, id: messageId } = m.key;
      const commandUsed = m.message?.conversation || m.message?.extendedTextMessage?.text || '';

      if (!sender || !messageId || !commandUsed) return;
      if (recentMessages.has(messageId)) return; // **Cegah Spam**

      const usedPrefix = module.exports.command.find(cmd => commandUsed.startsWith(cmd));
      if (!usedPrefix) return;

      recentMessages.add(messageId);
      await sendMenu(conn, sender, usedPrefix, m);

      // **Hapus Pesan dari Set setelah 5 Detik**
      setTimeout(() => recentMessages.delete(messageId), 5000);
    } catch (error) {
      console.error("❌ Error di menu.js:", error);
    }
  }
};

// **Variabel Tampilan Menu**
const UI = {
  Rhead: '⫎',
  Lhead: '⫍',
  Bhead: '╰──────────ᯓ',
  garis: '╭╼',
  neck: '│',
  side: '➥'
};

// **Fungsi Mendapatkan Waktu**
const getWaktu = () => {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 12) return 'Pagi';
  if (hour >= 12 && hour < 18) return 'Siang';
  if (hour >= 18 && hour < 24) return 'Malam';
  return 'Dini Hari';
};

// **Fungsi Kirim Menu**
async function sendMenu(conn, sender, usedPrefix, m) {
  const waktu = getWaktu();
  const fitur = 10; // **Jumlah fitur (bisa diganti dengan perhitungan nyata)**
  const hitCmd = 5; // **Jumlah perintah yang telah digunakan user**

  let menuText = `${UI.garis} ${UI.Lhead} Selamat ${waktu} @${sender.split('@')[0]} ${UI.Rhead}\n`;
  menuText += `${UI.neck} ${UI.side} ${setting.botNickName} adalah Simple Bot WhatsApp\n`;
  menuText += `${UI.neck}\n`;
  menuText += `${UI.neck} ${UI.side} 📌 Total Fitur: ${fitur}\n`;
  menuText += `${UI.neck} ${UI.side} 📊 Total Cmd: ${hitCmd} Kali\n`;
  menuText += `${UI.neck} ${UI.side} 🔹 Type: ${setting.tipe}\n`;
  menuText += `${UI.neck} ${UI.side} 🔗 Sc: Hubungi Owner\n`;
  menuText += `${UI.neck} ${UI.side} 🎥 Ch: ${setting.chshort}\n`;
  menuText += `${UI.neck}\n${UI.Bhead}`.trim();

  await conn.sendMessage(sender, { text: menuText }, { quoted: m });
      }
