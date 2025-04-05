const fs = require('fs');

let isBroadcasting = false;
const delayTime = 5 * 60 * 1000;
const messageDelay = 3000;

module.exports = {
  name: 'bcgc',
  command: ['bcgc', 'broadcastgc'],
  tags: 'Owner Menu',
  desc: 'Mengirim pesan broadcast ke semua grup (hanya untuk owner).',

  run: async (conn, message, { isPrefix }) => {
    const chatId = message?.key?.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    const senderId = isGroup ? message.key.participant : chatId;
    const mtype = Object.keys(message.message || {})[0];
    const textMessage =
      (mtype === 'conversation' && message.message?.conversation) ||
      (mtype === 'extendedTextMessage' && message.message?.extendedTextMessage?.text) ||
      '';

    if (!textMessage) return;

    const prefix = isPrefix.find((p) => textMessage.startsWith(p));
    if (!prefix) return;

    const args = textMessage.slice(prefix.length).trim().split(/\s+/);
    const commandText = args[0]?.toLowerCase();
    if (!module.exports.command.includes(commandText)) return;

    if (!global.isPremium(senderId)) {
      return conn.sendMessage(chatId, { text: '❌ Fitur ini hanya untuk pengguna premium!' }, { quoted: message });
    }

    if (args.length === 1) {
      return conn.sendMessage(
        chatId,
        {
          text: `📢 *Cara menggunakan perintah:*\n\nGunakan format berikut:\n\`${prefix}bcgc [pesan]\`\n\n*Contoh:*\n\`${prefix}bcgc Halo semua! Jangan lupa cek fitur baru di bot ini.\``,
        },
        { quoted: message }
      );
    }

    if (isBroadcasting) {
      return conn.sendMessage(chatId, { text: '⏳ Harap tunggu! Anda harus menunggu sebelum menjalankan perintah ini lagi.' }, { quoted: message });
    }

    const broadcastMessage = args.slice(1).join(' ');
    if (!broadcastMessage) {
      return conn.sendMessage(chatId, { text: '❌ Pesan broadcast tidak boleh kosong! Gunakan format:\n`${prefix}bcgc [pesan]`' }, { quoted: message });
    }

    const groups = await conn.groupFetchAllParticipating();
    const groupIds = Object.keys(groups);
    if (groupIds.length === 0) {
      return conn.sendMessage(chatId, { text: '❌ Bot tidak tergabung dalam grup mana pun.' }, { quoted: message });
    }

    isBroadcasting = true;
    conn.sendMessage(chatId, { text: `📢 Mengirim broadcast ke ${groupIds.length} grup...` }, { quoted: message });

    let success = 0,
      failed = 0;

    for (const id of groupIds) {
      try {
        await conn.sendMessage(
          id,
          {
            text: `📢 *Broadcast:*\n\n${broadcastMessage}`,
            contextInfo: {
              externalAdReply: {
                thumbnailUrl: thumbnail,
                sourceUrl: 'https://github.com/maoudabi0',
                mediaUrl: 'https://wa.me/6285725892962?text=Beli+Kak',
                mediaType: 1,
                renderLargerThumbnail: true,
                showAdAttribution: true,
              },
              forwardingScore: 0,
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: '120363310100263711@newsletter',
              },
            },
          },
          { quoted: message }
        );

        success++;
      } catch {
        failed++;
      }

      await new Promise((resolve) => setTimeout(resolve, messageDelay));
    }

    conn.sendMessage(
      chatId,
      {
        text: `✅ Broadcast selesai!\n\n📤 Berhasil: ${success} grup\n❌ Gagal: ${failed} grup\n\n⏳ Harap tunggu ${delayTime / 60000} menit sebelum menggunakan perintah ini lagi.`,
      },
      { quoted: message }
    );

    setTimeout(() => {
      isBroadcasting = false;
      conn.sendMessage(chatId, { text: '✅ Perintah broadcast sekarang bisa digunakan lagi.' }, { quoted: message });
    }, delayTime);
  },
};