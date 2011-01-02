/*
 *  Module dependencies
 */
var nodeunit = require('nodeunit');
var Ni = require('ni');
var ServerGenerator = require('../../test/mocks/ServerGenerator.js');
var Downloader = require('../../src/libraries/Downloader.js');

/*
 *  Constants and mocks
 */
var okContent = "<html><head></head><body>ok</body></html>";

var mock_server      = null;
    mock_server_host = "localhost",
    mock_server_port = 7500;

var base_url = "http://" + mock_server_host + ":" + mock_server_port;

Ni.config('root', __dirname + "/../mocks/mock_app");

/*
 *  Tests
 */
exports['fetch URLs'] = nodeunit.testCase(
{
	
	setUp: function (callback) {
		ServerGenerator.createServer(
			mock_server_host,
			mock_server_port,
			function(err, server) {
				mock_server = server;
				callback();
			}
		);
		
		Ni.config('http_timeout', 30000);
		Ni.config('max_redirect', 5);
	},

	tearDown: function (callback) {
		ServerGenerator.closeServer(
			mock_server,
			function(err) {
				callback();
			}
		);
	},

	'ok': function(test) {
		test.expect(1);
		
		Downloader.fetch(base_url + '/ok',
			function(err, str) {
				if (err) {
					console.log(err);
				}
				else {
					test.equal(str, okContent);
				}
				test.done();
			}
		);
	},

	'redirect': function(test) {
		test.expect(1);
		
		Downloader.fetch(
			base_url + '/redirect',
			function(err, str) {
				if (err) {
					console.log(err);
				}
				else {
					test.equal(str, okContent);
				}
				test.done();
			}
		);
	},

	/* To implement later
	
	'ssl request': function(test) {
		
		test.expect(1);
		
		Downloader.fetch('https://github.com/danwrong/restler/', // change this to something local
			function(str) {
				test.equal(str, okContent);
				test.done();   
			},
			function(err) {
				console.log(err);
				test.done();
			}
		);
		
	},
	*/

	'404 (and other http invalid codes)': function(test) {
		test.expect(1);
		
		Downloader.fetch(
			base_url + '/doesntexist',
			function(err, str) {
				if (err) {
					test.equal(err.message, 'Error 404: Page not found.');
				}
				test.done();
			}
		);
	},

	/*	This test is failing differently for different machines.
	 *	Until we figure out what's wrong, it will be disabled.
	 *	
	'bad domain name': function(test) {
		test.expect(1);
		
		Downloader.fetch('http://invaliddomainname/',
			function(str) { test.done(); },
			
			function(err) {
				test.equal(err.message, 'Cannot connect to server.');
				test.done();
			}
		);
	},
	*/

	'timeout': function(test) {
		test.expect(1);
		
		Ni.config('http_timeout', 10);
		
		Downloader.fetch(
			base_url + '/timeout',
			function(err, str) {
				if (err) {
					test.equal(err.message, 'Request timed out.');
				}
				test.done();
			}
		);
	},

	'endless redirects': function(test) {
		test.expect(1);
		
		Downloader.fetch(
			base_url + '/endlessredirect',
			function(err, str) {
				if (err) {
					test.equal(err.message, 'Endless redirection.');
				}
				test.done();
			}
		);
	},
	
	'empty URL': function(test) {
		test.expect(1);
		
		Downloader.fetch(
			'',
			function(err, str) {
				if (err) {
					test.equal(err.message, 'Invalid URL.');
				}
				test.done();
			}
		);
	},
	
	'xml file': function(test) {
		test.expect(1);
		
		Downloader.fetch(
			base_url + "/basic_xml",
			function(err, data) {
				if (err) {
					console.log(err);
				}
				else {
					test.equal(typeof data, "string");
				}
				test.done();
			}
		);
	},
	
	'rss feed': function(test) {
		test.expect(1);
		
		Downloader.fetch(
			base_url + "/real_rss",
			function(err, data) {
				if (err) {
					console.log(err);
				}
				else {
					test.equal(typeof data, "string");
				}
				test.done();
			}
		);
	},

	'live example': function(test) {
		test.expect(1);
		
		Downloader.fetch(
			"http://google.com/",
			function(err, str) {
				if (err) {
					console.log(err);
				}
				else {
					test.notEqual(str, null);
				}
				test.done();
			}
		);
	}

});
