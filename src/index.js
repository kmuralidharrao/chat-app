const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");

const app = express();
const server = http.createServer(app); // if we dont do this express does it for us
const io = socketio(server); // socket io needs raw http server object. if express creates it we will not have access to it

const PORT = process.env.PORT;
const publicDirectory = path.join(__dirname, "../public");

// Setup static directory to serve
app.use(express.static(publicDirectory));

io.on("connection", (socket) => {
  console.log("New websocket connection");

  socket.emit("message", "Welcome!");

  socket.broadcast.emit("message", "A new user has joined :-)"); // sends message to rest of the user

  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();
    if (filter.isProfane(message)) return callback("Profanity is not allowed");
    io.emit("message", message);
    callback();
  });

  socket.on("sendLocation", (coords, callback) => {
    console.log(coords);
    io.emit(
      "message",
      `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
    );
    callback();
  });

  socket.on("disconnect", () => {
    io.emit("message", "A user left the chat :-(");
  });
});

server.listen(PORT, () => {
  console.log(`Chat app is running on port : ${PORT}`);
});
