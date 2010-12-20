/*  
 * This is a mock server generator to be used for testing Headlyne modules.
 */

/*
 * Module dependencies
 */
var http = require('http'),
    url  = require('url'),
    Ni   = require('ni'),
    dbg  = require('../../src/libraries/Debugger.js');

/**
 *	Configurations
 **/
Ni.config('log_enabled', true);

/*
 * The generator class
 */
var ServerGenerator = function() {
	
	this.createServer = function(host, port, callback)
	{
		Ni.config('root', __dirname + "/mock_app");
		dbg.log('createServer called');

		Ni.boot(function() {
			dbg.log('boot called');
			var serv = http.createServer(
				function (req, res) {
					dbg.log('creating server');
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
						case '/basic_feed':
							res.writeHead(200, {'Content-Type': 'text/html'});
							res.write(Ni.view('basic_feed').template);
							res.end();
							break;
						case '/blogpost1':
							res.writeHead(200, {'Content-Type': 'text/html'});
							res.write(Ni.view('blogpost1').template);
							res.end();
							break;
						case '/blogpost2':
							res.writeHead(200, {'Content-Type': 'text/html'});
							res.write(Ni.view('blogpost2').template);
							res.end();
							break;
						default:
							res.writeHead(404, {'Content-Type': 'text/html'});
							res.end();
							break;
					}
				}
			);
			dbg.log('setting up listening');
			serv.listen(port, host, function() {
				dbg.log('listening');
				callback(null, serv);   
			});
		});
	}

	this.closeServer = function(serv, callback) {
		dbg.log('closing server');
		serv.on('close', function(){ callback(null); });
		serv.close();
	}

};

module.exports = new ServerGenerator();
