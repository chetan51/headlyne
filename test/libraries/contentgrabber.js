/**
 *  Module dependencies
 **/
var nodeunit = require('nodeunit');
var ContentGrabber = require('../../src/libraries/ContentGrabber.js');
var fs = require('fs');

/**
 *  Sample data
 **/
var html='<html><head></head><body><div id="lol">hello</div></body></html>';

/**
 *  Test Constants
 **/
var sampleHTMLFile       = './test/mocks/sample_page.html';
var sampleHTMLTitle      = "\n\t\t\t\n            \n                Why Node.js Is Totally Awesome \n            \n            Chetan Surpur\n\t\t\t\n\t\t"; // Fix this
var sampleHTMLFirstLine  = "Three reasons: speed, easability, and reusability.";
var sampleHTMLLastLine   = "Sorry about that everyone!";

/**
 *  Tests
 **/
exports['grab content from page'] = nodeunit.testCase(
{
	
	setUp: function (callback) {
		callback();
	},

	tearDown: function (callback) {
		callback();
	},

	'basic': function(test)
	{
		test.expect(3);
		
		var html = fs.readFileSync(sampleHTMLFile, 'utf-8');
		
		ContentGrabber.readable(
			html,
			function(err, title, readableHTML) {
				if (err) {
					test.ifError(err);
					test.done();
				}
				else {
					test.equal(title, sampleHTMLTitle);
					test.notEqual(readableHTML.search(sampleHTMLFirstLine), -1);
					test.notEqual(readableHTML.search(sampleHTMLLastLine), -1);
					test.done();
				}
			}
		);
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
