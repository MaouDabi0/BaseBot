const fs = require('fs');
const path = require('path');
const Sys = require('./helper');

const settingPath = './toolkit/set/config.json';
const tokoPath = './toolkit/set/toko.json';
const databasePath = './toolkit/db/database.json';
const packageJsonPath = path.join(__dirname, '../package.json');

const setting = JSON.parse(fs.readFileSync(settingPath, 'utf-8'));
const toko = JSON.parse(fs.readFileSync(tokoPath, 'utf-8'));
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

function readDatabase() {
    if (!fs.existsSync(databasePath)) return { Private: {} };
    return JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
}

global.getUserData = (userId) => {
    const database = readDatabase();
    return Object.values(database.Private).find(user => user.Nomor === userId) || null;
};

global.isPremium = (userId) => {
    const userData = global.getUserData(userId);
    return userData ? userData.premium || false : false;
};

Object.assign(global, {
    Format: Sys.Format,
    Connect: Sys.Connect,
    setting,
    toko,
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
    public: setting.botSetting.public,
    sewaList: toko.storeSetting.sewa || [],
    storeList: Object.keys(toko.storeSetting).filter(k => k !== 'sewa'),
    ownerStore: {
        dana: setting.ownerSetting.ownerStore?.dana || 'Tidak tersedia',
        gopay: setting.ownerSetting.ownerStore?.gopay || 'Tidak tersedia',
        ovo: setting.ownerSetting.ownerStore?.ovo || 'Tidak tersedia'
    },
    version: packageJson.version,
    baileys: Object.keys(packageJson.dependencies).find(dep => dep.includes('baileys'))
});

module.exports = { ...global };