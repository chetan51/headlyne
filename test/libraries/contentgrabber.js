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
	title      : " \n\t\t\t\n            \n                Why Node.js Is Totally Awesome | \n            \n            Chetan Surpur\n\t\t\t\n\t\t",
	first_line : "Three reasons: speed, easability, and reusability.",
	last_line  : "Sorry about that everyone!"
};

var sampleDocument2 = {
	url        : './test/mocks/mock_app/views/blogpost3.html',
	title      : " \n\t\t\t\n            \n                A Curious Breach Of Privacy | \n            \n            Chetan Surpur\n\t\t\t\n\t\t",
	first_line : "I got this email",
	last_line  : "life will continue to be"
};

var sampleDocument3 = {
	url        : './test/mocks/mock_app/views/webpage1.html',
	title      : "Your Website",
	first_line : "Create and publish your own website quickly",
	last_line  : "For more information about the Apache web server"
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
	
	'basic 3': function(test)
	{
		test.expect(3);
		
		var html = fs.readFileSync(sampleDocument3.url, 'utf-8');
		
		ContentGrabber.readable(
			html,
			function(err, title, readableHTML) {
				if (err) {
					test.ifError(err);
					test.done();
				}
				else {
					test.equal(title, sampleDocument3.title);
					test.notEqual(readableHTML.search(sampleDocument3.first_line), -1);
					test.notEqual(readableHTML.search(sampleDocument3.last_line), -1);
					test.done();
				}
			}
		);
	},

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
