var http = require('http')
var nodeunit = require('nodeunit');
var FeedParser = require('../../src/libraries/FeedParser.js');
var Ni = require('ni');

exports['parse XML'] = nodeunit.testCase(
{
	setUp: function (callback) {
		Ni.config('feedparse_timeout', 5000);
		callback();
	},

	tearDown: function (callback) {
		callback();
	},
	
	'basic': function(test) {
		test.expect(6);
		var rss = '<?xml version="1.0" ?><rss version="2.0">  <channel><title>RSSFeed1</title> '+
				'<description>Feed desc.</description>'+
				'<link>feedlink.com</link>'+
				
				'<item><title>Item1</title>'+
				'<link>link1.com</link>'+
				'<description>Desc of Item 1</description></item>'+
				
				'<item><title>Item75</title>'+
                                '<description>Desc of Item 75</description>'+
                                '<link>link75.com</link></item>'+
				
				'<item>'+
                                '<link>link2.com</link>'+
                                '<description>Desc of Item 2</description>'+
				'<title>Item2</title>'+
				'</item>'+
				
				'</channel></rss>';
		
		FeedParser.parse(rss,
			function() { test.ok(1); },
			
			function() { test.equal('','Parse-Error'); }
		);
		
		FeedParser.parse(rss,
			function(channelinfo, items, type, version) {
				test.equal(channelinfo.length, 3);
				for(i in channelinfo) {
					if(channelinfo[i][0] == 'title')
						test.equal(channelinfo[i][1], 'RSSFeed1');
					else if(channelinfo[i][0] == 'link')
						test.equal(channelinfo[i][1], 'feedlink.com');
					else if(channelinfo[i][0] == 'description')
						test.equal(channelinfo[i][1], 'Feed desc.');
				}

				test.equal(items.length, 3);
				for(i in items){
					
				}
				test.done();
			},
			
			function() {
				test.equal('','Parse-Error');
				test.done();
			}
		);
	},
	
	'Malformed': function(test) {
		test.expect(1);
		str='<malformed><xml></malformed>';
		FeedParser.parse(str,
			function() {
				test.equal('','Malformed');
				test.done();
			},
			function(err) {
				test.equal(err.message, 'Element: must be nested correctly');
				test.done();
			}
		);
	},
	
	'Incomplete': function(test) {
		test.expect(1);
		str='<malformed><xml></malfo';
		
		Ni.config('feedparse_timeout', 1000); // temporarily speeds up
		                                      // this test
		
		FeedParser.parse(str,
			function() {
				test.equal('','Incomplete');
				test.done();
			},
			function(err) {
				test.equal(err.message, 'Parser timed out.');
				test.done();
			}
		);
	},
	
	'Timed Out': function(test) {
		test.expect(1);
		str='<xml></xml>';
		
		Ni.config('feedparse_timeout', 0);
		
		FeedParser.parse(str,
			function() {
				test.equal('','Timed Out');
				test.done();
			},
			function(err) {
				test.equal(err.message, 'Parser timed out.');
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
