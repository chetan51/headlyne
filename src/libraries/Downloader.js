/**
 *	Module dependencies
 **/
var u    = require('url'),
    http = require('http'),
    rest = require('restler'),
    Ni   = require('ni'),
    dbg  = require('./Debugger');

/**
 *	Downloader library
 **/
var Downloader = function() {
	
	var self = this;
	
	this.fetch = function(url, callback)
	{
		if (url.length > 0) {
			self.fetch_helper(url, Ni.config('max_redirect'), callback);
		}
		else {
			callback(new Error('Invalid URL.'));
		}
	}
	
	this.fetch_helper = function(url, max_redirect_level, callback)
	{
		if(max_redirect_level == 0) {
			callback(new Error('Endless redirection.'));
			return;
		}
		
		var timeout = setTimeout(function() {
			callback(new Error('Request timed out.'));
		}, Ni.config('http_timeout'));
		
		var options = {
			followRedirects: false, // we implement our own redirection following, since
			                        // Restler cannot handle infinite redirection
			parser: false
		};

		rest.get(url, options).addListener('complete', function(data, response) {
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
		}).addListener('error', function(data, response) {
			dbg.log('REST error?');
		});

		process.on('uncaughtException', function(err){
			dbg.log('Debugger: Uncaught exception!');
			// allow request to time out.
		});
	}
};

module.exports = new Downloader();
