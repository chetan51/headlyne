/*  
 * This is a mock server generator to be used for testing Headlyne modules.
 */

/*
 * Module dependencies
 */
var http = require('http'),
    Connect = require('connect'),
    Quip = require('quip'),
    url  = require('url'),
    Ni   = require('ni'),
    dbg  = require('../../src/libraries/Debugger.js');

/**
 *	Configurations
 **/
Ni.config('log_enabled', false);

/*
 * The generator class
 */
var ServerGenerator = function() {
	
	var self = this;
	
	/*
	 *	Creates and runs a mock server.
	 *
	 *	Set Ni.config('root') before calling this function.
	 */
	this.createServer = function(host, port, callback)
	{
		dbg.log('createServer called');
		
		self.host = host;
		self.port = port;

		Ni.boot(function() {
			dbg.log('boot called');
			dbg.log('creating server');
			var serv = Connect.createServer(
				Quip(),
				Connect.bodyDecoder(),
				self.router,
				Ni.router
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
	
	this.router = function(req, res, next) {
		dbg.log("routing request with ServerGenerator's router");
		var parsed_url = url.parse(req.url, true);

		switch(parsed_url.pathname) {

			case '/ok':
				res.writeHead(200, {'Content-Type': 'text/html'});
				res.write('<html><head></head><body>ok</body></html>');
				res.end();
				break;
	
			case '/redirect':
				res.writeHead(301, {'Content-Type': 'text/html', 'Location': "http://" + self.host + ":" + self.port + "/ok"});
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
						'Location': "http://" + self.host + ":" + self.port + "/endlessredirect"
					}
				);
				res.end();
				break;
			case '/basic_xml':
				res.writeHead(200, {'Content-Type': 'application/xml'});
				res.write(Ni.view('basic_feed').template);
				res.end();
				break;
			case '/basic_feed':
				res.writeHead(200, {'Content-Type': 'application/rss+xml'});
				res.write(Ni.view('basic_feed').template);
				res.end();
				break;
			case '/real_rss':
				res.writeHead(200, {'Content-Type': 'application/rss+xml'});
				res.write(Ni.view('real_rss').template);
				res.end();
				break;
			case '/lifehacker_rss':
				res.writeHead(200, {'Content-Type': 'application/rss+xml'});
				res.write(Ni.view('lifehacker_rss').template);
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
				next();
				// res.writeHead(404, {'Content-Type': 'text/html'});
				// res.end();
				// break;
		}

		dbg.log('served request '+req.url);
	}

};

module.exports = new ServerGenerator();
