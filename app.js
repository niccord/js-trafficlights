'use strict';

var path = require('path');
var http = require('http');
var fs = require('fs');
var Gun = require('gun');

var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.VCAP_APP_PORT || process.env.PORT || process.argv[2] || 8080;
var ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

var gun = Gun({
	file: './db/data.json'
});

var server = http.createServer(function(req, res){
	if (path.normalize(decodeURIComponent(req.url)) !== decodeURIComponent(req.url)) {
		res.statusCode = 403;
		res.end();
		return;
	}
	if(gun.wsp.server(req, res)){
		return; // filters gun requests!
	}
	fs.createReadStream(path.join(__dirname, req.url)).on('error',function(){ // static files!
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(fs.readFileSync(path.join(__dirname, 'client/index.html'))); // or default to index
	}).pipe(res); // stream
});
gun.wsp(server);
server.listen(port, ip);

console.log('Server started on port', port);
