var http = require('http')
var nodeunit = require('nodeunit');
var Ni = require('ni');
var FeedModel = require('../../src/models/Feed.js');
var DatabaseDriver = require('../../src/libraries/DatabaseDriver.js');
var DatabaseFaker = require('../mocks/DatabaseFaker.js');
var Mongo      = require('mongodb'),
    Db         = Mongo.Db,
    Connection = Mongo.Connection,
    Server     = Mongo.Server,
    BSON       = Mongo.BSONPure;


exports['save'] = nodeunit.testCase(
{
	setUp: function (callback) {
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
		
		Ni.config('feed_expiry_length', 30 * 60 * 1000);
	},
	 
	tearDown: function (callback) {
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
	},

	'basic': function(test)
	{
		test.expect(1);
		FeedModel.save(
			'url',
			'titles',
			'my_name',
			'hello tester!',
			function(err, feed)
			{
				if (err) {
					console.log(err.message);
				}
				else {
					test.equal(feed.url, 'url');
				}
				test.done();
			}
		);
	},

	'overwrite': function(test)
	{
		test.expect(2);
		FeedModel.save(
			'doubled_url',
			'titles',
			'feed_auth',
			'dupplicated feed',
			function(err, feed)
			{
				if (err) {
					console.log(err.message);
					test.done();
				}
				else {
					FeedModel.save(
						'doubled_url',
						'diff_title',
						'diff_name',
						'diff_description',
						function(err, feed2)
						{
							if (err) {
								console.log(err.message);
							}
							else {
								test.equal(feed.url_hash, feed2.url_hash);
								test.equal(feed2.title, 'diff_title');
							}
							test.done();
						}
					);
				}
			}
		);
	}
});

exports['get'] = nodeunit.testCase(
{
	setUp: function (callback) {
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
	},
	 
	tearDown: function (callback) {
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
	},

	'basic': function(test)
	{
		test.expect(3);
		FeedModel.save(
			'to_get_url',
			'some_title',
			'an author',
			'long description',
			function(err, feed)
			{
				if (err) {
					console.log(err.message);
					test.done();
				}
				else {
					FeedModel.get(
						'to_get_url',
						function(err, recv_feed) {
							if (err) {
								console.log(err.message);
							}
							else {
								test.equal(recv_feed.title, 'some_title');
								test.equal(recv_feed.author, 'an author');
								test.equal(recv_feed.description, 'long description');
							}
							test.done();
						}
					);
				}
			}
		);
	},

	'invalid': function(test)
	{
		test.expect(1);
		FeedModel.get(
			'invalid url',
			function(err, feed)
			{
				if (err) {
					test.equal(err.message, 'No such feed');
				}
				test.done();
			}
		);
	}
});

exports['isUpToDate'] = nodeunit.testCase(
{
	setUp: function (callback) {
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
	},
	 
	tearDown: function (callback) {
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
	},

	'basic': function(test)
	{
		test.expect(1);
		FeedModel.save(
			'some url',
			'some title',
			'some author',
			'some description',
			function(err, feed)
			{
				if (err) {
					console.log(err.message);
					test.done();
				}
				else {
					FeedModel.isUpToDate(
						feed.url,
						function(err, check)
						{
							if (err) {
								console.log(err.message);
							}
							else {
								test.ok(check);
							}
							test.done();
						}
					);
				}
			}
		);
	},
	
	'expired': function(test)
	{
		test.expect(1);
		
		Ni.config('feed_expiry_length', 0);
		
		FeedModel.save(
			'some url',
			'some title',
			'some author',
			'some description',
			function(err, feed)
			{
				if (err) {
					console.log(err.message);
					test.done();
				}
				else {
					FeedModel.isUpToDate(
						feed.url,
						function(err, check)
						{
							if (err) {
								console.log(err.message);
							}
							else {
								test.ok(!check);
							}
							test.done();
						}
					);
				}
			}
		);
	},
});

