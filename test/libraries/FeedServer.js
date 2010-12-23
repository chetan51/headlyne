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
	dbg.log('ensured teaser correct');
}
function ensureFeedAndItemsAreStored(test, test_feed, callback)
{
	FeedModel.get(
		test_feed.url,
		function(err, feed) {
			if (err) {
				dbg.log('error '+err.message);
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
								dbg.log('ensuring page stored...');
								ensureWebPageIsStored(
									test,
									item,
									step.parallel()
								);
							}
						);
					},
					function testResults(err) {
						dbg.log('going out of ensureFeed&Items');
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
	
	'feed not in database': function(test) {
		test.expect(11);
		
		Step(
			function getTeaser() {
				FeedServer.getFeedTeaser(
					basic_feed.url,
					10,
					this.parallel(),
					this.parallel()
				);
			},
			function testResults(err, immediate_teaser, updated_teaser) {
				if (err) {
					dbg.log(err.message);
					test.done();
				}
				else {
					test.equals(immediate_teaser, null);
					
					ensureFeedTeaserIsCorrect(
						test,
						basic_feed,
						updated_teaser
					);
					
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

	'feed in database and up to date': function(test) {
		test.expect(15);
		
		// First, we make sure the feed is in the database and up to date
		FeedServer.getFeedTeaser(
			basic_feed.url,
			10,
			function(err, immediate_teaser) {},
			function(err, updated_teaser) {
				if (err) {
					dbg.log(err.message);
					test.done();
				}
				else {
					// Now we try to retrieve it
					Step(
						function getTeaser() {
							FeedServer.getFeedTeaser(
								basic_feed.url,
								10,
								this.parallel(),
								this.parallel()
							);
						},
						function testResults(err, immediate_teaser, updated_teaser) {
							if (err) {
								dbg.log(err.message);
							}
							else {
								ensureFeedTeaserIsCorrect(
									test,
									basic_feed,
									immediate_teaser
								);
								
								ensureFeedTeaserIsCorrect(
									test,
									basic_feed,
									updated_teaser
								);
								
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
				}
			}
		);
	},

	'feed in database and not up to date': function(test) {
		test.expect(11);
		
		// First, we make sure the feed is in the database
		FeedServer.getFeedTeaser(
			basic_feed.url,
			10,
			function(err, immediate_teaser) {},
			function(err, updated_teaser) {
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
					Step(
						function getTeaser() {
							FeedServer.getFeedTeaser(
								basic_feed.url,
								10,
								this.parallel(),
								this.parallel()
							);
						},
						function testResults(err, immediate_teaser, updated_teaser) {
							if (err) {
								dbg.log(err.message);
								
								// Restore FeedModel.isUpToDate
								FeedModel.isUpToDate = isUpToDate_backup;
								
								test.done();
							}
							else {
								test.equal(immediate_teaser, null);
								
								ensureFeedTeaserIsCorrect(
									test,
									basic_feed,
									updated_teaser
								);
								
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
								
								// Restore FeedModel.isUpToDate
								FeedModel.isUpToDate = isUpToDate_backup;
							}
						}
					);
				}
			}
		);
	}
	
});
