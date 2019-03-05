var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var users = {};

app.use(express.static('static'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  console.log(socket.id);
  socket.on('disconnect', function(){
	  console.log('user disconnected');
  });
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
	console.log(msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

// function newUser()
