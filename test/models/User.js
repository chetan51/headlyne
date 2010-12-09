var http = require('http')
var nodeunit = require('nodeunit');
var UserModel = require('../../src/models/User.js');
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

	'save 1 user': function(test)
	{
		test.expect(1);
		UserModel.save(
			'url',
			'titles',
			'my_name',
			'hello tester!',
			function(err)
			{
				console.log(err.message);
			},
			function(user_id)
			{
				console.log(user_id);
			}
		);
		test.ok(1);
		test.done();
	},

	'save user twice': function(test)
	{
		test.expect(1);
		UserModel.save(
			'doubled_url',
			'titles',
			'user_auth',
			'dupplicated user',
			function(err)
			{
				console.log(err.message);
				test.done();
			},
			function(user_id)
			{
				UserModel.save(
					'doubled_url',
					'diff_title',
					'diff_name',
					'diff_description',
					function(err)
					{
						console.log(err.message);
						test.done();
					},
					function(user_id2)
					{
						test.equal(user_id, user_id2);
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
		UserModel.save(
			'to_get_url',
			'some_title',
			'an author',
			'long description',
			function(err)
			{
				console.log(err.message);
				test.done();
			},
			function(user_id)
			{
				UserModel.get(
					user_id,
					function(err){ test.done(); },
					function(user)
					{
						test.equal(user.title, 'some_title');
						test.equal(user.author, 'an author');
						test.equal(user.description, 'long description');
						test.done();
					}
				);
			}
		);
	}
});
