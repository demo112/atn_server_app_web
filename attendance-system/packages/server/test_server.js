const express = require('express');

console.log('Starting test server JS...');

const app = express();
const PORT = 3003;

app.get('/health', (req, res) => res.send('OK'));

const server = app.listen(PORT, () => {
  console.log(`Test Server JS listening on port ${PORT}`);
});

setInterval(() => {
  console.log('Heartbeat JS');
}, 5000);
