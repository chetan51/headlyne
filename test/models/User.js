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
			function() {
				DatabaseFaker.clear(
					'users',
					function() {
						callback();
					},
					function(err) {
						console.log(err);
					}
				);
			},
			function(err) {
				console.log(err);
			}
		);
	},
	 
	tearDown: function (callback) {
		DatabaseFaker.clear(
			'users',
			function() {
				DatabaseFaker.tearDown();
				callback();
			},
			function(err) {
				console.log(err);
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
			function(err)
			{
				console.log(err.message);
				test.done();
			},
			function(user)
			{
				console.log(user);
				test.ok(1);
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
			function(err)
			{
				console.log(err.message);
				test.done();
			},
			function(user)
			{
				UserModel.save(
					'my_user',
					'my_pass',
					'FirstName',
					'LastName',
					'email@id',
					function(err)
					{
						test.equal(err.message, 'Database match exists');
						test.done();
					},
					function(user2)
					{
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
		DatabaseFaker.setUp(
			function() {
				DatabaseFaker.clear(
					'users',
					function() {
						callback();
					},
					function(err) {
						console.log(err);
					}
				);
			},
			function(err) {
				console.log(err);
			}
		);
	},
	 
	tearDown: function (callback) {
		DatabaseFaker.clear(
			'users',
			function() {
				DatabaseFaker.tearDown();
				callback();
			},
			function(err) {
				console.log(err);
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
			function(err)
			{
				console.log(err.message);
				test.done();
			},
			function(user1)
			{
				UserModel.get(
					'my_user',
					function(err){
						console.log(err.message);
						test.done();
					},
					function(recv_user)
					{
						test.equal(recv_user.password, null);
						test.equal(recv_user.email_id, 'email@id');
						test.done();
					}
				);
			}
		);
	},

	'invalid': function(test)
	{
		test.expect(1);
		UserModel.get(
			'invalid username',
			function(err)
			{
				test.equal(err.message, 'No such User');
				test.done();
			},
			function(user)
			{
				test.done();
			}
		);
	}
});
