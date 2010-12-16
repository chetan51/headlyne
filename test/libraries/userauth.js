var nodeunit = require('nodeunit');
var DatabaseDriver = require('../../src/libraries/DatabaseDriver');
var DatabaseFaker = require('../mocks/DatabaseFaker.js');
var UserModel = require('../../src/models/User')
var UserAuth = require('../../src/libraries/UserAuth');

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
				if (err) {
					console.log(err.message);
					test.done();
				}
				else {
					// user saved.
					UserAuth.authenticate(
						'username',
						'password',
						function(err, is_new_sesh, sesh)
						{
							if (err) {
								console.log("auth: "+err.message);
								test.done();
							}
							else {
								test.ok(is_new_sesh);
								console.log(sesh);
								test.done();
							}
						},
						2 * 7 * 24 * 60 * 60 * 1000
					);
				}
			}
		);
	}
});
