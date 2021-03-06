/**
 *  Module dependencies
 **/
var nodeunit = require('nodeunit');
var ContentGrabber = require('../../src/libraries/ContentGrabber.js');
var fs = require('fs');
var Ni = require('ni');

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

var sampleDocument3 = {
	url        : './test/mocks/mock_app/views/webpage1.html',
	title      : "Create and publish your own website quickly and easily using iWeb, Pages, and many other applications available for Mac OS X.",
	first_line : "It’s a snap to create and publish your own website",
	last_line  : "For more information about the Apache web server"
};

var sampleDocument4 = {
	url        : './test/mocks/mock_app/views/webpage2.html',
	title      : "First-timers win big at Golden Globes",
	first_line : "It wasn't the same old same-old at the 68th Golden Globes Awards on Sunday night.",
	last_line  : "susan.king@latimes.com"
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

	'real life 1': function(test)
	{
		test.expect(3);
		
		var html = fs.readFileSync(sampleDocument4.url, 'utf-8');
		
		ContentGrabber.readable(
			html,
			function(err, title, readableHTML) {
				if (err) {
					test.ifError(err);
					test.done();
				}
				else {
					//console.log(readableHTML);
					
					test.equal(title, sampleDocument4.title);
					test.notEqual(readableHTML.search(sampleDocument4.first_line), -1);
					test.notEqual(readableHTML.search(sampleDocument4.last_line), -1);
					test.done();
				}
			}
		);
	}
});

exports['snippets'] = nodeunit.testCase(
{
	setUp: function (callback) {
		Ni.config('snippet_image_limit', 1);
		Ni.config('snippet_text_limit', 650);
		callback();
	},

	tearDown: function (callback) {
		callback();
	},

	'image limited': function(test)
	{
		test.expect(1);
		
		var html = fs.readFileSync(sampleDocument.url, 'utf-8');
		
		ContentGrabber.readable(
			html,
			function(err, title, readableHTML) {
				if (err) {
					test.ifError(err);
					test.done();
				}
				else {
					var snippet = ContentGrabber.snip(readableHTML);

					//console.log(snippet);
					test.equal(snippet.length, 201);
					test.done();
				}
			}
		);
	},

	'text limited': function(test)
	{
		test.expect(1);
		
		var html = fs.readFileSync(sampleDocument2.url, 'utf-8');
		
		ContentGrabber.readable(
			html,
			function(err, title, readableHTML) {
				if (err) {
					test.ifError(err);
					test.done();
				}
				else {
					var snippet = ContentGrabber.snip(readableHTML);
					
					//console.log(snippet);
					test.equal(snippet.length, 782);
					test.done();
				}
			}
		);
	},
	
	'post limited': function(test)
	{
		test.expect(1);
		
		var html = fs.readFileSync(sampleDocument3.url, 'utf-8');
		
		ContentGrabber.readable(
			html,
			function(err, title, readableHTML) {
				if (err) {
					test.ifError(err);
					test.done();
				}
				else {
					var snippet = ContentGrabber.snip(readableHTML);
					
					//console.log(snippet);
					test.equal(snippet.length, 757);
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
