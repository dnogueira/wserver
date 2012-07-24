var fs = require("fs");
var util = require("util");
var crypto = require('crypto')

var log = console.log;

var secure = true; //use https

var server = null;

if(secure){
	var https = require("https");
	var options = {
  		key: fs.readFileSync('keys/agent2-key.pem'),
  		cert: fs.readFileSync('keys/agent2-cert.pem')
	};

	secureServer = https.createServer(options);
	secureServer.listen(8443);
} 

var http = require("http");
server = http.createServer();
server.listen(8080);

var onrequest = function (request, response){
	if(request.url == '/favicon.ico')
		return;
	console.log("New request");
	//console.log("Request.connection", util.inspect(request.socket));
	//console.log("Request.url", util.inspect(request.url));
	//console.log("Request.client", util.inspect(request.client));

	response.writeHead(200);
	response.end("hello\n");
};

var onupgrade = function (request, socket, head){

	console.log("server::on(upgrade)");
	//console.log(util.inspect(request.headers));
	var MagicString = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
	var SecWebsocketKey = request.headers['sec-websocket-key'];

	var sha1 = crypto.createHash('sha1');
	sha1.update(SecWebsocketKey+MagicString);
	var secAccept = sha1.digest('base64');

	var upgradeResponse = "HTTP/1.1 101 Switching Protocols\r\n";
	upgradeResponse += "Upgrade: websocket\r\n";
	upgradeResponse += "Connection: Upgrade\r\n";
	upgradeResponse += "Sec-WebSocket-Accept: " + secAccept + "\r\n";
	//upgradeResponse += "Sec-WebSocket-Protocol: chat\r\n";
	upgradeResponse += "\r\n";

	socket.write(upgradeResponse);

	//echo back
	//socket.pipe(socket);

	// var fileStream = fs.createWriteStream('/home/dnogueira/apps/tests/tmp.txt', { flags: 'w',
	//   encoding: null,
	//   mode: 0666
	// });

	if(head.length){
		fs.appendFile('message.txt', head, function (err) {
		  if (err) throw err;
		  console.log('The "data to append" was appended to file!');
		});
	}

	
	
	socket.on('data', function (chunk){
			
		//socket.pipe(fileStream);
		console.log('Data received: ', chunk, "."+chunk.toString()+".");

		// var file = fs.open('/home/dnogueira/apps/tests/tmp.txt', 'w', '0666', function (fd){
		// 	console.log('file opened');	

		// 	fs.write(fd, chunk);	
		// });

		fs.appendFile('message.txt', chunk, function (err) {
		  if (err) throw err;
		  console.log('The "data to append" was appended to file!');
		});

		var ret = '';
		switch(chunk.toString().trim()){
			case 'ola': ret = 'Hello!'; break;
			case 'como estas': ret = 'I am Ok!'; break;
			case 'xau': ret = 'Bye Bye!'; break;
			default: ret = 'Bye Bye!'; break;
		}
		this.write(ret+"\n");

	});

};

server.on('request', onrequest);
secureServer.on('request', onrequest);

server.on('upgrade', onupgrade);
secureServer.on('upgrade', onupgrade);

log("Initializing Server");
