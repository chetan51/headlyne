/**
 *	Module dependencies
 **/
var http            = require('http'),
    nodeunit        = require('nodeunit'),
    ServerGenerator = require('../mocks/ServerGenerator.js'),
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
		ServerGenerator.createServer(
			mock_server_host,
			mock_server_port,
			function(server) {
				mock_server = server;
				callback();
			}
		);
	},
	 
	tearDown: function(callback) {
		ServerGenerator.closeServer(
			mock_server,
			function() {
				callback();
			}
		);
	},

	'feed in not in database and instant is on': function(test) {
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

	'feed in not in database and instant is off': function(test) {
		test.expect(2);
		
		FeedServer.getFeedTeaser(
			basic_feed_url,
			10,
			function(feed) {
				test.equal(feed.title, basic_feed_title);
				FeedModel.get(
					basic_feed_url,
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
	}

});