exports['delete'] = nodeunit.testCase(
{
	setUp: function (callback) {
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
	},
	 
	tearDown: function (callback) {
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
	},

	'Empty collection': function(test)
	{
		test.expect(1);
		FeedModel.remove(
			'some_url',
			function(err)
			{
				if (err) {
					console.log(err.message);
				}
				else {
					test.ok(1);
				}
				test.done();
			}
		);	
	},

	'basic': function(test)
	{
		test.expect(1);
		FeedModel.save(
			'url',
			'title',
			'author',
			'description',
			function(err, feed)
			{
				if (err) {
					console.log(err.message);
					test.done();
				}
				else {
					FeedModel.remove(
						feed.url,
						function(err)
						{
							if (err) {
								console.log(err.message);
								test.done();
							}
							else {
								FeedModel.get(
									feed.url,
									function(err, recv_feed) {
										if (err) {
											test.equal(err.message, 'No such feed');
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
	}
});

exports['push/pop'] = nodeunit.testCase(
{
	setUp: function (callback) {
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
	},
	 
	tearDown: function (callback) {
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
	},

	'single push': function(test)
	{
		test.expect(2);
		FeedModel.save(
			'url',
			'title',
			'author',
			'description',
			function(err, feed)
			{
				if (err) {
					console.log(err.message);
					test.done();
				}
				else {
					var time = new Date().getTime();
					time = parseInt(time) - 120000;
					FeedModel.pushFeedItems(
						feed.url,
						[{
							'url': 'page url',
							'title': 'item title',
							'description': 'item desc',
							'time_published': time
						}],
						function(err, new_feed) {
							if (err) {
								console.log(err.message);
							}
							else {
								test.equal(new_feed.items.length, 1);
								test.equal(new_feed.items[0].url, 'page url');
							}
							test.done();
						}
					);
				}
			}
		);
	},
	
	'feedless push': function(test)
	{
		test.expect(1);
		var time = new Date().getTime();
		time = parseInt(time) - 120000;
		FeedModel.pushFeedItems(
			'invalid url',
			[{
				'url': 'page url',
				'title': 'item title',
				'description': 'item desc',
				'time_published': time
			}],
			function(err, new_feed)
			{
				if (err) {
					test.equal(err.message, 'No such feed');
				}
				test.done();
			}
		);
		
		
	},
	
	'multiple push': function(test)
	{
		test.expect(3);
		FeedModel.save(
			'url',
			'title',
			'author',
			'description',
			function(err, feed)
			{
				if (err) {
					console.log(err.message);
					test.done();
				}
				else {
					var time = new Date().getTime();
					time = parseInt(time) - 120000;
					FeedModel.pushFeedItems(
						feed.url,
						[	{
							 'url': 'page url',
							 'title': 'item title',
							 'description': 'item desc',
							 'time_published': time
							},
							{
							 'url': 'page2 url',
							 'title': 'item2 title',
							 'description': 'item2 desc',
							 'time_published': time + 15500
							}
						],
						function(err, new_feed)
						{
							if (err) {
								console.log(err.message);
							}
							else {
								test.equal(new_feed.items.length, 2);
								test.equal(new_feed.items[0].url, 'page url');
								test.equal(new_feed.items[1].url, 'page2 url');
							}
							test.done();
						}
					);
				}
			}
		);
	},

	'single pop': function(test)
	{
		test.expect(3);
		FeedModel.save(
			'url',
			'title',
			'author',
			'description',
			function(err, feed)
			{
				if (err) {
					console.log(err.message);
					test.done();
				}
				else {
					var time = new Date().getTime();
					time = parseInt(time) - 120000;
					FeedModel.pushFeedItems(
						feed.url,
						[{
							'url': 'page url',
							'title': 'item title',
							'description': 'item desc',
							'time_published': time
						}],
						function(err, feed)
						{
							if (err) {
								console.log(err.message);
								test.done();
							}
							else {
								//One item pushed.
								FeedModel.popFeedItems(
									feed.url,
									function(err, feed, items)
									{
										if (err) {
											console.log(err.message);
										}
										else {
											test.equal(feed.items.length, 0);
											test.equal(items.length, 1);
											test.equal(items[0].url, 'page url');
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
	
	'multiple pop': function(test)
	{
		test.expect(4);
		FeedModel.save(
			'url',
			'title',
			'author',
			'description',
			function(err, feed)
			{
				if (err) {
					console.log(err.message);
					test.done();
				}
				else {
					var time = new Date().getTime();
					time = parseInt(time) - 120000;
					FeedModel.pushFeedItems(
						feed.url,
						[
							{
							 'url': 'page url',
							 'title': 'item title',
							 'description': 'item desc',
							 'time_published': time
							},
							{
							 'url': 'page2 url',
							 'title': 'item2 title',
							 'description': 'item2 desc',
							 'time_published': time - 15500
							},
							{
							 'url': 'page3 url',
							 'title': 'item3 title',
							 'description': 'item3 desc',
							 'time_published': time - 99000
							}
						],
						function(err, feed)
						{
							if (err) {
								console.log(err.message);
								test.done();
							}
							else {
								//One item pushed.
								FeedModel.popFeedItems(
									feed.url,
									function(err, feed, items)
									{
										if (err) {
											console.log(err.message);
										}
										else {
											test.equal(feed.items.length, 1);
											test.equal(items.length, 2);
											test.equal(items[0].url, 'page url');
											test.equal(items[1].url, 'page2 url');
										}
										test.done();
									},
									2	// pop 2 items
								);
							}
						}
					);
				}
			}
		);
	},
	
	'too many pop': function(test)
	{
		test.expect(4);
		FeedModel.save(
			'url',
			'title',
			'author',
			'description',
			function(err, feed)
			{
				if (err) {
					console.log(err.message);
					test.done();
				}
				else {
					var time = new Date().getTime();
					time = parseInt(time) - 120000;
					FeedModel.pushFeedItems(
						feed.url,
						[
							{
							 'url': 'page url',
							 'title': 'item title',
							 'description': 'item desc',
							 'time_published': time
							},
							{
							 'url': 'page2 url',
							 'title': 'item2 title',
							 'description': 'item2 desc',
							 'time_published': time - 15500
							}
						],
						function(err, feed)
						{
							if (err) {
								console.log(err.message);
								test.done();
							}
							else {
								//One item pushed.
								FeedModel.popFeedItems(
									feed.url,
									function(err, feed, items)
									{
										if (err) {
											console.log(err.message);
										}
										else {
											test.equal(feed.items.length, 0);
											test.equal(items.length, 2);
											test.equal(items[0].url, 'page url');
											test.equal(items[1].url, 'page2 url');
										}
										test.done();
									},
									3	// attempt to pop 3 items
								);
							}
						}
					);
				}
			}
		);
	}
});
