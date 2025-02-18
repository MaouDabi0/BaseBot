const path = require('path');
const fs = require('fs');
const recentMessages = new Set();

// Buat alias untuk modul setting.js
const settingPath = path.join(__dirname, '../../toolkit/setting.js');
const { getWaktu, UI, ...setting } = require(settingPath);

module.exports = {
  name: ['menu'],
  tags: ['Main Menu'],
  command: ['menu', '.menu'],

  run: async (conn, m) => {
    try {
      if (!m?.key) return;

      const { remoteJid: sender, id: messageId } = m.key;
      const commandUsed = m.message?.conversation || m.message?.extendedTextMessage?.text || '';

      console.log("Perintah yang digunakan:", commandUsed);
      console.log("Daftar perintah:", module.exports.command);

      if (!sender || !messageId || !commandUsed) return;
      if (recentMessages.has(messageId)) return;

      const usedPrefix = module.exports.command.find(cmd => commandUsed.toLowerCase().startsWith(cmd));
      if (!usedPrefix) {
        console.log("Perintah tidak dikenali.");
        return;
      }

      console.log("Perintah dikenali, memproses...");
      recentMessages.add(messageId);
      await sendMenu(conn, sender, usedPrefix, m);

      setTimeout(() => recentMessages.delete(messageId), 5000);
    } catch (error) {
      console.error("❌ Error di menu.js:", error);
    }
  }
};

async function sendMenu(conn, sender, usedPrefix, m) {
  const waktu = getWaktu();
  const fitur = 10;
  const hitCmd = 5;
  const cover = setting.thumbnail || 'https://via.placeholder.com/300';
  const info = `Selamat ${waktu} @${sender.split('@')[0]}, berikut daftar menu yang tersedia:\n`;

  let menuText = `${UI.garis} ${UI.Lhead} Selamat ${waktu} @${sender.split('@')[0]} ${UI.Rhead}\n`;
  menuText += `${UI.neck} ${setting.botFullName}\n${UI.neck} adalah Simple Bot WhatsApp\n`;
  menuText += `${UI.neck}\n`;
  menuText += `${UI.neck} ${UI.side} Total Fitur: ${fitur}\n`;
  menuText += `${UI.neck} ${UI.side} Total Cmd: ${hitCmd} Kali\n`;
  menuText += `${UI.neck} ${UI.side} Type: ${setting.tipe}\n`;
  menuText += `${UI.neck} ${UI.side} Sc: Hubungi Owner\n`;
  menuText += `${UI.neck} ${UI.side} Ch: ${setting.chshort}\n`;
  menuText += `${UI.neck}\n${UI.Bhead}`.trim();

  const all_menu = `🔥 Menu Bot 🔥\n\n${menuText}\n\nTerima kasih telah menggunakan bot ini!`;

  try {
    console.log("Mengirim menu...");
    await conn.sendMessage(sender, { text: `${info}\n\n${all_menu}` }, { quoted: m });
    console.log("Menu berhasil dikirim.");
  } catch (err) {
    console.error("❌ Gagal mengirim menu:", err);
  }
                            }
