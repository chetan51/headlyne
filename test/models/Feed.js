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

		this._db = new DatabaseDriver();
		this._db.init(
		    db_name,
		    db_addr,
		    db_port,
		    db_user,
		    db_pass,
		    function(err)
		    {
			    console.log('Suite-setup: '+err.message);
		    },
		    function()
		    {
			callback();
		    }
		);
	},
	 
	tearDown: function (callback) {
		this._db.getCollection(
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
							this._db.close();
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
			_db,
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
				console.log(feed.url_hash);
			}
		);
		test.ok(1);
		test.done();
	},

	'save feed twice': function(test)
	{
		test.expect(1);
		FeedModel.save(
			this._db,
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
					this._db,
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
						test.equal(feed.url_hash, feed2.url_hash);
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

		this._db = new DatabaseDriver();
		this._db.init(
		    db_name,
		    db_addr,
		    db_port,
		    db_user,
		    db_pass,
		    function(err)
		    {
			    console.log('Suite-setup: '+err.message);
		    },
		    function()
		    {
			callback();
		    }
		);
	},
	 
	tearDown: function (callback) {
		this._db.getCollection(
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
							this._db.close();
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
			this._db,
			'to_get_url',
			'some_title',
			'an author',
			'long description',
			function(err)
			{
				console.log(err.message);
				test.done();
			},
			function(feed)
			{
				FeedModel.get(
					this._db,
					'to_get_url',
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
			this._db,
			'invalid url',
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

		this._db = new DatabaseDriver();
		this._db.init(
		    db_name,
		    db_addr,
		    db_port,
		    db_user,
		    db_pass,
		    function(err)
		    {
			    console.log('Suite-setup: '+err.message);
		    },
		    function()
		    {
			callback();
		    }
		);
	},
	 
	tearDown: function (callback) {
		this._db.getCollection(
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
							this._db.close();
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
			this._db,
			'some url',
			'some title',
			'some author',
			'some description',
			function(err)
			{
				console.log(err.message);
				test.done();
			},
			function(feed)
			{
				FeedModel.isUpToDate(
					this._db,
					feed.url,
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
			this._db,
			'some url',
			'some title',
			'some author',
			'some description',
			function(err)
			{
				console.log(err.message);
				test.done();
			},
			function(feed)
			{
				FeedModel.isUpToDate(
					this._db,
					feed.url,
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

		this._db = new DatabaseDriver();
		this._db.init(
		    db_name,
		    db_addr,
		    db_port,
		    db_user,
		    db_pass,
		    function(err)
		    {
			    console.log('Suite-setup: '+err.message);
		    },
		    function()
		    {
			callback();
		    }
		);
	},
	 
	tearDown: function (callback) {
		this._db.getCollection(
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
							this._db.close();
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
			this._db,
			'some_url',
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
			this._db,
			'url',
			'title',
			'author',
			'description',
			function(err)
			{
				console.log(err.message);
				test.done();
			},
			function(feed)
			{
				FeedModel.remove(
					this._db,
					feed.url,
					function(err)
					{
						console.log(err.message);
						test.done();
					},
					function()
					{
						FeedModel.get(
							this._db,
							feed.url,
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

exports['push/pop'] = nodeunit.testCase(
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

		this._db = new DatabaseDriver();
		this._db.init(
		    db_name,
		    db_addr,
		    db_port,
		    db_user,
		    db_pass,
		    function(err)
		    {
			    console.log('Suite-setup: '+err.message);
		    },
		    function()
		    {
			callback();
		    }
		);
	},
	 
	tearDown: function (callback) {
		this._db.getCollection(
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
							this._db.close();
							callback();
						}
					}
				);
			}
		);
	},

	'single push': function(test)
	{
		test.expect(2);
		FeedModel.save(
			this._db,
			'url',
			'title',
			'author',
			'description',
			function(err)
			{
				console.log(err.message);
				test.done();
			},
			function(feed)
			{
				var time = new Date().getTime();
				time = parseInt(time) - 120000;
				FeedModel.pushFeedItems(
					this._db,
					feed.url,
					[{
						'url': 'page url',
						'title': 'item title',
						'description': 'item desc',
						'time_published': time
					}],
					function(err)
					{
						console.log(err.message);
						test.done();
					},
					function(new_feed)
					{
						test.equal(new_feed.items.length, 1);
						test.equal(new_feed.items[0].url, 'page url');
						test.done();
					}
				);
			}
		);
	},
	
	'feedless push': function(test)
	{
		test.expect(1);
		var time = new Date().getTime();
		time = parseInt(time) - 120000;
		FeedModel.pushFeedItems(
			this._db,
			'invalid url',
			[{
				'url': 'page url',
				'title': 'item title',
				'description': 'item desc',
				'time_published': time
			}],
			function(err)
			{
				test.equal(err.message, 'No such feed');
				test.done();
			},
			function(new_feed)
			{
				test.done();
			}
		);
		
		
	},
	
	'multiple push': function(test)
	{
		test.expect(3);
		FeedModel.save(
			this._db,
			'url',
			'title',
			'author',
			'description',
			function(err)
			{
				console.log(err.message);
				test.done();
			},
			function(feed)
			{
				var time = new Date().getTime();
				time = parseInt(time) - 120000;
				FeedModel.pushFeedItems(
					this._db,
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
					function(err)
					{
						console.log(err.message);
						test.done();
					},
					function(new_feed)
					{
						test.equal(new_feed.items.length, 2);
						test.equal(new_feed.items[0].url, 'page url');
						test.equal(new_feed.items[1].url, 'page2 url');
						test.done();
					}
				);
			}
		);
	},

	'single pop': function(test)
	{
		test.expect(3);
		FeedModel.save(
			this._db,
			'url',
			'title',
			'author',
			'description',
			function(err)
			{
				console.log(err.message);
				test.done();
			},
			function(feed)
			{
				var time = new Date().getTime();
				time = parseInt(time) - 120000;
				FeedModel.pushFeedItems(
					this._db,
					feed.url,
					[{
						'url': 'page url',
						'title': 'item title',
						'description': 'item desc',
						'time_published': time
					}],
					function(err)
					{
						console.log(err.message);
						test.done();
					},
					function(feed)
					{
						//One item pushed.
						FeedModel.popFeedItems(
							this._db,
							feed.url,
							function(err)
							{
								console.log(err.message);
								test.done();
							},
							function(feed, items)
							{
								test.equal(feed.items.length, 0);
								test.equal(items.length, 1);
								test.equal(items[0].url, 'page url');
								test.done();
							}
						);
					}
				);
			}
		);
	},
	
	'multiple pop': function(test)
	{
		test.expect(4);
		FeedModel.save(
			this._db,
			'url',
			'title',
			'author',
			'description',
			function(err)
			{
				console.log(err.message);
				test.done();
			},
			function(feed)
			{
				var time = new Date().getTime();
				time = parseInt(time) - 120000;
				FeedModel.pushFeedItems(
					this._db,
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
					function(err)
					{
						console.log(err.message);
						test.done();
					},
					function(feed)
					{
						//One item pushed.
						FeedModel.popFeedItems(
							this._db,
							feed.url,
							function(err)
							{
								console.log(err.message);
								test.done();
							},
							function(feed, items)
							{
								test.equal(feed.items.length, 1);
								test.equal(items.length, 2);
								test.equal(items[0].url, 'page url');
								test.equal(items[1].url, 'page2 url');
								test.done();
							},
							2	// pop 2 items
						);
					}
				);
			}
		);
	},
	
	'too many pop': function(test)
	{
		test.expect(4);
		FeedModel.save(
			this._db,
			'url',
			'title',
			'author',
			'description',
			function(err)
			{
				console.log(err.message);
				test.done();
			},
			function(feed)
			{
				var time = new Date().getTime();
				time = parseInt(time) - 120000;
				FeedModel.pushFeedItems(
					this._db,
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
					function(err)
					{
						console.log(err.message);
						test.done();
					},
					function(feed)
					{
						//One item pushed.
						FeedModel.popFeedItems(
							this._db,
							feed.url,
							function(err)
							{
								console.log(err.message);
								test.done();
							},
							function(feed, items)
							{
								test.equal(feed.items.length, 0);
								test.equal(items.length, 2);
								test.equal(items[0].url, 'page url');
								test.equal(items[1].url, 'page2 url');
								test.done();
							},
							3	// attempt to pop 3 items
						);
					}
				);
			}
		);
	}
});
