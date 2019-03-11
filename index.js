var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var userCounter = 1;
var users = [];
var messageQueue = [];

app.use(express.static('static'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  console.log(socket.id);
  io.to(socket.id).emit('log', messageQueue);
  newUser(socket.id);
  io.emit('user update', users);
  socket.on('disconnect', function(){
	  disconnectUser(socket.id);
	  console.log('user disconnected');
	  io.emit('user update', users);

  });
  socket.on('chat message', function(msg){
	if(msg.startsWith('/nickcolor')){
		var color = "#" + msg.substring(11, msg.length);
		newColor(socket.id, color);
		io.emit('user update', users);
	} else if(msg.startsWith('/nick')){
		console.log(users);
		var name = msg.substring(msg.indexOf('/nick') + 6, msg.length);
		newNickname(socket.id, name);
		io.emit('user update', users);
	} else {
		var time = Date.now();
		var nickname = users.find( user => user.id === socket.id ).name;
		var rgb = users.find( user => user.id === socket.id ).rgb;
		console.log(rgb);
		var messageInfo = { "message": msg,
	 						"time": time,
						 	"nickname": nickname,
						 	"color": rgb };
	    io.emit('chat message', messageInfo);
		addToMsgQueue(messageInfo);
	}
	console.log(msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

function newUser(socketid){
	var name = "User" + userCounter;
	userCounter += 1;
	users.push({id: socketid, name: name, rgb: '#000000'});
	console.log(users);
}

function uniqueNickname(name){

	for(var i = 0; i < users.length; i++){
		if(users[i].name === name){
			return false;
		}
	}
	return true;
}
function newNickname(socketid, name){
	console.log(name);
	if(uniqueNickname(name)){
		console.log("unique");
		users.find(function(value){
			if(value.id === socketid){
				var indexToChange = users.indexOf(value);
				users[indexToChange].name = name;
			}
		});
	}
}
function newColor(socketid, col){
	users.find(function(value){
		if(value.id === socketid){
			var indexToChange = users.indexOf(value);
			users[indexToChange].rgb = col;
		}
	});
}

function disconnectUser(socketid){
	console.log(users);
	var indexToDelete;
	users.find(function(value){
		if(value.id === socketid){
			indexToDelete = users.indexOf(value);
			console.log(value);
			console.log("index to delete:" +indexToDelete);
		}
	});
	users.splice(indexToDelete,1);
	io.emit('user update', users);
	console.log(users);
}

function addToMsgQueue(msg){
	messageQueue.push(msg);
	if(messageQueue.length > 200){
		messageQueue.shift();
	}
}
