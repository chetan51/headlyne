var http = require('http')
var nodeunit = require('nodeunit');
var Downloader = require('../../src/libraries/downloader.js');

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
			Downloader.fetch('http://localhost:7357', function(str){
				test.equal(str, "<html><head></head></html>");
				serv.close();
			});
		});
		
		serv.on('close', function(errno){ test.done(); });
		
	},
	'Bad URL': function(test)
	{
		test.expect(1);
		test.throws(Downloader.fetch('lksjdflksdjflksdjaflksdjflksdjkfjsdjf.com'));
		test.done();
	}	
});
