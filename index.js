console.log('Starting...');

const fs = require('fs');
const path = require('path');
const { fork } = require('child_process');

const licensePath = path.join(__dirname, 'LICENSE');
if (fs.existsSync(licensePath)) {
  const licenseContent = fs.readFileSync(licensePath, 'utf8');
  console.log('=== LICENSE FILE ===\n' + licenseContent + '\n====================');
} else {
  console.log('LICENSE file not found.');
}

const start = () => {
  const p = fork(path.join(__dirname, 'main.js'), process.argv.slice(2), {
    stdio: ['inherit', 'inherit', 'inherit', 'ipc']
  });

  p.on('message', (data) => {
    if (data === 'reset') {
      console.log('Restarting...');
      p.kill();
    } else if (data === 'uptime') {
      p.send(process.uptime());
    }
  });

  p.on('exit', (code) => {
    console.log('Exited with code:', code);
    start();
  });
};

start();