var http = require('http')
var nodeunit = require('nodeunit');
var Step       = require('step');
var UserModel = require('../../src/models/User.js');
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
			['users'],
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
			['users'],
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
		UserModel.save(
			'my_user',
			'my_pass',
			'FirstName',
			'LastName',
			'email@id',
			function(err, user)
			{
				if (err) {
					console.log(err.message);
				}
				else {
					test.equal(user.username, 'my_user');
				}
				test.done();
			}
		);
	},

	'duplicate': function(test)
	{
		test.expect(1);
		UserModel.save(
			'my_user',
			'my_pass',
			'FirstName',
			'LastName',
			'email@id',
			function(err, user)
			{
				if (err) {
					console.log(err.message);
					test.done();
				}
				else {
					UserModel.save(
						'my_user',
						'my_pass',
						'FirstName',
						'LastName',
						'email@id',
						function(err, user2)
						{
							test.equal(err.message, 'Database match exists');
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
			['users'],
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
			['users'],
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
		test.expect(2);
		UserModel.save(
			'my_user',
			'my_pass',
			'FirstName',
			'LastName',
			'email@id',
			function(err, user1)
			{
				if (err) {
					console.log(err.message);
					test.done();
				}
				else {
					UserModel.get(
						'my_user',
						function(err, recv_user)
						{
							if (err) {
								console.log(err.message);
							}
							else {
								test.equal(recv_user.password, null);
								test.equal(recv_user.email_id, 'email@id');
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
		UserModel.get(
			'invalid username',
			function(err, user)
			{
				if (test) {
					test.equal(err.message, 'No such User');
				}
				test.done();
			}
		);
	}
});

exports['placeFeed'] = nodeunit.testCase(
{

	setUp: function (callback) {
		DatabaseFaker.setUp(
			['users'],
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
			['users'],
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
		test.expect(2);
		UserModel.save(
			'my_user',
			'my_pass',
			'FirstName',
			'LastName',
			'email@id',
			function(err, user1)
			{
				if (err) {
					console.log(err.message);
					test.done();
				} else {
					UserModel.placeFeed(
						'my_user',
						'the_feeds_url',
						0, 0,
						function(err, feeds)
						{
							if( err ) {
								throw err;
							} else {
								console.log(feeds[0][0]);
								test.equal(feeds[0][0].url, 'the_feeds_url');
								var count=0;
								for(i in feeds)
									for(j in feeds[i])
										count++;
								test.equal(count, 1);
								test.done();
							}
						}
					);
				}
			}
		);
	},

	'no user': function(test)
	{
		test.expect(1);
		
		UserModel.placeFeed(
			'my_user',
			'the_feeds_url',
			0, 0,
			function(err, feeds)
			{
				if( err ) {
					test.equal(err.message, 'No such User');
				}
				test.done();
			}
		);
	},

	'add multiple': function(test)
	{
		test.expect(8);
		UserModel.save(
			'my_user',
			'my_pass',
			'FirstName',
			'LastName',
			'email@id',
			function(err, user1)
			{
				if (err) {
					console.log(err.message);
					test.done();
				} else {
					Step(
						function addFirst()
						{
							UserModel.placeFeed(
								'my_user',
								'the_feeds_url',
								0, 0,
								this
							);
						},

						function addSecond(err, first_feed)
						{
							if( err ) {
								throw err;
							} else {
								UserModel.placeFeed(
									'my_user',
									'second_feeds_url',
									2, 3,
									this
								);
							}
						},
						
						function addThird(err, second_feed)
						{
							if( err ) {
								throw err;
							} else {
								UserModel.placeFeed(
									'my_user',
									'third_feeds_url',
									0, 0,
									this
								);
							}
						},
						
						function addFourth(err, fourth_feed)
						{
							if( err ) {
								throw err;
							} else {
								UserModel.placeFeed(
									'my_user',
									'fourth_feeds_url',
									1, 0,
									this
								);
							}
						},
						
						function result(err, feeds)
						{
							console.log(feeds);
							var count=0;
							for(i in feeds)
								for(j in feeds[i])
									count++;

							test.equal(count, 4);
							test.equal(feeds[0][0].url, 'third_feeds_url');
							test.equal(feeds[0][1].url, 'fourth_feeds_url');
							test.equal(feeds[0][2].url, 'the_feeds_url');

							test.equal(feeds[0].length, 3);
							test.equal(feeds[1].length, 0);
							test.equal(feeds[2].length, 0);
							test.equal(feeds[3].length, 1);
							test.done();
						}
					);
				}
			}
		);
	}
});

exports['editFeed'] = nodeunit.testCase(
{

	setUp: function (callback) {
		DatabaseFaker.setUp(
			['users'],
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
			['users'],
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
		test.expect(2);
		UserModel.save(
			'my_user',
			'my_pass',
			'FirstName',
			'LastName',
			'email@id',
			function(err, user1)
			{
				if (err) {
					console.log(err.message);
					test.done();
				} else {
					UserModel.placeFeed(
						'my_user',
						'the_feeds_url',
						0, 0,
						function(err, first_feed)
						{
							if( err ) {
								throw err;
							} else {
								console.log(first_feed);
								UserModel.editFeed(
									'my_user',
									'the_feeds_url',
									0,
									'body',
									'webpage',
									function(err, feeds)
									{
										var count=0;
										for(i in feeds)
											for(j in feeds[i])
												count++;
										test.equal(count, 1);
										test.equal(feeds[0].length, 1);
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


exports['removeFeed'] = nodeunit.testCase(
{

	setUp: function (callback) {
		DatabaseFaker.setUp(
			['users'],
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
			['users'],
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
		UserModel.save(
			'my_user',
			'my_pass',
			'FirstName',
			'LastName',
			'email@id',
			function(err, user1)
			{
				if (err) {
					console.log(err.message);
					test.done();
				} else {
					UserModel.placeFeed(
						'my_user',
						'the_feeds_url',
						0, 0,
						function(err, first_feed)
						{
							if( err ) {
								throw err;
							} else {
								UserModel.removeFeed(
									'my_user',
									'the_feeds_url',
									function(err, feeds)
									{
										console.log(feeds);
										var count=0;
										for(i in feeds)
											for(j in feeds[i])
												count++;
										test.equal(count, 0);
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

	'no such feed': function(test)
	{
		test.expect(2);
		UserModel.save(
			'my_user',
			'my_pass',
			'FirstName',
			'LastName',
			'email@id',
			function(err, user1)
			{
				if (err) {
					console.log(err.message);
					test.done();
				} else {
					UserModel.placeFeed(
						'my_user',
						'the_feeds_url',
						0, 0,
						function(err, first_feed)
						{
							if( err ) {
								throw err;
							} else {
								UserModel.removeFeed(
									'my_user',
									'bad_feed_url',
									function(err, feeds)
									{
										test.equal(err.message, 'No such feed');
										var count=0;
										for(i in feeds)
											for(j in feeds[i])
												count++;
										test.equal(count, 1);
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
