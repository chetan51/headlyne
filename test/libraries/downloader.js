/*
 *  Module dependencies
 */
var nodeunit = require('nodeunit');
var ServerGenerator = require('../../test/mocks/ServerGenerator.js');
var Downloader = require('../../src/libraries/Downloader.js');

/*
 *  Constants
 */
var okContent = "<html><head></head><body>ok</body></html>";

/*
 *  Run mock server for tests
 */
ServerGenerator.createServer('localhost', 7000, function() {});

/*
 *  Tests
 */
exports['fetch URLs'] = nodeunit.testCase(
{
	
	setUp: function () {
	},
	 
	tearDown: function () {
	},

	'ok': function(test) {
		
		test.expect(1);
		
		// First test using a mock must have a timeout.
		// Otherwise, it makes the request before the server is ready.
		
		setTimeout(function(){
			Downloader.fetch('http://localhost:7000/ok',
				function(str) {
					test.equal(str, okContent);
					test.done();
				},
				function(str) {
					test.done();
				}
			);
		}, 1000);
	},

	'redirect': function(test) {
		test.expect(1);
		
		Downloader.fetch('http://localhost:7000/redirect', function(str) {
			test.equal(str, okContent);
			test.done();   
		}, function(str) {
			test.done();
		});
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
		
		Downloader.fetch('http://localhost:7000/doesntexist',
			function(str) { test.done(); },
			
			function(err) {
				test.equal(err.message, 'Error 404: Page not found.');
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
		
		Downloader.fetch('http://localhost:7000/timeout',
			function(str) { test.done(); },
			
			function(err) {
				test.equal(err.message, 'Request timed out.');
				test.done();
			}
		,0);
	},

	'endless redirects': function(test) {
		
		test.expect(1);
		
		Downloader.fetch('http://localhost:7000/endlessredirect',
			function(str) { test.done(); },
			
			function(err) {
				test.equal(err.message, 'Endless redirection.');
				test.done();
			}
		);
	}

});
