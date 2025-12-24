const express = require('express');
const app = express();

app.get('/', (req, res) => {
  console.log('Express request received');
  res.json({ message: 'Hello from Express' });
});

app.listen(3002, () => {
  console.log('Express server listening on port 3002');
});