/**
 *	Module dependencies
 **/
var http            = require('http'),
    nodeunit        = require('nodeunit'),
    Step            = require('step'),
    ServerGenerator = require('../mocks/ServerGenerator.js'),
    DatabaseFaker   = require('../mocks/DatabaseFaker.js'),
    FeedModel       = require('../../src/models/Feed.js'),
    WebPageModel    = require('../../src/models/WebPage.js'),
    FeedServer      = require('../../src/libraries/FeedServer.js');

/**
 *	Constants and mocks
 **/
var mock_server      = null;
    mock_server_host = "localhost",
    mock_server_port = 7500;

var basic_feed_url            = "http://" + mock_server_host + ":" + mock_server_port
                                + "/basic_feed",
    basic_feed_title          = "RSS Title";
    basic_feed_item1_title    = "Item 1 Title";
    basic_feed_webpage1_title = "Webpage 1 Title";

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
				DatabaseFaker.setUp(
					['feeds', 'webpages'],
					function(err) {
						if (err) {
							throw err;
						}
						else {
							callback();
						}
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
			function closeDatabase() {
				DatabaseFaker.tearDown(
					['feeds', 'webpages'],
					function(err) {
						if (err) {
							throw err;
						}
						else {
							callback();
						}
					}
				);
			}
		);
	},

	'feed not in database': function(test) {
		test.expect(4);
		
		FeedServer.getFeedTeaser(
			basic_feed_url,
			10,
			function(feed) {
				test.equal(feed.title, basic_feed_title);
				
				// Make sure feed is in the database
				FeedModel.get(
					basic_feed_url,
					function(err) {},
					function(feed) {
						test.equal(feed.title, basic_feed_title);
						test.equal(feed.items[0].title, basic_feed_item1_title);
						
						// Make sure the first feed item's web page is in the database
						WebPageModel.get(
							feed.items[0].url,
							function(err) {
								test.done();
							},
							function(webpage) {
								test.equal(webpage.title,
								           basic_feed_webpage1_title);
								test.done();
							}
						);
					}
				);
			},
			function(err) {
				test.done();
			},
			false
		);
	},
	
	'feed in database and not up to date': function(test) {
		test.expect(1);
		
		// First, we make sure the feed is in the database
		FeedServer.getFeedTeaser(
			basic_feed_url,
			10,
			function(feed) {
				// Then we make FeedServer think the feed expired
				var isUpToDate_backup = FeedModel.isUpToDate;
				FeedModel.isUpToDate = function(feed_url, expire_length, errback, callback) {
					callback(false);
				}

				// Now we try to retrieve it
				FeedServer.getFeedTeaser(
					basic_feed_url,
					10,
					function(feed) {
						test.equal(feed.title, basic_feed_title);
						
						// Restore FeedModel.isUpToDate
						FeedModel.isUpToDate = isUpToDate_backup;

						test.done();
					},
					function(err) {
						test.done();
					},
					false
				);
			},
			function(err) {
				test.done();
			},
			false
		);
	}
	
});

exports['get feed teaser urgently'] = nodeunit.testCase(
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
				DatabaseFaker.setUp(
					['feeds'],
					function(err) {
						if (err) {
							throw err;
						}
						else {
							callback();
						}
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
			function closeDatabase() {
				DatabaseFaker.tearDown(
					['feeds'],
					function(err) {
						if (err) {
							throw err;
						}
						else {
							callback();
						}
					}
				);
			}
		);
	},
	
	'feed not in database': function(test) {
		test.expect(1);
		
		FeedServer.getFeedTeaserUrgently(
			basic_feed_url,
			10,
			function(feed) {
				test.equals(feed, null);
				test.done();
			},
			function(err) {
				test.done();
			}
		);
	},

	'feed in database and up to date': function(test) {
		test.expect(2);
		
		// First, we make sure the feed is in the database and up to date
		FeedServer.getFeedTeaser(
			basic_feed_url,
			10,
			function(feed) {
				// Now we try to retrieve it
				FeedServer.getFeedTeaserUrgently(
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
			},
			function(err) {
				test.done();
			},
			false
		);
	},

	'feed in database and not up to date': function(test) {
		test.expect(1);
		
		// First, we make sure the feed is in the database
		FeedServer.getFeedTeaser(
			basic_feed_url,
			10,
			function(feed) {
				// Then we make FeedServer think the feed expired
				var isUpToDate_backup = FeedModel.isUpToDate;
				FeedModel.isUpToDate = function(feed_url, expire_length, errback, callback) {
					callback(false);
				}

				// Now we try to retrieve it
				FeedServer.getFeedTeaserUrgently(
					basic_feed_url,
					10,
					function(feed) {
						test.equal(feed, null);
						
						// Restore FeedModel.isUpToDate
						FeedModel.isUpToDate = isUpToDate_backup;

						test.done();
					},
					function(err) {
						test.done();
					},
					true
				);
			},
			function(err) {
				test.done();
			},
			false
		);
	}
	
});
