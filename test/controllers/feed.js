/**
 *	Module dependencies
 **/
var http            = require('http'),
    nodeunit        = require('nodeunit'),
    Step            = require('step'),
    rest            = require('restler'),
    Ni              = require('ni'),
    ServerGenerator = require('../mocks/ServerGenerator.js'),
    DatabaseFaker   = require('../mocks/DatabaseFaker.js'),
    FeedController  = require('../../src/controllers/feed.js'),
    dbg             = require('../../src/libraries/Debugger.js');

/**
 *	Configurations
 **/
Ni.config('log_enabled', true);
Ni.config('root', __dirname + "/../../src");

/**
 *	Constants and mocks
 **/
var mock_server      = null,
    mock_server_host = "localhost",
    mock_server_port = 7500;

/**
 *	Tests
 **/
exports['preview'] = nodeunit.testCase(
{
	setUp: function(callback) {
		Step(
			function mockServerAndDatabase() {
				var step = this;
				
				ServerGenerator.createServer(
					mock_server_host,
					mock_server_port,
					step.parallel()
				);
				
				DatabaseFaker.setUp(
					['feeds', 'webpages'],
					step.parallel()
				);
			},
			function testResults(err, server) {
				if (err) throw err;
				mock_server = server;
				callback();
			}
		);
		
		Ni.config('http_timeout',       30000);
		Ni.config('feedparse_timeout',  5000);
		Ni.config('feed_expiry_length', 30 * 60 * 1000);
		Ni.config('max_redirect',       5);
	},
	 
	tearDown: function(callback) {
		Step(
			function closeServerAndDatabase() {
				var step = this;
				
				ServerGenerator.closeServer(
					mock_server,
					step.parallel()
				);
				
				DatabaseFaker.tearDown(
					['feeds', 'webpages'],
					step.parallel()
				);
			},
			function testResults(err) {
				if (err) throw err;
				callback();
			}
		);
	},
	
	'basic': function(test) {
		test.expect(2);
		// request correct page.
		// check response.
		rest.post('http://localhost:7500/feed/preview', {
			data: {
				feed_url: 'http://feeds.reuters.com/reuters/companyNews?format=xml'
			},
		}).addListener('complete', function(data, response) {
			test.equal(data.error, null);
			test.ok(data.preview.length);
			dbg.log(data.preview);
			test.done();
		});
	}
});

exports['webpage'] = nodeunit.testCase(
{
	setUp: function(callback) {
		Step(
			function mockServerAndDatabase() {
				var step = this;
				
				ServerGenerator.createServer(
					mock_server_host,
					mock_server_port,
					step.parallel()
				);
				
				DatabaseFaker.setUp(
					['feeds', 'webpages'],
					step.parallel()
				);
			},
			function testResults(err, server) {
				if (err) throw err;
				mock_server = server;
				callback();
			}
		);
		
		Ni.config('http_timeout',       30000);
		Ni.config('feedparse_timeout',  5000);
		Ni.config('feed_expiry_length', 30 * 60 * 1000);
		Ni.config('max_redirect',       5);
	},
	 
	tearDown: function(callback) {
		Step(
			function closeServerAndDatabase() {
				var step = this;
				
				ServerGenerator.closeServer(
					mock_server,
					step.parallel()
				);
				
				DatabaseFaker.tearDown(
					['feeds', 'webpages'],
					step.parallel()
				);
			},
			function testResults(err) {
				if (err) throw err;
				callback();
			}
		);
	},
	
	'basic': function(test) {
		test.expect(2);
		// request correct page.
		// check response.
		rest.post('http://localhost:7500/feed/webpage', {
			data: {
				webpage_url: 'http://www.futilitycloset.com/2010/12/31/mail-snail/'
			},
		}).addListener('complete', function(data, response) {
			test.equal(data.error, null);
			test.ok(data.page.length);
			dbg.log(data.page);
			test.done();
		});
	}
});
