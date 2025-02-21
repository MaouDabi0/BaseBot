const { isPrefix } = require('../../toolkit/setting');
const setting = require('../../toolkit/set/config.json');

module.exports = {
    name: 'owner',
    alias: ['contact', 'admin'],
    category: 'info',
    desc: 'Mengirim kontak owner bot',

    run: async (conn, msg) => {
        try {
            const { remoteJid } = msg.key;
            const message = msg.message?.conversation || '';

            // Validasi prefix
            if (!isPrefix.some(prefix => message.startsWith(prefix + 'owner'))) return;

            // Mengambil data owner langsung dari config.json
            const owner = setting.ownerName || 'Owner';
            const ownerNumber = setting.ownerNumber?.[0];
            const bot = setting.botName || 'Bot';

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