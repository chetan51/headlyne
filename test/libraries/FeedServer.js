var http       = require('http'),
    nodeunit   = require('nodeunit'),
    FeedServer = require('../../src/libraries/FeedServer.js');

exports['get feed teaser'] = nodeunit.testCase(
{
	
	setUp: function(callback) {
	       callback();
	},
	 
	tearDown: function(callback) {
	       callback();
	},

	'basic': function(test) {
		test.expect(1);
		test.equals(true, true);
		test.done();
	}

});
