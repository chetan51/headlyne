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

	'invalid user': function(test)
	{
		test.expect(1);
		UserAuth.authenticate(
			'invalid_user',
			'random_pass',
			function(err, is_new_sesh, sesh)
			{
				test.equal(err.message, 'No such User');
				test.done();
			}
		);
	},
	
	'invalid password': function(test)
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
				if(err != null) throw err;
				UserAuth.authenticate(
					'username',
					'invalid_pass',
					function(err, is_new_sesh, sesh)
					{
						test.equal(err.message, 'Invalid Password');
						test.done();
					}
				);
			}
		);
	},

	'expired': function(test)
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
				if(err != null) throw err;

				// set a session from 100 days ago.
				test_session.created = new Date().getTime() - 1000*3600*24*100;
				UserModel.setSession(
					'username',
					test_session,
					function(err, session)
					{
						UserAuth.authenticate(
							'username',
							'password',
							function(err, is_new_sesh, sesh)
							{
								test.ok(is_new_sesh);
								test.done();
							}
						);

					}
				);

			}
		);
	},

	'existent': function(test)
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
				if(err != null) throw err;

				// set a session from 1 second within the lifetime
				test_session.created =
					new Date().getTime() -
					(test_session.cookie.lifetime - 1000);

				UserModel.setSession(
					'username',
					test_session,
					function(err, session)
					{
						UserAuth.authenticate(
							'username',
							'password',
							function(err, is_new_sesh, sesh)
							{
								test.ok(!is_new_sesh);
								test.done();
							}
						);

					}
				);

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

	'no cookie': function(test)
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
						console.log(err);
						test.equal(err.message, 'Invalid Session Cookie');
						test.done();
					}
				);
			}
		);
	},

	'null cookie': function(test) {
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

				UserModel.setSession(
					'username',
					null,
					function(err, session)
					{
						UserAuth.checkAuth(
							test_session.cookie,
							function(err, is_valid)
							{
								test.equal(err.message, 'Invalid Session Cookie');
								test.done();
							}
						);
					}
				);
			}
		);
	},

	'malformed cookie': function(test) {
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
						// malform by increasing lifetime.
						test_session.cookie.lifetime += 5;

						UserAuth.checkAuth(
							test_session.cookie,
							function(err, is_valid)
							{
								test.equal(err.message, 'Invalid Session Cookie');
								test.done();
							}
						);
					}
				);
			}
		);
	},

	'expired cookie': function(test) {
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

exports['invalidate'] = nodeunit.testCase(
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

				test_session.created = new Date().getTime();
				UserModel.setSession(
					'username',
					test_session,
					function(err, session)
					{
						UserAuth.invalidate(
							'username',
							function(err)
							{
								if( err != null) throw err;

								// session deleted. now check auth.
								UserAuth.checkAuth(
									test_session.cookie,
									function(err, is_valid)
									{
										test.equal(err.message, 'Invalid Session Cookie');
										test.done();
									}
								);
							}
						);
					}
				);
			}
		);
	},

	'no session': function(test) {
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

				UserAuth.invalidate(
					'username',
					function(err)
					{
						if( err != null) throw err;
							// session deleted. now check auth.
						UserAuth.checkAuth(
							test_session.cookie,
							function(err, is_valid)
							{
								test.equal(err.message, 'Invalid Session Cookie');
								test.done();
							}
						);
					}
				);
			}
		);
	},

	'no such user': function(test) {
		test.expect(1);

		UserAuth.invalidate(
			'username',
			function(err)
			{
				test.equal(err.message, 'No such User');
				test.done();
			}
		);
	}
});
