// Make connection
var protocol = window.location.protocol;
var socket = io.connect(
  protocol + "//" + document.domain + ":" + location.port
);

// Function to get cookie
function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return false;
}

// Function to generate random number
function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

// UID Setup
var uid = getCookie("uid");
console.log(uid);
if (uid == false) {
  uid = randomNumber(1000, 9999);
  document.cookie = "uid=" + uid;
}

socket.emit("join", uid);
document.getElementById("uid").innerHTML = "Unique ID: " + uid;

// Listen for events
socket.on("chat", function (data) {
  feedback.innerHTML = "";
  output.innerHTML +=
    "<p><strong>" + data.handle + ": </strong>" + data.message + "</p>";
});

socket.on("typing", function (data) {
  feedback.innerHTML = "<p><em>" + data + " is typing a message...</em></p>";
});
