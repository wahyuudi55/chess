const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

let waitingPlayer = null;

io.on('connection', socket => {
  socket.on('join', username => {
    socket.username = username;

    if (waitingPlayer) {
      const opponent = waitingPlayer;
      const white = Math.random() > 0.5 ? socket : opponent;
      const black = white === socket ? opponent : socket;

      white.color = 'white';
      black.color = 'black';

      white.opponent = black;
      black.opponent = white;

      white.emit('start', { color: 'white', opponent: black.username });
      black.emit('start', { color: 'black', opponent: white.username });

      waitingPlayer = null;
    } else {
      waitingPlayer = socket;
      socket.emit('waiting', 'Waiting for opponent...');
    }
  });

  socket.on('move', move => {
    if (socket.opponent) {
      socket.opponent.emit('move', move);
    }
  });

  socket.on('reset', () => {
    if (socket.opponent) {
      socket.emit('reset');
      socket.opponent.emit('reset');
    }
  });

  socket.on('disconnect', () => {
    if (waitingPlayer === socket) waitingPlayer = null;
    if (socket.opponent) {
      socket.opponent.emit('reset');
      socket.opponent.opponent = null;
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});