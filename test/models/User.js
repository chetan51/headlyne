var http = require('http')
var nodeunit = require('nodeunit');
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

exports['addFeed'] = nodeunit.testCase(
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
					UserModel.addFeed(
						'my_user',
						'the_feeds_url',
						{
							'row': 0,
							'col': 0,
						},
						function(err, feeds)
						{
							if( err ) {
								throw err;
							} else {
								console.log(feeds['the_feeds_url']);
								test.equal(feeds['the_feeds_url'].url, 'the_feeds_url');
								var count=0;
								for(keys in feeds)
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
		
		UserModel.addFeed(
			'my_user',
			'the_feeds_url',
			{
				'row': 0,
				'col': 0,
			},
			function(err, feeds)
			{
				if( err ) {
					test.equal(err.message, 'No such User');
				}
				test.done();
			}
		);
	},

	'duplicate/update': function(test)
	{
		test.expect(3);
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
					UserModel.addFeed(
						'my_user',
						'the_feeds_url',
						{
							'row': 0,
							'col': 0,
						},
						function(err, first_feed)
						{
							if( err ) {
								throw err;
							} else {
								UserModel.addFeed(
									'my_user',
									'the_feeds_url',
									{
										'row': 2,
										'col': 3,
									},
									function(err, feeds)
									{
										console.log(feeds['the_feeds_url']);
										test.equal(feeds['the_feeds_url'].url, 'the_feeds_url');
										var count=0;
										for(keys in feeds)
											count++;
										test.equal(count, 1);
										test.equal(feeds['the_feeds_url'].placement.row, 2);
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
