/**
 *	Module dependencies
 **/
var u    = require('url'),
    http = require('http'),
    Ni   = require('ni');

/**
 *	Downloader library
 **/
var Downloader = function() {
	
	var self = this;
	
	this.fetch = function(url, callback)
	{
		self.fetch_helper(url, Ni.config('max_redirect'), callback);
	}
	
	this.fetch_helper = function(url, max_redirect_level, callback)
	{
		if(max_redirect_level == 0) {
			callback(new Error('Endless redirection.'));
			return;
		}
		
		var str='';
		
		var urlObj = u.parse(url);
		
		if(urlObj.port == null || typeof(urlObj.port) == 'undefined') {
			urlObj.port = 80;
		}
		
		// console.log('abt to connect');
		console.log(urlObj);
		var client = http.createClient(urlObj.port, urlObj.hostname);
		
		client.on('error', function(e) {
			callback(new Error("Cannot connect to server."));
		});
		
		var req = client.request('GET', urlObj.pathname, { Host: "headlyne.com" });
		req.on('response', function(resp) {
			// console.log('responsed');
			switch(resp.statusCode) {
				case 200:
					resp.on('data', function(data){ str += data; });
					resp.on('end', function(){ callback(null, str); });
					break;
				case 301:
				case 302:
					self.fetch_helper(
						resp.headers.location,
						max_redirect_level-1,
						callback
					);
					break;
				default:
					callback(new Error("Error " + resp.statusCode + ": Page not found."));
					break;
			}
		});
		
		req.end();
		// console.log('requested');
		
		setTimeout(function() {
			callback(new Error('Request timed out.'));
		}, Ni.config('http_timeout'));
	}
};

module.exports = new Downloader();
