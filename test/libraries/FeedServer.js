/**
 *	Module dependencies
 **/
var http            = require('http'),
    nodeunit        = require('nodeunit'),
    Step            = require('step'),
    Ni              = require('ni'),
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

var basic_feed = {
	url     : "http://" + mock_server_host + ":" + mock_server_port + "/basic_feed",
	title   : "RSS Title",
	items	: [
		{
			title   : "Item 1 Title",
			webpage : {
				title: "Webpage 1 Title"
			}
		}
	]
}

/**
 *	Helper functions
 **/
function ensureFeedIsCorrect(test, test_feed, feed)
{
	test.equal(feed.title, test_feed.title);
}
function ensureFeedAndItemsAreStored(test, test_feed, callback)
{
	FeedModel.get(
		test_feed.url,
		function(err, feed) {
			if (err) {
				callback(err);
			}
			else {
				test.equal(feed.title, test_feed.title);
				test.equal(feed.items[0].title, test_feed.items[0].title);
				
/*				// Make sure the first feed item's web page is in the database
				WebPageModel.get(
					feed.items[0].url,
					function(err, webpage) {
						if (err) {
							console.log(err.message);
						}
						else {
							test.equal(webpage.title,
								   test_feed.items[0].webpage.title);
						}
						test.done();
					}
				);
				*/
				callback(null);
			}
		}
	);
}

/**
 *	Tests
 **/
exports['get feed teaser'] = nodeunit.testCase(
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
			function done(err, server) {
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
			function done(err) {
				if (err) throw err;
				callback();
			}
		);
	},

	'feed not in database': function(test) {
		test.expect(3);
		
		FeedServer.getFeedTeaser(
			basic_feed.url,
			10,
			function(err, feed) {
				if (err) {
					console.log(err.message);
					test.done();
				}
				else {
					ensureFeedIsCorrect(test, basic_feed, feed);
					ensureFeedAndItemsAreStored(
						test,
						basic_feed,
						function(err) {
							if (err) {
								console.log(err.message);
							}
							test.done();
						}
					);
				}
			}
		);
	},
	
	'feed in database and not up to date': function(test) {
		test.expect(3);
		
		// First, we make sure the feed is in the database
		FeedServer.getFeedTeaser(
			basic_feed.url,
			10,
			function(err, feed) {
				if (err) {
					console.log(err.message);
					test.done();
				}
				else {
					// Then we make FeedServer think the feed expired
					var isUpToDate_backup = FeedModel.isUpToDate;
					FeedModel.isUpToDate = function(feed_url, callback) {
						callback(false);
					}

					// Now we try to retrieve it
					FeedServer.getFeedTeaser(
						basic_feed.url,
						10,
						function(err, feed) {
							if (err) {
								console.log(err.message);
								test.done();
							}
							else {
								ensureFeedIsCorrect(test, basic_feed, feed);
								ensureFeedAndItemsAreStored(
									test,
									basic_feed,
									function(err) {
										if (err) {
											console.log(err.message);
											test.done();
										}
										test.done();
									}
								);
								
								// Restore FeedModel.isUpToDate
								FeedModel.isUpToDate = isUpToDate_backup;
							}
						},
						function(err) {
							test.done();
						}
					);
				}
			}
		);
	}
	
});

exports['get feed teaser urgently'] = nodeunit.testCase(
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
			function done(err, server) {
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
			function done(err) {
				if (err) throw err;
				callback();
			}
		);
	},
	
	'feed not in database': function(test) {
		test.expect(1);
		
		FeedServer.getFeedTeaserUrgently(
			basic_feed.url,
			10,
			function(err, feed) {
				if (err) {
					console.log(err.message);
				}
				else {
					test.equals(feed, null);
				}
				test.done();
			}
		);
	},

	'feed in database and up to date': function(test) {
		test.expect(1);
		
		// First, we make sure the feed is in the database and up to date
		FeedServer.getFeedTeaser(
			basic_feed.url,
			10,
			function(err, feed) {
				if (err) {
					console.log(err.message);
					test.done();
				}
				else {
					// Now we try to retrieve it
					FeedServer.getFeedTeaserUrgently(
						basic_feed.url,
						10,
						function(err, feed) {
							if (err) {
								console.log(err.message);
							}
							else {
								ensureFeedIsCorrect(test, basic_feed, feed);
							}
							test.done();
						}
					);
				}
			},
			function(err) {
				test.done();
			}
		);
	},

	'feed in database and not up to date': function(test) {
		test.expect(1);
		
		// First, we make sure the feed is in the database
		FeedServer.getFeedTeaser(
			basic_feed.url,
			10,
			function(err, feed) {
				if (err) {
					console.log(err.message);
					test.done();
				}
				else {
					// Then we make FeedServer think the feed expired
					var isUpToDate_backup = FeedModel.isUpToDate;
					FeedModel.isUpToDate = function(feed_url, callback) {
						callback(false);
					}

					// Now we try to retrieve it
					FeedServer.getFeedTeaserUrgently(
						basic_feed.url,
						10,
						function(err, feed) {
							if (err) {
								console.log(err.message);
							}
							else {
								test.equal(feed, null);
								
								// Restore FeedModel.isUpToDate
								FeedModel.isUpToDate = isUpToDate_backup;
							}
							test.done();
						}
					);
				}
			}
		);
	}
	
});
