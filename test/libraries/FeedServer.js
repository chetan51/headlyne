/**
 *	Module dependencies
 **/
var http            = require('http'),
    nodeunit        = require('nodeunit'),
    Step            = require('step'),
    ServerGenerator = require('../mocks/ServerGenerator.js'),
    DatabaseMocker  = require('../mocks/DatabaseMocker.js'),
    FeedModel       = require('../../src/models/Feed.js'),
    FeedServer      = require('../../src/libraries/FeedServer.js');

/**
 *	Constants and mocks
 **/
var mock_server      = null;
    mock_server_host = "localhost",
    mock_server_port = 7500;

var basic_feed_url   = "http://" + mock_server_host + ":" + mock_server_port
                     + "/basic_feed",
    basic_feed_title = "RSS Title";

/**
 *	Tests
 **/
exports['get feed teaser'] = nodeunit.testCase(
{
	
	setUp: function(callback) {
		Step(
			function mockServer() {
				var done = this;
				
				ServerGenerator.createServer(
					mock_server_host,
					mock_server_port,
					function(server) {
						mock_server = server;
						done();
					}
				);
			},
			function mockDatabase() {
				DatabaseMocker.setUp(
					function() {
						callback();
					},
					function(err) {
						console.log(err);
					}
				);
			}
		);
	},
	 
	tearDown: function(callback) {
		Step(
			function closeServer() {
				var done = this;
				
				ServerGenerator.closeServer(
					mock_server,
					function() {
						done();
					}
				);
			},
			function clearDatabase() {
				DatabaseMocker.tearDown(
					'feeds',
					function() {
						callback();
					},
					function(err) {
						console.log(err);
					}
				);
			}
		);
	},

	'feed not in database and instant on': function(test) {
		test.expect(1);
		
		FeedServer.getFeedTeaser(
			basic_feed_url,
			10,
			function(feed) {
				test.equals(feed, null);
				test.done();
			},
			function(err) {
				test.done();
			},
			true
		);
	},

	'feed not in database and instant off': function(test) {
		test.expect(2);
		
		FeedServer.getFeedTeaser(
			basic_feed_url,
			10,
			function(feed) {
				test.equal(feed.title, basic_feed_title);
				FeedModel.get(
					basic_feed_url,
					function(err) {},
					function(feed) {
						test.equal(feed.title, basic_feed_title);
						test.done();
					}
				);
			},
			function(err) {
				test.done();
			},
			false
		);
	},
	
	'feed in database and up to date and instant on': function(test) {
		test.expect(2);
		
		// First, we make sure the feed is in the database and up to date
		FeedServer.getFeedTeaser(
			basic_feed_url,
			10,
			function(feed) {
				FeedModel.get(
					basic_feed_url,
					function(err) {
						test.done();
					},
					function(feed) {
						// Now we try to retrieve it
						FeedServer.getFeedTeaser(
							basic_feed_url,
							10,
							function(feed) {
								test.equal(feed.title, basic_feed_title);
								FeedModel.get(
									basic_feed_url,
									function(err) {},
									function(feed) {
										test.equal(feed.title, basic_feed_title);
										test.done();
									}
								);
							},
							function(err) {
								test.done();
							},
							true
						);
					}
				);
			},
			function(err) {
				test.done();
			},
			false
		);
	}

});
