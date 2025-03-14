/*
* Create By Dabi
* © 2025
*/

require('./toolkit/setting.js');
const fs = require('fs');
const path = require('path');
const pino = require('pino');
const chalk = require('chalk');
const readline = require('readline');
const { makeWASocket, useMultiFileAuthState, makeInMemoryStore } = require('@whiskeysockets/baileys');
const { getMenuText, handleMenuCommand } = require('./plugins/Main_Menu/menu');
const { isPrefix } = require('./toolkit/setting');
const { Format } = require('./toolkit/helper');

const store = makeInMemoryStore({
  logger: pino().child({ level: 'silent', stream: 'store' })
});

const logger = pino({ level: 'silent' });

const folderName = 'temp';

fs.mkdir(folderName, (err) => {
  if (!err) {
    console.log(chalk.green.bold('Berhasil membuat folder :', folderName));
  }
});

global.plugins = {};
global.categories = {};
const pluginFolder = path.join(__dirname, './plugins');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const loadPlugins = (directory) => {
  if (!fs.existsSync(directory)) return console.log(chalk.yellow(`⚠️ Folder plugin tidak ditemukan: ${directory}`));

  fs.readdirSync(directory).forEach((file) => {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) return loadPlugins(fullPath);
    if (!file.endsWith('.js')) return;

    try {
      const pluginName = path.basename(fullPath, '.js');
      const plugin = require(fullPath);
      if (plugin?.run) {
        global.plugins[pluginName] = plugin;

        const category = plugin.tags || 'Uncategorized';
        if (!global.categories[category]) {
          global.categories[category] = [];
        }
        global.categories[category].push(plugin.command);

        console.log(chalk.green(`✅ Plugin dimuat: ${pluginName}`));
      }
    } catch (err) {
      console.log(chalk.red(`❌ Gagal memuat plugin ${file}: ${err.message}`));
    }
  });
};

const welcomeFile = path.join(__dirname, './toolkit/db/welcome.json');

if (!fs.existsSync(welcomeFile)) {
  fs.writeFileSync(welcomeFile, JSON.stringify({}, null, 2));
}

const getWelcomeStatus = (chatId) => {
  let data = JSON.parse(fs.readFileSync(welcomeFile));
  return data[chatId] || false;
};

const startBot = async () => {
  try {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const conn = makeWASocket({
      auth: state,
      printQRInTerminal: true,
      logger: logger,
      browser: ['Ubuntu', 'Chrome', '20.0.04'],
    });

    if (!state.creds?.me?.id) {
      const phoneNumber = await question(chalk.blue('📱 Masukkan nomor bot WhatsApp Anda: '));
      const code = await conn.requestPairingCode(phoneNumber);
      console.log(chalk.green('🔗 Kode Pairing:'), code?.match(/.{1,4}/g)?.join('-') || code);
    }

    conn.ev.on('connection.update', ({ connection }) => {
      const statusMessage = {
        open: () => console.log(chalk.green.bold('✅ Bot online!')),
        connecting: () => console.log(chalk.yellow('🔄 Menghubungkan kembali...')),
        close: () => {
          console.log(chalk.red('❌ Koneksi terputus, mencoba menyambung ulang...'));
          startBot();
        }
      };
      statusMessage[connection]?.();
    });

    conn.ev.on('messages.upsert', async ({ messages }) => {
      if (!messages?.length) return;
      const message = messages[0];
      if (!message?.message) return;

      const sender = message.pushName || 'Pengguna';
      const time = Format.time(Math.floor(Date.now() / 1000));
      const chatId = message.key.remoteJid;
      const isGroup = chatId.endsWith('@g.us');

      let displayName = sender;
      if (isGroup) {
        const metadata = await conn.groupMetadata(chatId);
        displayName = `${metadata.subject} | ${sender}`;
      } else if (chatId === 'status@broadcast') {
        displayName = `${sender} | Status`;
      }

      let textMessage = '';
      let mediaInfo = '';

      if (message.message.conversation) {
        textMessage = message.message.conversation;
      } else if (message.message.extendedTextMessage?.text) {
        textMessage = message.message.extendedTextMessage.text;
      } else if (message.message.imageMessage?.caption) {
        textMessage = message.message.imageMessage.caption;
      } else if (message.message.videoMessage?.caption) {
        textMessage = message.message.videoMessage.caption;
      }

      if ((isGroup && global.readGroup) || (!isGroup && global.readPrivate)) {
        await conn.readMessages([message.key]);
      }

      if ((isGroup && global.autoTyping) || (!isGroup && global.autoTyping)) {
        await conn.sendPresenceUpdate("composing", chatId);
        setTimeout(async () => {
          await conn.sendPresenceUpdate("paused", chatId);
        }, 3000);
      }

      const mediaTypes = {
        imageMessage: '[ Gambar ]',
        videoMessage: '[ Video ]',
        audioMessage: '[ Audio ]',
        documentMessage: '[ Dokumen ]',
        stickerMessage: '[ Stiker ]',
        locationMessage: '[ Lokasi ]',
        contactMessage: '[ Kontak ]',
        pollCreationMessage: '[ Polling ]',
        liveLocationMessage: '[ Lokasi ]',
        reactionMessage: '[ Reaksi ]'
      };

      for (const [key, value] of Object.entries(mediaTypes)) {
        if (message.message[key]) mediaInfo = value;
      }

      console.log(chalk.yellow.bold(`【 ${displayName} 】:`) + chalk.cyan.bold(` [ ${time} ]`));
      if (mediaInfo && textMessage) {
        console.log(chalk.white(`  ${mediaInfo} | [ ${textMessage} ]`));
      } else if (mediaInfo) {
        console.log(chalk.white(`  ${mediaInfo}`));
      } else if (textMessage) {
        console.log(chalk.white(`  [ ${textMessage} ]`));
      }

      for (const plugin of Object.values(global.plugins)) {
        try {
          const args = textMessage.trim().split(/\s+/).slice(1);
          await plugin.run(conn, message, { args, isPrefix });
        } catch (err) {
          console.log(chalk.red(`❌ Error pada plugin: ${err.message}`));
        }
      }

      if (textMessage.startsWith(isPrefix[0])) {
        const command = textMessage.slice(isPrefix[0].length).trim();
        if (command === 'menu') {
          await handleMenuCommand(conn, message);
        }
      }
    });

    conn.ev.on('group-participants.update', async (event) => {
      let { id: chatId, participants, action } = event;

      if (action === "add") {
        let welcomeStatus = getWelcomeStatus(chatId);
        if (!welcomeStatus) return;

        for (let participant of participants) {
          let userTag = `@${participant.split('@')[0]}`;
          let message = `👋 Selamat datang ${userTag} di grup! Semoga betah di sini.`;

          await conn.sendMessage(chatId, { text: message, mentions: [participant] });
        }
      }
    });

    conn.ev.on('creds.update', saveCreds);
  } catch (error) {
    console.error(chalk.red('❌ Error saat menjalankan bot:'), error);
  }
};

console.log(chalk.cyan.bold('Create By Dabi\n'));
loadPlugins(pluginFolder);
startBot();

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.green.bold(`[UPDATE] ${__filename}`));
  delete require.cache[file];
  require(file);
});