const { generateWAMessageFromContent } = require('@whiskeysockets/baileys');
const config = require('../../toolkit/set/config.json');

const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);

module.exports = {
  name: 'menu',
  command: ['menuall', 'menu'],
  tags: 'Info Menu',

  run: async (conn, message, { isPrefix }) => {
    const chatId = message.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    const senderId = isGroup ? message.key.participant : chatId.replace(/:\d+@/, '@');
    const textMessage =
      message.message?.conversation || message.message?.extendedTextMessage?.text || '';

    if (!textMessage) return;

    const prefix = isPrefix.find((p) => textMessage.startsWith(p));
    if (!prefix) return;

    const args = textMessage.slice(prefix.length).trim().split(/\s+/);
    const commandText = args.shift().toLowerCase();
    if (!module.exports.command.includes(commandText)) return;

    const senderNumber = message.pushName || 'Pengguna';
    const sender = `${senderNumber}`;

    const requestedCategory = args.length ? args.join(' ').toLowerCase() : null;
    const menuText = getMenuText(sender, requestedCategory);

    const adReply = {
      contextInfo: {
        externalAdReply: {
          title: botName,
          body: 'Silakan pilih menu yang tersedia',
          thumbnailUrl: thumbnail,
          sourceUrl: 'https://github.com/maoudabi0',
          mediaUrl: 'https://wa.me/6285725892962?text=Beli+Kak',
          mediaType: 1,
          renderLargerThumbnail: true,
          showAdAttribution: true
        },
        forwardingScore: 0,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363310100263711@newsletter'
        }
      }
    };

    await conn.sendMessage(chatId, { text: menuText, ...adReply }, { quoted: message });
  }
};

function getMenuText(sender, requestedCategory) {
  let menuText = `Halo *${sender}*, Saya adalah asisten virtual yang siap membantu.\n`;
  menuText += `Gunakan perintah di bawah untuk berinteraksi dengan saya.\n`;
  menuText += `> ⚠ Note:\n> Bot ini masih dalam tahap pengembangan,\n> jadi gunakan dengan bijak\n\n`;

  menuText += `${head} ${Obrack} *Info ${botName}* ${Cbrack}\n`;
  menuText += `${side} ${btn} Bot Name: ${botFullName}\n`;
  menuText += `${side} ${btn} Owner: ${ownerName}\n`;
  menuText += `${side} ${btn} Type: ${type}\n`;
  menuText += `${side} ${btn} Contact: .owner\n`;
  menuText += `${side} ${btn} Total: ${Object.keys(global.plugins).length} Cmd\n`;
  menuText += `${side} ${btn} Versi: ${version}\n`;
  menuText += `${side} ${btn} Baileys: ${baileys}\n`;
  menuText += `${foot}${garis}\n\n`;

  menuText += `${readmore}`;

  let categorizedCommands = {};
  for (const [pluginName, plugin] of Object.entries(global.plugins)) {
    let category = plugin.tags || "Other Menu";
    if (!config.pluginCategories[category]) category = "Other Menu";
    if (!categorizedCommands[category]) categorizedCommands[category] = [];
    categorizedCommands[category].push(pluginName);
  }

  let sortedCategories = Object.keys(categorizedCommands).sort();

  if (requestedCategory) {
    const matchedCategory = sortedCategories.find(cat =>
      cat.toLowerCase().includes(requestedCategory)
    );

    if (!matchedCategory) {
      menuText += `⚠ *Kategori '${requestedCategory}' tidak ditemukan!*\n`;
      menuText += `Gunakan *.menuall* untuk melihat semua kategori yang tersedia.\n`;
      return menuText;
    }

    let commands = categorizedCommands[matchedCategory];
    commands.sort();

    menuText += `${head} ${Obrack} *${matchedCategory}* ${Cbrack}\n`;
    commands.forEach((cmd) => {
      menuText += `${side} ${btn} ${isPrefix[0]}${cmd}\n`;
    });
    menuText += `${foot}${garis}\n\n`;
  } else {
    for (const category of sortedCategories) {
      let commands = categorizedCommands[category];
      commands.sort();

      menuText += `${head} ${Obrack} *${category}* ${Cbrack}\n`;
      commands.forEach((cmd) => {
        menuText += `${side} ${btn} ${isPrefix[0]}${cmd}\n`;
      });
      menuText += `${foot}${garis}\n\n`;
    }
  }

  menuText += `${Obrack} ${footer} ${Cbrack}`;
  return menuText;
}