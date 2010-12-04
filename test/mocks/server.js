/*  
 * This is a mock server generator to be used for testing Headlyne modules.
 */

/*
 * Module dependencies
 */
var http = require('http'),
    url = require('url');

/*
 * The generator class
 */
var ServerGenerator = function() {
	
	this.createServer = function(host, port, callback) {
		
		var serv = http.createServer(
			function (req, res) {
				var parsed_url = url.parse(req.url, true);
		
				switch(parsed_url.pathname) {
		
					case '/ok':
						res.writeHead(200, {'Content-Type': 'text/html'});
						res.write('<html><head></head><body>ok</body></html>');
						res.end();
						break;
			
					case '/redirect':
						res.writeHead(301, {'Content-Type': 'text/html', 'Location': "http://" + host + ":" + port + "/ok"});
						res.end();
						break;
			
					case '/timeout':
						setTimeout( function() {
							res.writeHead(200, {'Content-Type': 'text/html'});
							res.write('<html><head></head><body>ok</body></html>');
							res.end();
						}, 60000);
						break;
					case '/endlessredirect':
						res.writeHead(301,
							{	'Content-Type': 'text/html',
								'Location': "http://" + host + ":" + port + "/endlessredirect"
							}
						);
						res.end();
						break;
					default:
						res.writeHead(404, {'Content-Type': 'text/html'});
						res.end();
						break;
				}
			}
		);
		
		serv.listen(port, host, function() {
			callback(serv);   
		});
	}

	this.closeServer = function(serv, callback) {
		serv.on('close', function(){ callback(); });
		serv.close();
	}

};

module.exports = new ServerGenerator();
