var http = require('http')
var nodeunit = require('nodeunit');
var FeedModel = require('../../src/models/Feed.js');
var DatabaseDriver = require('../../src/libraries/DatabaseDriver.js');
var Mongo      = require('mongodb'),
    Db         = Mongo.Db,
    Connection = Mongo.Connection,
    Server     = Mongo.Server,
    BSON       = Mongo.BSONPure;


exports['save'] = nodeunit.testCase(
{
	setUp: function (callback) {
		/**
		 * DB Access Parameters
		 **/
		var db_name = 'headlyne',
		    db_addr = '127.0.0.1',
		    db_port = 27017,
		    db_user = 'username',
		    db_pass = 'password';

		DatabaseDriver.init(
		    db_name,
		    db_addr,
		    db_port,
		    db_user,
		    db_pass
		);
		callback();
	},
	 
	tearDown: function (callback) {
		DatabaseDriver.getCollection(
			'feeds',
			function(err)
			{
				console.log('Suite-teardown: '+err);
			},
			function(collection)
			{
				collection.remove(
					function(err, doc)
					{
						if(err != null)
							console.log('Test-suite cannot terminate.');
						else {
							callback();
						}
					}
				);
			}
		);
	},

	'save 1 feed': function(test)
	{
		test.expect(1);
		FeedModel.save(
			'url',
			'titles',
			'my_name',
			'hello tester!',
			function(err)
			{
				console.log(err.message);
			},
			function(feed)
			{
				console.log(feed);
			}
		);
		test.ok(1);
		test.done();
	},

	'save feed twice': function(test)
	{
		test.expect(1);
		FeedModel.save(
			'doubled_url',
			'titles',
			'feed_auth',
			'dupplicated feed',
			function(err)
			{
				console.log(err.message);
				test.done();
			},
			function(feed)
			{
				FeedModel.save(
					'doubled_url',
					'diff_title',
					'diff_name',
					'diff_description',
					function(err)
					{
						console.log(err.message);
						test.done();
					},
					function(feed2)
					{
						test.equal(feed, feed2);
						test.done();
					}
				);
			}
		);
	}
});

exports['get'] = nodeunit.testCase(
{
	setUp: function (callback) {
		/**
		 * DB Access Parameters
		 **/
		var db_name = 'headlyne',
		    db_addr = '127.0.0.1',
		    db_port = 27017,
		    db_user = 'username',
		    db_pass = 'password';

		DatabaseDriver.init(
		    db_name,
		    db_addr,
		    db_port,
		    db_user,
		    db_pass
		);
		callback();
	},
	 
	tearDown: function (callback) {
		DatabaseDriver.getCollection(
			'feeds',
			function(err)
			{
				console.log('Suite-teardown: '+err);
			},
			function(collection)
			{
				collection.remove(
					function(err, doc)
					{
						if(err != null)
							console.log('Test-suite cannot terminate.');
						else {
							callback();
						}
					}
				);
			}
		);
	},

	'save & retrieve': function(test)
	{
		test.expect(3);
		FeedModel.save(
			'to_get_url',
			'some_title',
			'an author',
			'long description',
			function(err)
			{
				console.log(err.message);
				test.done();
			},
			function(feed_id)
			{
				FeedModel.get(
					feed_id,
					function(err){
						console.log(err.message);
						test.done();
					},
					function(recv_feed)
					{
						test.equal(recv_feed.title, 'some_title');
						test.equal(recv_feed.author, 'an author');
						test.equal(recv_feed.description, 'long description');
						test.done();
					}
				);
			}
		);
	},

	'invalid get': function(test)
	{
		test.expect(1);
		FeedModel.get(
			'invalid id',
			function(err)
			{
				test.equal(err.message, 'No such feed');
				test.done();
			},
			function(feed)
			{
				test.done();
			}
		);
	}
});

exports['isUpToDate'] = nodeunit.testCase(
{
	setUp: function (callback) {
		/**
		 * DB Access Parameters
		 **/
		var db_name = 'headlyne',
		    db_addr = '127.0.0.1',
		    db_port = 27017,
		    db_user = 'username',
		    db_pass = 'password';

		DatabaseDriver.init(
		    db_name,
		    db_addr,
		    db_port,
		    db_user,
		    db_pass
		);
		callback();
	},
	 
	tearDown: function (callback) {
		DatabaseDriver.getCollection(
			'feeds',
			function(err)
			{
				console.log('Suite-teardown: '+err);
			},
			function(collection)
			{
				collection.remove(
					function(err, doc)
					{
						if(err != null)
							console.log('Test-suite cannot terminate.');
						else {
							callback();
						}
					}
				);
			}
		);
	},

	'basic': function(test)
	{
		test.expect(1);
		FeedModel.save(
			'some url',
			'some title',
			'some author',
			'some description',
			function(err)
			{
				console.log(err.message);
				test.done();
			},
			function(feed_id)
			{
				FeedModel.isUpToDate(
					feed_id,
					5,
					function(err)
					{
						console.log(err.message);
						test.done();
					},
					function(check)
					{
						test.ok(check);
						test.done();
					}
				);
			}
		);
	},
	
	'expiry': function(test)
	{
		test.expect(1);
		FeedModel.save(
			'some url',
			'some title',
			'some author',
			'some description',
			function(err)
			{
				console.log(err.message);
				test.done();
			},
			function(feed_id)
			{
				FeedModel.isUpToDate(
					feed_id,
					0,
					function(err)
					{
						console.log(err.message);
						test.done();
					},
					function(check)
					{
						test.ok(!check);
						test.done();
					}
				);
			}
		);
	},
});

exports['delete'] = nodeunit.testCase(
{
	setUp: function (callback) {
		/**
		 * DB Access Parameters
		 **/
		var db_name = 'headlyne',
		    db_addr = '127.0.0.1',
		    db_port = 27017,
		    db_user = 'username',
		    db_pass = 'password';

		DatabaseDriver.init(
		    db_name,
		    db_addr,
		    db_port,
		    db_user,
		    db_pass
		);
		callback();
	},
	 
	tearDown: function (callback) {
		DatabaseDriver.getCollection(
			'feeds',
			function(err)
			{
				console.log('Suite-teardown: '+err.message);
			},
			function(collection)
			{
				collection.remove(
					function(err, doc)
					{
						if(err != null)
							console.log('Test-suite cannot terminate.');
						else {
							callback();
						}
					}
				);
			}
		);
	},

	'delete from empty collection': function(test)
	{
		test.expect(1);
		FeedModel.remove(
			'some_id',
			function(err)
			{
				console.log(err.message);
				test.done();
			},
			function()
			{
				test.ok(1);
				test.done();
			}
		);	
	},

	'delete saved': function(test)
	{
		test.expect(1);
		FeedModel.save(
			'url',
			'title',
			'author',
			'description',
			function(err)
			{
				console.log(err.message);
				test.done();
			},
			function(feed_id)
			{
				FeedModel.remove(
					feed_id,
					function(err)
					{
						console.log(err.message);
						test.done();
					},
					function()
					{
						FeedModel.get(
							feed_id,
							function(err){
								test.equal(err.message, 'No such feed');
								test.done();
							},
							function(recv_feed)
							{
								test.done();
							}
						);
					}
				);
			}
		);	
	}
});
