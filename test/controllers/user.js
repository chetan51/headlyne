/**
 *	Module dependencies
 **/
var http            = require('http'),
    nodeunit        = require('nodeunit'),
    Step            = require('step'),
    rest            = require('restler'),
    Ni              = require('ni'),
    querystring     = require('querystring'),
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
function getAUser(callback)
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
			UserAuth.authenticate(
				'username',
				'password',
				function(err, is_new, cookie)
				{
					callback(err, cookie);
				}
			);
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

		getAUser( function(err, cookie)
		{
			if(err) throw err;

			// request to edit a new feed.
			var client = http.createClient(7500, 'localhost');

			// the request to make:
			var post_req = {
				feed_url: 'some_url',
				num_feed_items: 3,
				title_selection: 'webpage',
				body_selection: 'webpage'
			};
			var data_send = JSON.stringify(post_req);
			// headers for the request
			var headers = {
				'Host': 'localhost',
				'Cookie': JSON.stringify(cookie),
			//	'Content-Type': 'text/plain',
			//	'Content-Length': data_send.length
			};
			
			var request = client.request('POST', '/user/edit', headers);
			
			var data_recv='';
			request.on('response', function(response) {
				response.on('data', function(chunk) {
					data_recv += chunk;
				});
				response.on('end', function() {
					// check response.
					dbg.log('Received: '+data_recv.slice(0, 66)+'...');
					var data_obj = JSON.parse(data_recv);
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
				response.on('error', function(err){ console.log('ERR: '+err); });
			});

			request.on('error', function(err){ console.log('ERR: '+err); });
			
			request.end(data_send);
			dbg.log('Sent request with '+data_send);
		});
	},

	'basic-edit': function(test) {
		test.expect(6);

		getAUser( function(err, cookie)
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
					var client = http.createClient(7500, 'localhost');
					
					// the request to make:
					var post_req = {
						feed_url: 'some_url',
						num_feed_items: 3,
						title_selection: 'webpage',
						body_selection: 'webpage'
					};
					var data_send = JSON.stringify(post_req);
					// headers for the request
					var headers = {
						'Host': 'localhost',
						'Cookie': JSON.stringify(cookie),
					//	'Content-Type': 'text/plain',
					//	'Content-Length': data_send.length
					};
					
					var request = client.request('POST', '/user/edit', headers);
					
					var data_recv='';
					request.on('response', function(response) {
						response.on('data', function(chunk) {
							data_recv += chunk;
						});
						response.on('end', function()
						{
							// check response.
							dbg.log('Received: '+data_recv.slice(0, 66)+'...');
							var data_obj = JSON.parse(data_recv);
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
					});

					request.on('error', function(err){ console.log('ERR: '+err); });
					
					request.end(data_send);
					dbg.log('Sent request with '+data_send);
				}
			);
		});
	}
});

exports['sort'] = nodeunit.testCase(
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
	
	'basic': function(test) {
		test.expect(8);

		getAUser( function(err, cookie)
		{
			if(err) throw err;

			// request to edit a new feed.
			var client = http.createClient(7500, 'localhost');

			// the request to make:
			var post_req = {
				feed_array: [
				[ {
					url: 'some_url',
					num_feed_items: 4,
					title_selection: 'webpage',
					body_selection: 'webpage'
				} ],
				[ ],
				[ ],
				[ {
					url: 'other_url',
					num_feed_items: 4,
					title_selection: 'webpage',
					body_selection: 'webpage'
				} ]
				]
			};
			var data_send = JSON.stringify(post_req);
			// headers for the request
			var headers = {
				'Host': 'localhost',
				'Cookie': JSON.stringify(cookie),
			//	'Content-Type': 'text/plain',
			//	'Content-Length': data_send.length
			};
			
			var request = client.request('POST', '/user/sort', headers);
			
			var data_recv='';
			request.on('response', function(response) {
				response.on('data', function(chunk) {
					data_recv += chunk;
				});
				response.on('end', function() {
					// check response.
					dbg.log('Received: '+data_recv.slice(0, 66)+'...');
					var data_obj = JSON.parse(data_recv);
					test.equal(data_obj.error, null);
					test.equal(data_obj.success, true);
					// check database.
					getUserFeeds( function(err, feeds)
					{
						dbg.log(feeds);
						if(err) throw err;
						test.equal(feeds.length, 4);
						test.equal(feeds[0].length, 1);
						test.equal(feeds[1].length, 0);
						test.equal(feeds[3].length, 1);
						test.equal(feeds[0][0].url, 'some_url');
						test.equal(feeds[3][0].url, 'other_url');
						test.done();
					});
				});
				response.on('error', function(err){ console.log('ERR: '+err); });
			});

			request.on('error', function(err){ console.log('ERR: '+err); });
			
			request.end(data_send);
			dbg.log('Sent request with '+data_send);
		});
	}
});
