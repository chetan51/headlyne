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
			dbg.log('Received: '+data.slice(0, 66)+'...');
			var data_obj = JSON.parse(data);
			test.equal(data_obj.error, null);
			test.ok(data_obj.preview.length);
			test.done();
		});
	}
/*
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
	},
	
	'0 web pages requested': function(test) {
		test.expect(1);
		test.done();
	}*/
});
