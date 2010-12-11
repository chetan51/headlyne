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
		DatabaseDriver.getCollection(
			'users',
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
							DatabaseDriver.close();
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
		DatabaseDriver.getCollection(
			'users',
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
							DatabaseDriver.close();
							callback();
						}
					}
				);
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
			function(webpage)
			{
				UserModel.get(
					'my_user',
					'my_pass',
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
			'pass',
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
