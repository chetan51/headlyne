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
	setUp: function () {
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
	},
	 
	tearDown: function () {
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
			function(feed_id)
			{
				console.log(feed_id);
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
			function(feed_id)
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
					function(feed_id2)
					{
						test.equal(feed_id, feed_id2);
						test.done();
					}
				);
			}
		);
	}
});

exports['get'] = nodeunit.testCase(
{
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
					function(err){ test.done(); },
					function(feed)
					{
						test.equal(feed.title, 'some_title');
						test.equal(feed.author, 'an author');
						test.equal(feed.description, 'long description');
						test.done();
					}
				);
			}
		);
	}
});
