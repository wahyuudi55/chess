const socket = io();
const playBtn = document.getElementById('playBtn');
const resetBtn = document.getElementById('resetBtn');
const usernameInput = document.getElementById('username');
const loginScreen = document.getElementById('login-screen');
const gameScreen = document.getElementById('game-screen');
const status = document.getElementById('status');

let board = null;
let game = new Chess();
let playerColor = null;

playBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  if (!username) return alert('Please enter your username!');
  socket.emit('join', username);
  status.textContent = 'Searching for opponent...';
});

socket.on('waiting', msg => {
  status.textContent = msg;
});

socket.on('start', ({ color, opponent }) => {
  playerColor = color;
  loginScreen.style.display = 'none';
  gameScreen.style.display = 'block';
  status.textContent = `You are ${color}. Opponent: ${opponent}`;
  startBoard();
});

socket.on('move', move => {
  game.move(move);
  board.position(game.fen());
  updateStatus();
});

socket.on('reset', () => {
  game.reset();
  board.start();
  updateStatus();
});

resetBtn.addEventListener('click', () => {
  socket.emit('reset');
});

function startBoard() {
  const config = {
    draggable: true,
    position: 'start',
    orientation: playerColor,
    onDrop: (source, target) => {
      const move = game.move({ from: source, to: target, promotion: 'q' });
      if (!move) return 'snapback';

      socket.emit('move', move);
      updateStatus();
    }
  };
  board = Chessboard('board', config);
  updateStatus();
}

function updateStatus() {
  let statusText = '';
  if (game.in_checkmate()) {
    statusText = `Checkmate! ${playerColor === game.turn() ? 'You lose!' : 'You win!'}`;
  } else if (game.in_draw()) {
    statusText = 'Draw!';
  } else {
    statusText = (game.turn() === playerColor) ? 'Your turn' : 'Opponent\'s turn';
  }
  status.textContent = statusText;
}