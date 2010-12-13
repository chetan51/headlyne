var nodeunit = require('nodeunit');
var DatabaseDriver = require('../../src/libraries/DatabaseDriver');
var UserModel = require('../../src/models/User')
var UserAuth = require('../../src/libraries/UserAuth');

exports['authenticate'] = nodeunit.testCase(
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

	'basic': function(test) {
		test.expect(1);
		UserModel.save(
			'username',
			'password',
			'first_name',
			'last_name',
			'email_id',
			function(err)
			{
				console.log(err.message);
				test.done();
			},
			function(user)
			{
				// user saved.
				UserAuth.authenticate(
					'username',
					'password',
					function(err)
					{
						console.log("auth: "+err.message);
						test.done();
					},
					function(is_new_sesh, sesh)
					{
						test.ok(is_new_sesh);
						console.log(sesh);
						test.done();
					}
				);
			}
		);
	}
});
