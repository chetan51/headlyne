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
    FeedServer      = require('../../src/libraries/FeedServer.js'),
    dbg             = require('../../src/libraries/Debugger.js');

/**
 *	Configurations
 **/
Ni.config('log_enabled', false);

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
	console.log('ensured teaser correct');
}
function ensureFeedAndItemsAreStored(test, test_feed, callback)
{
	FeedModel.get(
		test_feed.url,
		function(err, feed) {
			if (err) {
				console.log('error '+err.message);
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
								console.log('ensuring page stored...');
								ensureWebPageIsStored(
									test,
									item,
									step.parallel()
								);
							}
						);
					},
					function done(err) {
						console.log('going out of ensureFeed&Items');
						if (err) {
							dbg.log(err);
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
		dbg.log('setup called');
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
				dbg.log("done: "+mock_server);
				callback();
			}
		);
		
		Ni.config('http_timeout',       30000);
		Ni.config('feedparse_timeout',  5000);
		Ni.config('feed_expiry_length', 30 * 60 * 1000);
		Ni.config('max_redirect',       5);
	},
	 
	tearDown: function(callback) {
		console.log('start teardown');
		Step(
			function closeServerAndDatabase() {
				var step = this;
				dbg.log('teardown: '+mock_server);
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
	
	/*'real-life test': function(test) {
		test.expect(1);
		
		FeedServer.getFeedTeaser(
			"http://www.feedforall.com/sample.xml",
			10,
			function(err, feed_teaser) {
				dbg.log(err);
				dbg.log(feed_teaser);
				dbg.log(feed_teaser.items[0].webpage);
				test.ok(1);
				test.done();
			}
		);
	},*/

	'feed not in database': function(test) {
		test.expect(10);
		
		FeedServer.getFeedTeaser(
			basic_feed.url,
			10,
			function(err, feed_teaser) {
				console.log('got feed teaser');
				if (err) {
					dbg.log(err.message);
					test.done();
				}
				else {
					ensureFeedTeaserIsCorrect(test, basic_feed, feed_teaser);
					ensureFeedAndItemsAreStored(
						test,
						basic_feed,
						function(err) {
							if (err) {
								dbg.log(err.message);
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
					dbg.log(err.message);
					
					// Restore FeedModel.isUpToDate
					FeedModel.isUpToDate = isUpToDate_backup;
					
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
								dbg.log(err.message);
								test.done();
							}
							else {
								ensureFeedTeaserIsCorrect(test, basic_feed, feed_teaser);
								ensureFeedAndItemsAreStored(
									test,
									basic_feed,
									function(err) {
										if (err) {
											dbg.log(err.message);
											test.done();
										}
										test.done();
									}
								);
							}
					
							// Restore FeedModel.isUpToDate
							FeedModel.isUpToDate = isUpToDate_backup;
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
		test.expect(11);
		
		FeedServer.getFeedTeaserUrgently(
			basic_feed.url,
			10,
			function(err, feed_teaser) {
				if (err) {
					dbg.log(err.message);
				}
				else {
					test.equals(feed_teaser, null);
				}
			},
			function(err, feed_teaser_updated) {
				if (err) {
					console.log(err.message);
				}
				else {
					ensureFeedTeaserIsCorrect(
						test,
						basic_feed,
						feed_teaser_updated
					);
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

	'feed in database and up to date': function(test) {
		test.expect(5);
		
		// First, we make sure the feed is in the database and up to date
		FeedServer.getFeedTeaser(
			basic_feed.url,
			10,
			function(err, feed_teaser) {
				if (err) {
					dbg.log(err.message);
					test.done();
				}
				else {
					// Now we try to retrieve it
					FeedServer.getFeedTeaserUrgently(
						basic_feed.url,
						10,
						function(err, feed_teaser) {
							if (err) {
								dbg.log(err.message);
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
		test.expect(11);
		
		// First, we make sure the feed is in the database
		FeedServer.getFeedTeaser(
			basic_feed.url,
			10,
			function(err, feed_teaser) {
				if (err) {
					dbg.log(err.message);
					
					// Restore FeedModel.isUpToDate
					FeedModel.isUpToDate = isUpToDate_backup;
					
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
								dbg.log(err.message);
							}
							else {
								test.equal(feed_teaser, null);
							}
						},
						function(err, feed_teaser_updated) {
							if (err) {
								console.log(err.message);
							}
							else {
								ensureFeedTeaserIsCorrect(
									test,
									basic_feed,
									feed_teaser_updated
								);
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
							
							// Restore FeedModel.isUpToDate
							FeedModel.isUpToDate = isUpToDate_backup;
						}
					);
				}
			}
		);
	}
	
});
