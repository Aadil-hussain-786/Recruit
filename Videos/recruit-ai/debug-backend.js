const { spawn } = require('child_process');

console.log('Starting backend server with detailed logging...');

const server = spawn('node', ['dist/server.js'], {
  cwd: './backend',
  stdio: 'inherit',
  env: { ...process.env, DEBUG: '*' }
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});