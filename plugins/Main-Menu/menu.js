const fs = require('fs');
const path = require('path');
const setting = require('../../toolkit/setting');

const getPluginList = (dir) => {
  let plugins = [];

  if (!fs.existsSync(dir)) return plugins;

  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);

    if (fs.statSync(fullPath).isDirectory()) {
      plugins = plugins.concat(getPluginList(fullPath));
    } else if (file.endsWith('.js')) {
      plugins.push(file.replace('.js', ''));
    }
  });

  return plugins;
};

const pluginsPath = path.join(__dirname, '..');
const plugins = getPluginList(pluginsPath);

const getMenu = () => {
  if (!botName) return '⚠️ Nama bot belum diatur!';
  if (!Array.isArray(isPrefix) || isPrefix.length === 0) return '⚠️ Prefix tidak ditemukan!';

  let menuText = `${head} ${Obrack} *${botName} Menu* ${Cbrack}\n`;
  menuText += `${side} ${btn} Owner: ${ownerName}\n`;
  menuText += `${side} ${btn} Type: ${type}\n`;
  menuText += `${side} ${btn} Contact: .owner\n`;
  menuText += `${side}${garis}\n`

  if (plugins.length === 0) {
    menuText += `│ ⚠️ Tidak ada perintah yang tersedia.\n`;
  } else {
    plugins.forEach((cmd) => {
      menuText += `│ ✦ ${isPrefix[0]}${cmd}\n`;
    });
  }

  menuText += `${side}\n${foot} ${Obrack} *Total: ${plugins.length} Cmd* ${Cbrack}\n`;

  return menuText;
};

const handleMenuCommand = (message) => {
  const text = message.text || '';
  if (!text.startsWith(isPrefix[0])) return;

  const command = text.slice(isPrefix[0].length).trim();
  if (command === 'menu') {
    return getMenu();
  }
};

module.exports = {
  getMenu,
  handleMenuCommand,
  isPrefix
};
