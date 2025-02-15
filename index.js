console.log('starting...');
const path = require('path');
const { fork } = require('child_process');
const start = () => {
  const p = fork(path.join(__dirname, 'main.js'),
    process.argv.slice(2), {
          stdio: ['inherit', 'inherit', 'inherit', 'ipc']
          })
          .on ('message', data => {
            if (data === 'reset') {
              console.log('restart...');
              p.kill();
            }
            if (data === 'uptime') {
              p.send(process.uptime());
            }
          })
          .on('exit', code => {
            console.log('exit dengan code:', code);
            start();
          });
};
start();