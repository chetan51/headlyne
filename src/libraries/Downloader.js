/**
 *	Module dependencies
 **/
var u    = require('url'),
    http = require('http'),
    rest = require('restler'),
    Ni   = require('ni'),
    dbg  = require('./Debugger');

var resque = require('coffee-resque').connect({
	host: "localhost",
	port: 6379
});

/**
 *	Downloader library
 **/
var Downloader = function() {
	
	var self = this;
	
	this.fetch = function fetch(url, callback)
	{
		dbg.called();
		
		resque.enqueue(
			'Downloader',
			'fetch',
			[url],
			callback
		);
	}
	
	this.worker = new function()
	{
		var self = this;
		
		this.fetch = function fetch(url, callback)
		{
			dbg.called();
			dbg.log("Fetching url: " + url);
			
			if (url.length > 0) {
				self.fetch_helper(url, Ni.config('max_redirect'), callback);
			}
			else {
				callback(new Error('Invalid URL.'));
			}
		}
		
		this.fetch_helper = function fetch_helper(url, max_redirect_level, callback)
		{
			dbg.called();
			
			if(max_redirect_level == 0) {
				callback(new Error('Endless redirection.'));
				return;
			}
			
			var timeout = setTimeout(function timedOut() {
				dbg.called();
			
				callback(new Error('Request timed out.'));
			}, Ni.config('http_timeout'));
			
			var options = {
				followRedirects: false, // we implement our own redirection following, since
								// Restler cannot handle infinite redirection
				parser: false
			};

			rest.get(url, options).addListener('complete', function processResponse(data, response) {
				dbg.called();
			
				clearTimeout(timeout);
				
				switch(response.statusCode) {
					case 200:
						callback(null, data);
						break;
					case 301:
					case 302:
						self.fetch_helper(
							response.headers.location,
							max_redirect_level-1,
							callback
						);
						break;
					default:
						callback(new Error("Error " + response.statusCode + ": Page not found."));
						break;
				}
			}).addListener('error', function processError(data, response) {
				dbg.called();
				dbg.log('download error: ' + response);
				
				clearTimeout(timeout);
				callback(new Error("Error :" + response));
			});

			process.on('uncaughtException', function processUncaughtException(err){
				dbg.called();
			
				dbg.error(err);
				// allow request to time out.
			});
		}
	}
};

module.exports = new Downloader();
