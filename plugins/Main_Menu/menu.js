const fs = require('fs');
const path = require('path');
const setting = require('../../toolkit/setting');
const config = require('../../toolkit/set/config.json');
const { generateWAMessageFromContent } = require('@whiskeysockets/baileys');

const {
  isPrefix, botName, botFullName, ownerName, type, footer, head,
  Obrack, Cbrack, side, btn, garis, foot, version, baileys
} = setting;

const thumbnailUrl = setting.thumbnail;
const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);

const handleMenuCommand = async (conn, message) => {
  const remoteJid = message?.key?.remoteJid;
  if (!remoteJid) return console.error('❌ JID tidak valid atau tidak ditemukan!');
  
  const senderNumber = message.pushName || 'Pengguna';
  const sender = `${senderNumber}`;

  const menuText = getMenuText(sender);

  const adReply = {
    contextInfo: {
      externalAdReply: {
        title: botName,
        body: "Silakan pilih menu yang tersedia",
        thumbnailUrl: thumbnailUrl,
        sourceUrl: "https://whatsapp.com/channel/0029Van8WHGEAKW8OUDniG1m",
        mediaType: 1,
        renderLargerThumbnail: true,
        showAdAttribution: true
      }
    }
  };

  await conn.sendMessage(remoteJid, { text: menuText, ...adReply }, { quoted: message });
};

const getMenuText = (sender) => {
  let menuText = `Halo *${sender}*, Saya adalah asisten virtual yang siap membantu.\n`;
  menuText += `Gunakan perintah di bawah untuk berinteraksi dengan saya.\n`;
  menuText += `> ⚠ Note:\n> Bot ini masih dalam tahap pengembangan,\n> jadi gunakan dengan bijak\n\n`;

  menuText += `${head} ${Obrack} *${botName} Info* ${Cbrack}\n`;
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

  for (const category of sortedCategories) {
    let commands = categorizedCommands[category];
    commands.sort();

    menuText += `${head} ${Obrack} *${category}* ${Cbrack}\n`;
    commands.forEach((cmd) => {
      menuText += `${side} ${btn} ${isPrefix[0]}${cmd}\n`;
    });
    menuText += `${foot}${garis}\n\n`;
  }

  menuText += `${Obrack} ${footer} ${Cbrack}`;
  return menuText;
};

module.exports = {
  getMenuText,
  handleMenuCommand,
  isPrefix
};
