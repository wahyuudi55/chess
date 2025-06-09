const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

// Wajib! Pakai process.env.PORT
const PORT = process.env.PORT || 3000;

// Serve folder public untuk frontend
app.use(express.static(path.join(__dirname, 'public')));

// Optional, untuk tes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
  console.log('User connected');
});

http.listen(PORT, () => {
  console.log('Server running on port', PORT);
});
