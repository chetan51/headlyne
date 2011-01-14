var http = require('http')
var nodeunit = require('nodeunit');
var Ni = require('ni');
var InviteModel = require('../../src/models/Invite.js');
var DatabaseDriver = require('../../src/libraries/DatabaseDriver.js');
var DatabaseFaker = require('../mocks/DatabaseFaker.js');
var Mongo      = require('mongodb'),
    Db         = Mongo.Db,
    Connection = Mongo.Connection,
    Server     = Mongo.Server,
    BSON       = Mongo.BSONPure;


exports['add'] = nodeunit.testCase(
{
	setUp: function (callback) {
		DatabaseFaker.setUp(
			['invites'],
			function(err) {
				if (err) {
					throw err;
				}
				else {
					callback();
				}
			}
		);
		
		Ni.config('feed_expiry_length', 30 * 60 * 1000);
	},
	 
	tearDown: function (callback) {
		DatabaseFaker.tearDown(
			['invites'],
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
		InviteModel.add(
			'invited_by_me!',
			function(err, code)
			{
				if( err ) {
					console.log(err.message);
				}
				else {
					console.log(code);
					test.ok(1);
				}
				test.done();
			}
		);
	}
});
