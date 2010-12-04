/*
 *  Module dependencies
 */

var nodeunit = require('nodeunit');
var ServerGenerator = require('../../test/mocks/server.js');
var Downloader = require('../../src/libraries/downloader.js');

/*
 *  Constants
 */

var okContent = "<html><head></head><body>ok</body></html>";

/*
 *  Tests
 */

exports['fetch URLs'] = nodeunit.testCase({

    setUp: function () {
        
        thisTest = this;

        ServerGenerator.createServer('localhost', 7000,
            function(serv) {
                thisTest.server = serv;
            }
        );
    },

    tearDown: function () {
        ServerGenerator.closeServer(this.server, function() {});
    },

	'ok': function(test)
	{

		test.expect(1);

        Downloader.fetch('http://localhost:7000/ok',
            function(str){
                test.equal(str, okContent);
                test.done();
            }
        );
		
	},

	'redirect': function(test)
	{

		test.expect(1);

        Downloader.fetch('http://localhost:7000/redirect',
            function(str){
                test.equal(str, okContent);
                test.done();   
            }
        );
		
	},

	'404 (and other http invalid codes)': function(test)
	{

		test.expect(1);

        Downloader.fetch('http://localhost:7000/doesntexist',
            function(str) {},
            function(err) {
                test.equal(err.message, 'Error 404: Page not found.');
                test.done();
            }
        );

	},

	'bad domain name': function(test)
	{
		test.expect(1);

        Downloader.fetch('http://invaliddomainname/',
            function(str) {},
            function(err) {
                test.equal(err.message, 'Error 302: Page not found.');
                test.done();
            }
        );

	},

/*  This test takes too long to run (obviously), but we still
 *  need it somehow to test the timeout function. Somehow make
 *  it run in parallel with the other tests or something.
 *
    'timeout': function(test)
	{

		test.expect(1);

        Downloader.fetch('http://localhost:7000/timeout',
            function(str) {},
            function(err) {
                test.equal(err.message, 'Request timed out.');
                test.done();
            }
        );
		
	},
*/

	'endless redirects': function(test)
	{

		test.expect(1);

        Downloader.fetch('http://localhost:7000/endlessredirect',
            function(str) {},
            function(err) {
                test.equal(err.message, 'Endless redirection.');
                test.done();
            }
        );
		
	}

});
