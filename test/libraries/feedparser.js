var http = require('http')
var nodeunit = require('nodeunit');
var FeedParser = require('../../src/libraries/feedparser.js');
var Downloader = require('../../src/libraries/downloader.js');


exports['parse XML'] = nodeunit.testCase(
{
	'basic': function(test)
	{
		test.expect(1);
		var serv = http.createServer(function (req, res){
                        res.writeHead(200, {'Content-Type': 'text/html'});
                        res.end('<?xml version="1.0" ?><rss version="2.0">  <channel><title>RSSFeed1</title> '+
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

				'</channel></rss>');
                });
		serv.listen(7357, 'localhost', function(){
			Downloader.fetch('http://localhost:7357', function(str){
				test.doesNotThrow( function(){
					FeedParser.parse(str, function(items){
							for(i in items)
							{
								console.log("title: "+items[i][0]);
								console.log("link: "+items[i][1]);
								console.log("desc: "+items[i][2]);
							}
					});
				} );
				serv.close();
			});
		});
		serv.on('close', function(errno){ test.done(); });
	},
	'BreakTest': function(test)
	{
		test.expect(1);
		var serv = http.createServer(function (req, res){
                        res.writeHead(404, {'Content-Type': 'text/html'});
                        res.end();
                });
		
		serv.listen(7357, function(){
			Downloader.fetch('http://localhost:7357', function(str){
				test.throws(FeedParser.parse(str, function(items){}));
				serv.close();
			});
		});
		serv.on('close', function(errno){ test.done(); });
		
	}
});
