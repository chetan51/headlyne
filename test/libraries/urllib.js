var http = require('http')
var nodeunit = require('nodeunit');
var urllib = require('../../src/libraries/urllib.js');


exports['fetch URLs'] = nodeunit.testCase(
{
	'basic': function(test)
	{
		test.expect(1);
		var serv = http.createServer(function (req, res){
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.write('<html><head></head></html>');
			res.end();
		});
		
		serv.listen(7357, function(){
			urllib.fetch('http://localhost:7357', function(str){
				test.equal(str, "<html><head></head></html>");
				serv.close();
			});
		});
		
		serv.on('close', function(errno){ test.done(); });
		
	},
	'Bad URL': function(test)
	{
		test.expect(1);
		test.throws(urllib.fetch('lksjdflksdjflksdjaflksdjflksdjkfjsdjf.com'));
		test.done();
	}	
});

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
				'<description>Desc of Item 1</description>'+
				'<link>link1.com</link></item>'+
				
				'<item><title>Item75</title>'+
                                '<description>Desc of Item 75</description>'+
                                '<link>link75.com</link></item>'+

				'<item><title>Item2</title>'+
                                '<description>Desc of Item 2</description>'+
                                '<link>link2.com</link></item>'+

				'</channel></rss>');
                });
		
		serv.listen(7358, function(){
			urllib.fetch('http://localhost:7358', function(str){
				test.doesNotThrow(urllib.parse(str));
				
				serv.close();
			});
		});
		serv.on('close', function(errno){ test.done(); });
	},
	'break on 404': function(test)
	{
		test.expect(1);
		var serv = http.createServer(function (req, res){
                        res.writeHead(404, {'Content-Type': 'text/html'});
                        res.end();
                });
		
		serv.listen(7359, function(){
			urllib.fetch('http://localhost:7359', function(str){
				test.throws(urllib.parse(str));
				serv.close();
			});
		});
		serv.on('close', function(errno){ test.done(); });
		
	}
});
