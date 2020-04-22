"use strict";
const EventEmitter = require("events");
class MyEmitter extends EventEmitter {}
const socketSender = new MyEmitter();

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var http = require("http");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var videosRouter = require("./routes/videos");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/videos", videosRouter);

var io = require("socket.io")();
io.listen(80);

app.post("/api", function(request, response, next) {
  let intent = request.body.queryResult.intent["displayName"];
  let scroll_direction =
    request.body.queryResult.parameters["scroll_direction"];
  let page = request.body.queryResult.parameters["page"];
  let action = request.body.queryResult.parameters["Action"];

  if (intent == "Scroll" && scroll_direction)
    socketSender.emit("sendNews", "scroll");
  else if (intent == "Navigation" && page == "videos")
    socketSender.emit("sendNews", "videos");
  else if (intent == "Navigation" && page == "home")
    socketSender.emit("sendNews", "home");
  else if (intent == "Play" && action == "play")
    socketSender.emit("sendNews", "play");
  else if (intent == "Play" && action == "pause")
    socketSender.emit("sendNews", "pause");

  response.end();
});

app.post("/scroll", function(request, response, next) {
  console.log(request.body.queryResult.parameters["scroll_direction"]);
  console.log(request.body.queryResult.intent["displayName"]);
  socketSender.emit("sendNews", "scroll");
  response.end();
});

app.post("/videos", function(request, response, next) {
  socketSender.emit("sendNews", "videos");
  console.log(request.query.page);
  response.end();
});

app.post("/play", function(request, response, next) {
  socketSender.emit("sendNews", "play");
  response.end();
});
app.post("/pause", function(request, response, next) {
  socketSender.emit("sendNews", "pause");
  response.end();
});
app.post("/home", function(request, response, next) {
  socketSender.emit("sendNews", "home");
  console.log(request.query.page);
  response.end();
});

io.on("connection", function(socket) {
  socketSender.on("sendNews", function(msg) {
    socket.emit("news", msg);
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
