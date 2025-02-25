const { isPrefix } = require('../../toolkit/setting');
const setting = require('../../toolkit/set/config.json');

module.exports = {
    name: 'owner',
    command: ['owner', 'contact', 'admin'], // Multi body command
    category: 'info',
    desc: 'Mengirim kontak owner bot',

    run: async (conn, msg) => {
        try {
            const { remoteJid } = msg.key;
            const message = msg.message?.conversation || '';

            // Mendapatkan prefix dan command yang digunakan
            const prefix = isPrefix.find(p => message.startsWith(p));
            if (!prefix) return;

            const args = message.slice(prefix.length).trim().split(/\s+/);
            const cmd = args.shift().toLowerCase();

            // Validasi apakah command termasuk dalam daftar command plugin ini
            if (!['owner', 'contact', 'admin'].includes(cmd)) return;

            // Mengambil data owner dari config.json
            const owner = setting.ownerSetting.ownerName || 'Owner';
            const ownerNumber = setting.ownerSetting.ownerNumber?.[0];
            const bot = setting.botSetting.botName || 'Bot';

            if (!ownerNumber) {
                console.error('❌ ownerNumber tidak ditemukan. Pastikan config.json terisi dengan benar.');
                await conn.sendMessage(remoteJid, { text: 'Kontak owner tidak tersedia saat ini.' }, { quoted: msg });
                return;
            }

            const contactInfo = {
                contacts: {
                    displayName: owner,
                    contacts: [{
                        vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${owner}\nTEL;type=CELL;type=VOICE;waid=${ownerNumber}:+${ownerNumber}\nEND:VCARD`
                    }]
                }
            };

            await conn.sendMessage(remoteJid, contactInfo, { quoted: msg });
            await conn.sendMessage(remoteJid, { text: `Ini adalah kontak owner *${bot}*` }, { quoted: msg });

        } catch (error) {
            console.error('❌ Terjadi kesalahan di plugin owner:', error.message);
        }
    }
};
