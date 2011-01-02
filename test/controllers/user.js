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
    UserModel       = require('../../src/models/User.js'),
    UserAuth        = require('../../src/libraries/UserAuth.js'),
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
 * Helper functions
 **/
function makeUser(callback)
{
	UserModel.save(
		'username',
		'password',
		'first_name',
		'last_name',
		'email_id',
		function(err, user)
		{
			if( err != null) {
				callback(err);
				return;
			}
			// user saved.
			callback(null);
		}
	);
}
function getUserFeeds(callback)
{
	UserModel.get(
		'username',
		function(err, user)
		{
			if(err) callback(err);
			else    callback(err, user.feeds);
		}
	);
}

/**
 *	Tests
 **/
exports['edit'] = nodeunit.testCase(
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
					['users'],
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
		Ni.config('session_lifetime',   14 * 24 * 60 * 60 * 1000);
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
					['users'],
					step.parallel()
				);
			},
			function testResults(err) {
				if (err) throw err;
				callback();
			}
		);
	},
	
	'basic-add': function(test) {
		test.expect(6);

		makeUser( function(err)
		{
			if(err) throw err;

			// request to edit a new feed.
			rest.post('http://localhost:7500/user/edit', {
				data: {
					feed_url: 'some_url',
					num_feed_items: 3,
					title_selection: 'webpage',
					body_selection: 'webpage'
				},
			}).addListener('complete', function(data, response) {
				// check response.
				dbg.log('Received: '+data.slice(0, 66)+'...');
				var data_obj = JSON.parse(data);
				test.equal(data_obj.error, null);
				test.equal(data_obj.success, true);
				// check database.
				getUserFeeds( function(err, feeds)
				{
					if(err) throw err;
					test.equal(feeds.length, 1);
					test.equal(feeds[0].length, 1);
					test.equal(feeds[0][0].url, 'some_url');
					test.equal(feeds[0][0].num_feed_items, 3);
					test.done();
				});
			});
		});
	},

	'basic-edit': function(test) {
		test.expect(6);

		makeUser( function(err)
		{
			if(err) throw err;

			// add the feed to the user.
			UserModel.placeFeed(
				'username',
				'some_url',
				0, 2,
				function(err, callback)
				{
					if(err) throw err;

					// request to edit the feed.
					rest.post('http://localhost:7500/user/edit', {
						data: {
							feed_url: 'some_url',
							num_feed_items: 3,
							title_selection: 'webpage',
							body_selection: 'webpage'
						},
					}).addListener('complete', function(data, response) {
						// check response.
						dbg.log('Received: '+data.slice(0, 66)+'...');
						var data_obj = JSON.parse(data);
						test.equal(data_obj.error, null);
						test.equal(data_obj.success, true);
						// check database.
						getUserFeeds( function(err, feeds)
						{
							if(err) throw err;
							test.equal(feeds.length, 3);
							test.equal(feeds[2].length, 1);
							test.equal(feeds[2][0].url, 'some_url');
							test.equal(feeds[2][0].num_feed_items, 3);
							test.done();
						});
					});
				}
			);
		});
	}
});
