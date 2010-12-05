
/*
 *  Module dependencies
 */
var nodeunit = require('nodeunit');
var ContentGrabber = require('../../src/libraries/contentgrabber.js');

/*
 *  Sample data
 */
var html='<html><head></head><body><div id="lol">hello</div></body></html>';

/*
 *  Tests
 */
exports['grab content from page'] = nodeunit.testCase(
{
/*    setUp: function () {
    },
 
    tearDown: function () {
    },
 */
	'basic': function(test) {
		test.expect(1);
		test.equal(1, 1);
		test.done();
	}
});

exports['DOM Testing'] = nodeunit.testCase(
{
	'basic': function(test)
	{
		test.expect(2);
		var dom = ContentGrabber.domify(html);
		test.equal(dom.getElementById('lol').innerHTML, 'hello');
		dom.getElementById('lol').innerHTML = "jigglypuff!";
		test.equal(dom.getElementById('lol').innerHTML, 'jigglypuff!');
		test.done();
	}
});
