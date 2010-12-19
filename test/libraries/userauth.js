var nodeunit = require('nodeunit');
var DatabaseDriver = require('../../src/libraries/DatabaseDriver');
var DatabaseFaker = require('../mocks/DatabaseFaker');
var UserModel = require('../../src/models/User');
var UserAuth = require('../../src/libraries/UserAuth');
var Ni = require('ni');

/**
 * Mock Variables
 **/
var test_session = 
	{
		cookie: {
			id: 'random_id',
			data: {
				history: '',
				user: 'username'
			},
			persistent: true,
			lifetime: 100000
		},
		created: null,
	};


exports['authenticate'] = nodeunit.testCase(
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
		
		Ni.config('session_lifetime', 1000 * 60 * 60 * 24 * 7); // 2 weeks
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

	'basic': function(test) {
		test.expect(1);
		UserModel.save(
			'username',
			'password',
			'first_name',
			'last_name',
			'email_id',
			function(err, user)
			{
				if( err != null) throw err;

				// user saved.
				UserAuth.authenticate(
					'username',
					'password',
					function(err, is_new_sesh, sesh)
					{
						if( err != null) throw err;

						test.ok(is_new_sesh);
						console.log(sesh);
						test.done();
					}
				);
			}
		);
	},

	'invalid': function(test)
	{
		test.expect(1);
		UserAuth.authenticate(
			'invalid_user',
			'random_pass',
			function(err, is_new_sesh, sesh)
			{
				if( err != null) test.ok(1);
				test.done();
			}
		);
	}
});


exports['checkauth'] = nodeunit.testCase(
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

	'basic valid': function(test) {
		test.expect(1);
		UserModel.save(
			'username',
			'password',
			'first_name',
			'last_name',
			'email_id',
			function(err, user)
			{
				if( err != null) throw err;

				test_session.created = new Date().getTime();
				UserModel.setSession(
					'username',
					test_session,
					function(err, session)
					{
						UserAuth.checkAuth(
							test_session.cookie,
							function(err, is_valid)
							{
								if( err != null) throw err;
	
								test.ok(is_valid);
								test.done();
							}
						);
					}
				);
			}
		);
	},

	'basic invalid': function(test)
	{
		test.expect(1);
		UserModel.save(
			'username',
			'password',
			'first_name',
			'last_name',
			'email_id',
			function(err, user)
			{
				if( err != null) throw err;

				UserAuth.checkAuth(
					test_session.cookie,
					function(err, is_valid)
					{
						test.ok(!is_valid);
						test.done();
					}
				);
			}
		);
	},

	'basic expired': function(test) {
		test.expect(1);
		UserModel.save(
			'username',
			'password',
			'first_name',
			'last_name',
			'email_id',
			function(err, user)
			{
				if( err != null) throw err;

				test_session.created = new Date().getTime() - 1000*60*60*24*200;
				UserModel.setSession(
					'username',
					test_session,
					function(err, session)
					{
						UserAuth.checkAuth(
							test_session.cookie,
							function(err, is_valid)
							{
								if( err != null) throw err;
	
								test.ok(!is_valid);
								test.done();
							}
						);
					}
				);
			}
		);
	}
});
