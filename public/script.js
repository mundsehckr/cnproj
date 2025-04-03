const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");

const socket = io.connect("http://localhost:8000");

let drawing = false;
let lastX = 0;
let lastY = 0;

const guessInput = document.getElementById("guessInput");
const sendGuessButton = document.getElementById("sendGuess");
const wordHint = document.getElementById("wordHint");
const scoreBoard = document.getElementById("scoreBoard");

// 🎨 Start drawing
const startDrawing = (e) => {
  drawing = true;
  [lastX, lastY] = [e.offsetX, e.offsetY];
};

// ✋ Stop drawing
const stopDrawing = () => {
  drawing = false;
};

// ✏️ Draw on canvas and send data
const draw = (e) => {
  if (!drawing) return;

  const x = e.offsetX;
  const y = e.offsetY;
  
  // Draw on local canvas
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.stroke();
  
  // Send drawing data with previous point
  socket.emit("drawing", { lastX, lastY, x, y });

  [lastX, lastY] = [x, y];
};

// 🖱 Attach event listeners
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseleave", stopDrawing);
canvas.addEventListener("mousemove", draw);

// 📝 Send guess
sendGuessButton.addEventListener("click", () => {
  const guess = guessInput.value.trim();
  if (guess) {
    socket.emit("guess", guess);
    guessInput.value = "";
  }
});

// 🔄 Receive word hint
socket.on("wordHint", (hint) => {
  wordHint.textContent = `Hint: ${hint}`;
});

// 🏆 Update scoreboard
socket.on("updateScore", (scores) => {
  let scoreText = Object.entries(scores)
    .map(([player, score]) => `${player}: ${score} pts`)
    .join(" | ");
  scoreBoard.textContent = `Scores: ${scoreText}`;
});

// 🖌 Receive and draw from another user
socket.on("draw", (data) => {
  ctx.beginPath();
  ctx.moveTo(data.lastX, data.lastY);
  ctx.lineTo(data.x, data.y);
  ctx.stroke();
});

// 🔄 New round
socket.on("newRound", (word) => {
  wordHint.textContent = "Start drawing!";
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas for new round
});
