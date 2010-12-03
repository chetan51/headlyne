var Downloader = function() {

    this.fetch = function(url, callback)
    {
        var str='';
        var u = require('url'), http = require('http');

        var urlObj = u.parse(url);
        if(!urlObj.port){
            urlObj.port = 80;
        }
        var client = http.createClient(urlObj.port, urlObj.hostname);

        var req = client.request('GET', urlObj.href);
        req.on('response', function(resp)
            {
                switch(resp.statusCode){
                    case 200:
                        resp.on('data', function(data){ str += data; });
                        resp.on('end', function(){ callback(str); });
                        break;
                    case 301:
                    case 302:
			var d = new Downloader();
                        d.fetch(resp.headers.location, callback);
                        break;
                    default:
                        throw 'Failed to Retrieve URL';
                        break;
                }
            }
        );
       	req.end();

	setTimeout(function(){
		req.on('response', function(resp){});
		throw 'Request Timed Out';
	}, 30000);
    }

};

module.exports = new Downloader();
