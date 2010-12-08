var http = require('http')
var nodeunit = require('nodeunit');
var FeedModel = require('../../src/models/Feed.js');

exports['save'] = nodeunit.testCase(
{
	'save 1 feed': function(test) {
		test.expect(1);
		test.ok(1);
		test.done();
	}
});
