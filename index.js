var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var userCounter = 1;
var users = [];

app.use(express.static('static'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  console.log(socket.id);
  newUser(socket.id);
  io.emit('user update', users);
  socket.on('disconnect', function(){
	  disconnectUser(socket.id);
	  console.log('user disconnected');
	  io.emit('user update', users);

  });
  socket.on('chat message', function(msg){
	var time = Date.now();
	var nickname = users.find( user => user.id === socket.id ).name;
	var messageInfo = { "message": msg,
 						"time": time,
					 	"nickname": nickname };
    io.emit('chat message', messageInfo);
	console.log(msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

function newUser(socketid){
	var name = "User" + userCounter;
	userCounter += 1;
	users.push({id: socketid, name: name});
	console.log(users);
}

function disconnectUser(socketid){
	users.find(function(index, value){
		var indexToDelete;
		if(value.id === socketid){
			indexToDelete = index;
			users.splice(indexToDelete,1);
		}

	});
	console.log(users);
}
