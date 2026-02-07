console.log('Script start');
try {
  const express = require('express');
  console.log('Express loaded');
  const app = express();
  
  app.get('/health', (req, res) => res.send('OK'));
  
  const server = app.listen(0, () => {
    console.log(`Server listening on port ${server.address().port}`);
  });
  
  server.on('error', (e) => {
    console.error('Server Error:', e);
  });
  
  setInterval(() => {
    console.log('Heartbeat');
  }, 1000);
  
} catch (e) {
  console.error('Top Level Error:', e);
}
