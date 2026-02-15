const { spawn } = require('child_process');

console.log('Starting frontend server with detailed logging...');

const frontend = spawn('npx', ['next', 'dev'], {
  cwd: './frontend',
  stdio: 'inherit',
  env: { ...process.env, DEBUG: '*' }
});

frontend.on('error', (err) => {
  console.error('Failed to start frontend:', err);
});

frontend.on('close', (code) => {
  console.log(`Frontend process exited with code ${code}`);
});