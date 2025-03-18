const fs = require('fs');
const path = require('path');
require('../../toolkit/setting');

const tokoPath = './toolkit/set/toko.json';
const dbPath = './toolkit/db/datatoko.json';

module.exports = {
  name: 'Buy',
  command: ['beli', 'buy'],
  tags: 'Shop Menu',
  desc: 'Membeli barang dari toko',

  run: async (conn, message, { args, isPrefix }) => {
    try {
      const chatId = message.key.remoteJid;
      const isGroup = chatId.endsWith('@g.us');
      const senderId = isGroup ? message.key.participant : chatId.replace(/:\d+@/, '@');
      const textMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
      const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      if (!textMessage) return;

      const prefix = isPrefix.find(p => textMessage.startsWith(p));
      if (!prefix) return;

      const commandText = textMessage.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase();
      if (!module.exports.command.includes(commandText)) return;

      if (!fs.existsSync(dbPath)) {
        fs.writeFileSync(dbPath, JSON.stringify({ pendingOrders: [] }, null, 2));
      }

      let dbData;
      try {
        dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        if (!dbData.pendingOrders) dbData.pendingOrders = [];
      } catch (err) {
        return conn.sendMessage(chatId, { text: "❌ Terjadi kesalahan saat membaca database." }, { quoted: message });
      }

      if (!textMessage.includes('done')) {
        if (args.length < 2) {
          return conn.sendMessage(chatId, {
            text: `⚠️ Gunakan format *${prefix}buy <NamaToko> <NamaBarang>*\nLihat daftar toko dengan *${prefix}shop*.`
          }, { quoted: message });
        }

        const tokoName = args[0];
        const barangName = args.slice(1).join(' ');

        let tokoData;
        try {
          tokoData = JSON.parse(fs.readFileSync(tokoPath, 'utf8'));
        } catch (err) {
          return conn.sendMessage(chatId, { text: "❌ Terjadi kesalahan saat membaca database toko." }, { quoted: message });
        }

        if (!tokoData.storeSetting || !tokoData.storeSetting[tokoName]) {
          return conn.sendMessage(chatId, { text: `❌ Toko *${tokoName}* tidak ditemukan!` }, { quoted: message });
        }

        const tokoItems = tokoData.storeSetting[tokoName];
        const barang = tokoItems.find(item => item.name.toLowerCase() === barangName.toLowerCase());

        if (!barang) {
          return conn.sendMessage(chatId, { text: `❌ Barang *${barangName}* tidak ditemukan di toko *${tokoName}*.` }, { quoted: message });
        }

        dbData.pendingOrders.push({ userId: senderId, toko: tokoName, barang: barang.name, harga: barang.price });
        fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));

        const paymentInfo = `
💳 *Metode Pembayaran:*
- Dana: ${global.ownerStore.dana !== 'Tidak tersedia' ? global.ownerStore.dana : '❌ Tidak tersedia'}
- GoPay: ${global.ownerStore.gopay !== 'Tidak tersedia' ? global.ownerStore.gopay : '❌ Tidak tersedia'}
- OVO: ${global.ownerStore.ovo !== 'Tidak tersedia' ? global.ownerStore.ovo : '❌ Tidak tersedia'}`;

        await conn.sendMessage(chatId, {
          image: { url: "https://files.catbox.moe/4cuj4g.jpeg" },
          caption: `📌 *Pembelian Pending*\n\n👤 *User:* @${senderId.split('@')[0]}\n🏪 *Toko:* ${tokoName}\n📦 *Barang:* ${barang.name}\n💰 *Harga:* Rp${barang.price.toLocaleString()}\n\n${paymentInfo}\n\n📢 *Owner Harap Konfirmasi dengan*:\n\`${prefix}buy ${tokoName} ${barang.price} done\`\nAtau *Reply pesan ini dengan "done"*`,
          mentions: [senderId]
        }, { quoted: message });

        return;
      }

      if (!global.ownerNumber.includes(senderId.replace(/\D/g, ''))) {
        return conn.sendMessage(chatId, { text: '❌ Hanya owner yang dapat mengonfirmasi pembelian.' }, { quoted: message });
      }

      let order;
      if (quotedMessage) {
        const quotedUserId = message.message.extendedTextMessage.contextInfo.participant;
        order = dbData.pendingOrders.find(o => o.userId === quotedUserId);
      } else {
        if (args.length < 3 || args[2].toLowerCase() !== 'done') {
          return conn.sendMessage(chatId, { text: `⚠️ Gunakan format *${prefix}buy <NamaToko>, <Harga> done* atau reply pesan pembelian dengan "done".` }, { quoted: message });
        }
        const tokoName = args[0];
        const harga = args[1];

        order = dbData.pendingOrders.find(o => 
          o.toko.toLowerCase() === tokoName.toLowerCase() && 
          o.harga === harga
        );
      }

      if (!order) {
        return conn.sendMessage(chatId, { text: "❌ Tidak ada transaksi yang cocok untuk dikonfirmasi!" }, { quoted: message });
      }

      dbData.pendingOrders = dbData.pendingOrders.filter(o => 
        !(o.userId === order.userId && o.toko === order.toko && o.barang === order.barang && o.harga === order.harga)
      );
      fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));

      await conn.sendMessage(chatId, {
        text: `✅ Pembelian dikonfirmasi!\n\n👤 *User:* @${order.userId.split('@')[0]}\n🏪 *Toko:* ${order.toko}\n📦 *Barang:* ${order.barang}\n💰 *Harga:* Rp${order.harga.toLocaleString()}\n\n📌 Terima kasih telah berbelanja!`,
        mentions: [order.userId]
      }, { quoted: message });

    } catch (err) {
      conn.sendMessage(message.key.remoteJid, { text: "❌ Terjadi kesalahan, coba lagi nanti." }, { quoted: message });
    }
  }
};