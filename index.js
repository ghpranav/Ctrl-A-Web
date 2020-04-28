const express = require("express");
const socket = require("socket.io");
const socketRedis = require("socket.io-redis");

// App setup
const app = express();

const PORT = process.env.PORT || 3000;
const REDIS_URL =
  process.env.REDIS_URL ||
  "redis-13021.c10.us-east-1-3.ec2.cloud.redislabs.com:13021";
const REDIS_KEY = process.env.REDIS_KEY || "chat-socket";

const server = app.listen(PORT, function () {
  console.log("listening for requests on port ", PORT);
});

// Static files
app.use(express.static("public"));

// Socket setup & pass server
const io = socket(server);
// const redisAdapter = socketRedis(REDIS_URL, { key: REDIS_KEY })
const redisAdapter = socketRedis({
  host:
    process.env.REDIS_HOST ||
    "redis-13021.c10.us-east-1-3.ec2.cloud.redislabs.com",
  port: process.env.REDIS_PORT || 13021,
  password: process.env.REDIS_PASS || "dhcRN7LTsgab7Na5u1X1rlAYuWNpZCyB",
});

io.adapter(redisAdapter).on("connection", (socket) => {
  console.log(socket.id, "made socket connection");

  // Handle chat event
  socket.on("chat", function (data) {
    // console.log(data);
    io.sockets.emit("chat", data);
  });

  // Handle typing event
  socket.on("typing", function (data) {
    socket.broadcast.emit("typing", data);
  });

  socket.on("join", function (room) {
    socket.join(room);
    console.log(socket.id, " joined room ", room);
  });

  socket.on("disconnect", () => {
    console.log(`Socket ${socket.id} disconnected.`);
  });
});
