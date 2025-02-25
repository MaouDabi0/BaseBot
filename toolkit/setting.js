const fs = require('fs');
const Sys = require('./helper');

// Membaca konfigurasi dari file JSON
const setting = JSON.parse(fs.readFileSync('./toolkit/set/config.json', 'utf-8'));
const mess = JSON.parse(fs.readFileSync('./toolkit/set/message.json', 'utf-8'));

const Obrack = global.brackets?.[0];
const Cbrack = global.brackets?.[1];

// Menetapkan nilai global untuk sistem dan konfigurasi
global.Format = Sys.Format;
global.Connect = Sys.Connect;
global.setting = setting;
global.mess = mess;

// Menetapkan nilai global dari config.json dengan nilai default
Object.assign(global, {
    Obrack: setting.menuSetting.brackets?.[0],
    Cbrack: setting.menuSetting.brackets?.[1],
    head: setting.menuSetting.frame.head,
    body: setting.menuSetting.frame.body,
    foot: setting.menuSetting.frame.foot,
    btn: setting.btn || '•',
    garis: setting.garis || '───────────────',
    side: setting.side || '│',
    type: setting.botSetting.type || 'default',
    footer: setting.botSetting.footer,
    thumbnail: setting.botSetting.thumbnail || '',
    botFullName: setting.botSetting.botFullName || 'Belum Diset',
    botName: setting.botSetting.botName || 'Belum Diset',
    isPrefix: setting.menuSetting.isPrefix,
    ownerName: setting.ownerSetting.ownerName || 'default',
    ownerNumber: setting.ownerSetting.ownerNumber || ['628xxxxxx'] // Default jika undefined
});

// Mengekspor semua variabel global secara otomatis
module.exports = { ...global };
