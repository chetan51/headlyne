/**
 *  Module dependencies
 **/
var http = require('http');
var fs = require('fs');
var nodeunit = require('nodeunit');
var FeedParser = require('../../src/libraries/FeedParser.js');
var Ni = require('ni');

/**
 *  Test Constants
 **/
var sampleFeed = {
	path        : './test/mocks/mock_app/views/basic_feed.xml',
	title       : 'RSS Title',
	link        : 'http://www.someexamplerssdomain.com/main.html',
	description : 'This is an example of an RSS feed',
	items       : [
		{
			title       : "Item 1 Title",
			description : "Here is some text containing an interesting description of the thing to be described.",
			link        : "http://localhost:7500/blogpost1"
		},
		{
			title       : "Item 2 Title",
			description : "More description.",
			link        : "http://localhost:7500/blogpost2"
		}
	]
};

/**
 *  Tests
 **/
exports['parse XML'] = nodeunit.testCase(
{
	setUp: function (callback) {
		Ni.config('feedparse_timeout', 5000);
		callback();
	},

	tearDown: function (callback) {
		callback();
	},
	
	'basic RSS': function(test) {
		test.expect(9);
		
		var rss = fs.readFileSync(sampleFeed.path, 'utf-8');
		
		FeedParser.parse(
			rss,
			function(err, feed) {
				if (err) {
					console.log(err);
				}
				else {
					test.equal(feed.title, sampleFeed.title);
					test.equal(feed.link, sampleFeed.link);
					test.equal(feed.description, sampleFeed.description);
					for (var i in feed.items) {
						item = feed.items[i];
						
						test.equal(item.title, sampleFeed.items[i].title);
						test.equal(item.description, sampleFeed.items[i].description);
						test.equal(item.link, sampleFeed.items[i].link);
					}
				}
				test.done();
			}
		);
	},
	
	'Malformed': function(test) {
		test.expect(1);
		str='<malformed><xml></malformed>';
		FeedParser.parse(
			str,
			function(err) {
				if (err) {
					test.equal(err.message, 'Element: must be nested correctly');
				}
				test.done();
			}
		);
	},
	
	'Incomplete': function(test) {
		test.expect(1);
		str='<malformed><xml></malfo';
		
		Ni.config('feedparse_timeout', 1000); // temporarily speeds up
		                                      // this test
		
		FeedParser.parse(
			str,
			function(err) {
				if (err) {
					test.equal(err.message, 'Parser timed out.');
				}
				test.done();
			}
		);
	},
	
	'Timed Out': function(test) {
		test.expect(1);
		str='<xml></xml>';
		
		Ni.config('feedparse_timeout', 0);
		
		FeedParser.parse(
			str,
			function(err) {
				if (err) {
					test.equal(err.message, 'Parser timed out.');
				}
				test.done();
			}
		);
	}
});

exports['strip URLs'] = nodeunit.testCase(
{
	'basic': function(test) {
		test.expect(3);
		var str='watch this video:    http://vimeo.com/8122132   and then see this picture http://www.flickr.com/photos/pmorgan/32606683/';
		var ret = FeedParser.stripURLs(str);
		test.equal(ret.length, 2);
		test.equal(ret[0], 'http://vimeo.com/8122132');
		test.equal(ret[1], 'http://www.flickr.com/photos/pmorgan/32606683/');
		test.done();
	}
});
