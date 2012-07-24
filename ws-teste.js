var util = require('util');
var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({port: 8080});

var fs = require('fs');

//-----
var express = require("express");
var app = express.createServer();

app.use(express.static(__dirname + '/public'));

app.listen(8081);

//----
var countFiles = 0;

wss.on('connection', function(ws) {
	//console.log('new connection');
    ws.on('message', function(message, flags) {
    	countFiles ++;
    	console.log("new message");
        if(flags.binary === true){
        	flags.buffer;//Buffer
        	console.log('Binary: ', flags.buffer);
        	console.log('Binary (message): ', message);
        	
        	var fileName = './public/upload/teste'+countFiles;

        	fs.writeFile(fileName, flags.buffer, function (err) {
			  if (err) throw err;
			  console.log('New file: '+fileName);
			  
			  ws.send('OK');
			});


        } else {
        	console.log("Not Binary (message): ", message);
        }
    });
    //ws.send('something');
});
console.log('HTTP express server listening on port 8081');
console.log('Websocket server listening on port 8080');
