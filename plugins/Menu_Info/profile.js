const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'profile',
  command: ['profile', 'profil', 'me'],
  tags: 'Info Menu',
  desc: 'Menampilkan informasi profil pengguna, seperti nama, nomor, dan status akun.',

  run: async (conn, message, { isPrefix }) => {
    try {
      const chatId = message.key.remoteJid;
      const isGroup = chatId.endsWith("@g.us");
      const senderId = isGroup ? message.key.participant : chatId.replace(/:\d+@/, "@");
      const textMessage =
        message.message?.conversation || message.message?.extendedTextMessage?.text || "";

      if (!textMessage) return;

      const prefix = isPrefix.find((p) => textMessage.startsWith(p));
      if (!prefix) return;

      const args = textMessage.slice(prefix.length).trim().split(/\s+/).slice(1);
      const commandText = textMessage.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase();
      if (!module.exports.command.includes(commandText)) return;

      const userName = message.pushName || 'Pengguna';
      const dbPath = path.join(__dirname, "../../toolkit/db/database.json");

      if (!fs.existsSync(dbPath)) {
        return conn.sendMessage(chatId, { text: "⚠️ Database tidak ditemukan!" }, { quoted: message });
      }

      const db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));

      if (!db.Private || typeof db.Private !== "object") {
        return conn.sendMessage(chatId, { text: "⚠️ Database tidak valid atau rusak!" }, { quoted: message });
      }

      const userData = Object.values(db.Private).find((u) => u.Nomor === senderId);

      if (!userData) {
        return conn.sendMessage(chatId, { text: `⚠️ Kamu belum terdaftar di database!\n\nKetik *${prefix}daftar* untuk mendaftar.` }, { quoted: message });
      }

      let premiumText = "Tidak ❌";
      if (userData.premium?.prem) {
        const waktuSekarang = Date.now();
        const waktuAktivasi = userData.premium.activatedAt || waktuSekarang;
        const waktuKadaluarsa = waktuAktivasi + userData.premium.time;

        if (waktuKadaluarsa > waktuSekarang) {
          const waktuSisa = waktuKadaluarsa - waktuSekarang;
          const totalMenit = Math.floor(waktuSisa / (1000 * 60));
          const totalJam = Math.floor(totalMenit / 60);
          const totalHari = Math.floor(totalJam / 24);

          if (totalHari > 0) {
            premiumText = `${totalHari} Hari ${totalJam % 24} Jam ${totalMenit % 60} Menit`;
          } else if (totalJam > 0) {
            premiumText = `${totalJam} Jam ${totalMenit % 60} Menit`;
          } else {
            premiumText = `${totalMenit} Menit`;
          }
        } else {
          premiumText = "Kadaluarsa ❗";
        }
      }

      let profileText = `${head}${Obrack} Profil ${userName} ${Cbrack}\n`;
      profileText += `${side} ${btn} *Nomor:* ${userData.Nomor.replace(/@s\.whatsapp\.net$/, "")}\n`;
      profileText += `${side} ${btn} *Auto AI:* ${userData.autoai ? "Aktif ✅" : "Nonaktif ❌"}\n`;
      profileText += `${side} ${btn} *Total Chat:* ${userData.chat}\n`;
      profileText += `${side} ${btn} *Status Premium:* ${userData.premium?.prem ? "Ya ✅" : "Tidak ❌"}\n`;
      profileText += `${side} ${btn} *Premium Tersisa:* ${premiumText}\n`;
      profileText += `${side} ${btn} *Nomor Id:* ${userData.noId || "Tidak ada"}\n`;
      profileText += `${foot}━━━━━━━━━━━━━━━━`;

      await conn.sendMessage(
        chatId,
        {
          text: profileText,
          contextInfo: {
            externalAdReply: {
              title: userName,
              body: `Ini adalah Profile ${userName}`,
              thumbnailUrl: thumbnail,
              mediaType: 1,
              renderLargerThumbnail: true,
            },
            mentionedJid: [senderId],
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363310100263711@newsletter'
            }
          },
        },
        { quoted: message }
      );

    } catch (error) {
      console.error("Error di plugin profile.js:", error);
      conn.sendMessage(chatId, { text: "⚠️ Terjadi kesalahan saat mengambil profil!" }, { quoted: message });
    }
  },
};