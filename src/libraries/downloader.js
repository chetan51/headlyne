var Downloader = function() {

    thisDownloader = this;

    this.fetch = function(url, callback, errback, timeout, max_redirect_level)
    {
	if(typeof(max_redirect_level) == 'undefined'){
		max_redirect_level = 5;
	}
	if(max_redirect_level == 0)
	{
		errback(new Error('Endless redirection.'));
		return;
	}

        var str='';
        var u = require('url'), http = require('http');

        var urlObj = u.parse(url);
        if(urlObj.port == null || typeof(urlObj.port) == 'undefined'){
            urlObj.port = 80;
        }
	//console.log('abt to connect');
        var client = http.createClient(urlObj.port, urlObj.hostname);
	
	client.on('error', function(e)
		{
			errback(new Error("Cannot connect to server."));
		}
	);
	
        var req = client.request('GET', urlObj.href);
        req.on('response', function(resp)
            {
		//console.log('responsed');
                switch(resp.statusCode){
                    case 200:
                        resp.on('data', function(data){ str += data; });
                        resp.on('end', function(){ callback(str); });
                        break;
                    case 301:
                    case 302:
                        thisDownloader.fetch(resp.headers.location, callback, errback, timeout, max_redirect_level-1);
                        break;
                    default:
                        errback(new Error("Error " + resp.statusCode + ": Page not found."));
                        break;
                }
            }
        );
       	req.end();
	//console.log('requested');
        if (timeout == null || typeof(timeout) == 'undefined') {
            timeout = 30000;
        }

        setTimeout(function(){
            errback(new Error('Request timed out.'));
        }, timeout);
    }

};

module.exports = new Downloader();
