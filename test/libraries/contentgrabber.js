
/*
 *  Module dependencies
 */
var nodeunit = require('nodeunit');
var ContentGrabber = require('../../src/libraries/contentgrabber.js');
var fs = require('fs');
var jsdom = require('jsdom');

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
		test.expect(2);
		var html = fs.readFileSync('./test/mocks/nodejsblog.html', 'utf-8');
		
		var dom = ContentGrabber.readable(html);

		test.equal((dom.innerHTML).length, 7005);
		test.equal(dom.childNodes[0].childNodes.length, 75);
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
