const fs = require('fs');
const Sys = require('./helper');
const path = require('path');

// Membaca konfigurasi dari file JSON
const setting = JSON.parse(fs.readFileSync('./toolkit/set/config.json', 'utf-8'));
const toko = JSON.parse(fs.readFileSync('./toolkit/set/toko.json', 'utf-8'));
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json')), 'utf8');

const Obrack = global.brackets?.[0];
const Cbrack = global.brackets?.[1];

// Menetapkan nilai global untuk sistem dan konfigurasi
global.Format = Sys.Format;
global.Connect = Sys.Connect;
global.setting = setting;
global.toko = toko;

// Menetapkan nilai global dari config.json dengan nilai default
Object.assign(global, {
    Obrack: setting.menuSetting.brackets?.[0],
    Cbrack: setting.menuSetting.brackets?.[1],
    head: setting.menuSetting.frame.head,
    body: setting.menuSetting.frame.body,
    foot: setting.menuSetting.frame.foot,
    btn: setting.menuSetting.btn,
    garis: setting.menuSetting.garis,
    side: setting.menuSetting.side,
    type: setting.botSetting.type || 'default',
    footer: setting.botSetting.footer,
    thumbnail: setting.botSetting.thumbnail || '',
    botFullName: setting.botSetting.botFullName || 'Belum Diset',
    botName: setting.botSetting.botName || 'Belum Diset',
    isPrefix: setting.menuSetting.isPrefix,
    ownerName: setting.ownerSetting.ownerName || 'default',
    ownerNumber: setting.ownerSetting.ownerNumber,
    contact: setting.ownerSetting.contact,
    chshort: setting.botSetting.sendTextLink.chshort,
    readGroup: setting.botSetting.autoread?.group,
    readPrivate: setting.botSetting.autoread?.private,
    autoTyping: setting.botSetting.autoTyping,
    autoBio: setting.botSetting.autoBio,

    // Mengarah ke toko
    sewaList: toko.storeSetting.sewa || [],
    storeList: Object.keys(toko.storeSetting).filter(k => k !== 'sewa'),

    // Mengarah ke package.json
    version: packageJson.version,
    baileys: Object.keys(packageJson.dependencies).find(dep => dep.includes('baileys'))
});

// Mengekspor semua variabel global secara otomatis
module.exports = { ...global };
