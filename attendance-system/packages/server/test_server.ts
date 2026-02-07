import express from 'express';

console.log('Starting test server...');

const app = express();
const PORT = 3002;

app.get('/health', (req, res) => res.send('OK'));

const server = app.listen(PORT, () => {
  console.log(`Test Server listening on port ${PORT}`);
});

setInterval(() => {
  console.log('Heartbeat');
}, 5000);
