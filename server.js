const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public")); // Serve static files from 'public' folder

let currentWord = "apple"; // Example word
let users = {}; // Store users and their scores

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Assign random scores initially
    users[socket.id] = { score: 0 };

    // Send current word hint (only to guessers, not the drawer)
    socket.emit("wordHint", currentWord[0] + " _ _ _ _");

    socket.on("draw", (data) => {
        socket.broadcast.emit("draw", data);
    });

    socket.on("guess", (guess) => {
        if (guess.toLowerCase() === currentWord.toLowerCase()) {
            users[socket.id].score += 10;
            io.emit("scoreUpdate", users);
            socket.emit("correctGuess", "✅ Correct! The word was: " + currentWord);
            currentWord = "banana"; // Change word for the next round
        } else {
            socket.emit("wrongGuess", "❌ Try again!");
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        delete users[socket.id];
        io.emit("scoreUpdate", users);
    });
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
