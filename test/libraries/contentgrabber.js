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
var sampleDocument = {
	url        : './test/mocks/mock_app/views/blogpost1.html',
	title      : "Why Node.js Is Totally Awesome \n            \n            Chetan Surpur",
	first_line : "Three reasons: speed, easability, and reusability.",
	last_line  : "Sorry about that everyone!"
};

var sampleDocument2 = {
	url        : './test/mocks/mock_app/views/blogpost3.html',
	title      : "A Curious Breach Of Privacy \n            \n            Chetan Surpur",
	first_line : "I got this email",
	last_line  : "life will continue to be"
};

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
		
		var html = fs.readFileSync(sampleDocument.url, 'utf-8');
		
		ContentGrabber.readable(
			html,
			function(err, title, readableHTML) {
				if (err) {
					test.ifError(err);
					test.done();
				}
				else {
					test.equal(title, sampleDocument.title);
					test.notEqual(readableHTML.search(sampleDocument.first_line), -1);
					test.notEqual(readableHTML.search(sampleDocument.last_line), -1);
					test.done();
				}
			}
		);
	},

	'basic 2': function(test)
	{
		test.expect(3);
		
		var html = fs.readFileSync(sampleDocument2.url, 'utf-8');
		
		ContentGrabber.readable(
			html,
			function(err, title, readableHTML) {
				if (err) {
					test.ifError(err);
					test.done();
				}
				else {
					test.equal(title, sampleDocument2.title);
					test.notEqual(readableHTML.search(sampleDocument2.first_line), -1);
					test.notEqual(readableHTML.search(sampleDocument2.last_line), -1);
					test.done();
				}
			}
		);
	},

	'parse failure': function(test) {
		test.expect(1);
		
		ContentGrabber.readable(
			"<html></html>",
			function(err, title, readableHTML) {
				if (err) {
					console.log(err.message);
					test.ok(1);
				}
				test.done();
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
