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
			link    : "http://localhost:7500/blogpost1",
			title   : "Item 1 Title",
			webpage : {
				title: "Why Node.js Is Totally Awesome \n            \n            Chetan Surpur"
			}
		},
		{
			link    : "http://localhost:7500/blogpost2",
			title   : "Item 2 Title",
			webpage : {
				title: "Life Hack - The 30/30 Minute Work Cycle Feels Like Magic \n            \n            Chetan Surpur"
			}
		}
	]
}

/**
 *	Helper functions
 **/
function ensureFeedTeaserIsCorrect(test, test_feed, feed_teaser)
{
	test.equal(feed_teaser.title, test_feed.title);
	for (var i in test_feed.items) {
		for (var j in feed_teaser.items) {
			if (feed_teaser.items[j].link == test_feed.items[i].link) {
				test.equal(feed_teaser.items[j].title, test_feed.items[i].title);
				test.equal(feed_teaser.items[j].webpage.title, test_feed.items[i].webpage.title);
			}
		}
	}
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
				
				for (var i in test_feed.items) {
					for (var j in feed.items) {
						if (feed.items[j].link == test_feed.items[i].link) {
							test.equal(feed.items[j].title, test_feed.items[i].title);
						}
					}
					
				}
				
				Step(
					function checkWebPages() {
						var step = this;
						
						test_feed.items.forEach(
							function(item) {
								ensureWebPageIsStored(
									test,
									item,
									step.parallel()
								);
							}
						);
					},
					function done(err) {
						if (err) {
							console.log(err);
						}
						test.done();
					}
				);
			}
		}
	);
}
function ensureWebPageIsStored(test, feed_item, callback) {
	WebPageModel.get(
		feed_item.link,
		function(err, webpage) {
			if (err) {
				callback(err)
			}
			else {
				test.equal(webpage.title, feed_item.webpage.title);
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
		test.expect(10);
		
		FeedServer.getFeedTeaser(
			basic_feed.url,
			10,
			function(err, feed_teaser) {
				if (err) {
					console.log(err.message);
					test.done();
				}
				else {
					ensureFeedTeaserIsCorrect(test, basic_feed, feed_teaser);
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
		test.expect(10);
		
		// First, we make sure the feed is in the database
		FeedServer.getFeedTeaser(
			basic_feed.url,
			10,
			function(err, feed_teaser) {
				if (err) {
					console.log(err.message);
					test.done();
				}
				else {
					// Then we make FeedServer think the feed expired
					var isUpToDate_backup = FeedModel.isUpToDate;
					FeedModel.isUpToDate = function(feed_url, callback) {
						callback(null, false);
					}

					// Now we try to retrieve it
					FeedServer.getFeedTeaser(
						basic_feed.url,
						10,
						function(err, feed_teaser) {
							if (err) {
								console.log(err.message);
								test.done();
							}
							else {
								ensureFeedTeaserIsCorrect(test, basic_feed, feed_teaser);
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
			function(err, feed_teaser) {
				if (err) {
					console.log(err.message);
				}
				else {
					test.equals(feed_teaser, null);
				}
				test.done();
			}
		);
	},

	'feed in database and up to date': function(test) {
		test.expect(5);
		
		// First, we make sure the feed is in the database and up to date
		FeedServer.getFeedTeaser(
			basic_feed.url,
			10,
			function(err, feed_teaser) {
				if (err) {
					console.log(err.message);
					test.done();
				}
				else {
					// Now we try to retrieve it
					FeedServer.getFeedTeaserUrgently(
						basic_feed.url,
						10,
						function(err, feed_teaser) {
							if (err) {
								console.log(err.message);
							}
							else {
								ensureFeedTeaserIsCorrect(test, basic_feed, feed_teaser);
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
			function(err, feed_teaser) {
				if (err) {
					console.log(err.message);
					test.done();
				}
				else {
					// Then we make FeedServer think the feed expired
					var isUpToDate_backup = FeedModel.isUpToDate;
					FeedModel.isUpToDate = function(feed_url, callback) {
						callback(null, false);
					}

					// Now we try to retrieve it
					FeedServer.getFeedTeaserUrgently(
						basic_feed.url,
						10,
						function(err, feed_teaser) {
							if (err) {
								console.log(err.message);
							}
							else {
								test.equal(feed_teaser, null);
								
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
