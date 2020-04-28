const express = require("express");
const socket = require("socket.io");

// App setup
const app = express();

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, function () {
  console.log("listening for requests on port ", PORT);
});

// Static files
app.use(express.json());
app.use(express.static("public"));

// Socket setup & pass server
const io = socket(server);

io.on("connection", (socket) => {
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

app.post("/actions", function (request, response) {
  //   let((intent = scroll_direction = page = action)) = 0;
  var scroll_direction = 0;
  var intent = 0;
  var page = 0;
  var action = 0;
  //   console.log("Request Body: " + JSON.stringify(request.body));

  //   console.log(request.body.queryResult.intent);
  intent = request.body.queryResult.intent["displayName"].toLowerCase();
  console.log(intent);
  try {
    scroll_direction = request.body.queryResult.parameters[
      "scroll_direction"
    ].toLowerCase();
  } catch (e) {}
  try {
    page = request.body.queryResult.parameters["page"].toLowerCase();
  } catch (e) {}
  try {
    action = request.body.queryResult.parameters["Action"].toLowerCase();
  } catch (e) {}

  if (intent == "key") {
    room = request.body.queryResult.parameters["number"];
    console.log(room);
    io.emit("join", room);
    data = {
      payload: {
        google: {
          userStorage: JSON.stringify(room),
        },
      },
    };
    response.send(data);
  }
  room = request.body.originalDetectIntentRequest.payload.user.userStorage;
  console.log(room);
  if (intent == "scroll") io.to(room).emit("scroll", scroll_direction);
  else if (intent == "navigation") io.to(room).emit("navigate", page);
  else if (intent == "play") io.to(room).emit("play", action);
  else if (intent == "narration") io.to(room).emit("narrate");

  response.end();
});
