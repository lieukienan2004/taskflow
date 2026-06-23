const http = require('http');
const data = JSON.stringify({ email: 'admin@taskflow.com', password: 'admin123' });
const opt = {
  hostname: 'localhost', port: 3001, path: '/api/auth/login', method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
};
const req = http.request(opt, res => {
  let b = '';
  res.on('data', c => b += c);
  res.on('end', () => { console.log('Status:', res.statusCode); console.log('Body:', b); process.exit(0); });
});
req.on('error', e => { console.error('Error:', e.message); process.exit(1); });
req.write(data);
req.end();
