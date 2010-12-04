var Downloader = function() {

    thisDownloader = this;

    this.fetch = function(url, callback, errback, timeout)
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
                        thisDownloader.fetch(resp.headers.location, callback);
                        break;
                    default:
                        errback(new Error("Error " + resp.statusCode + ": Page not found."));
                        break;
                }
            }
        );
       	req.end();

        if (!timeout) {
            timeout = 30000;
        }

        setTimeout(function(){
            req.on('response', function(resp){});
            errback(new Error('Request timed out.'));
        }, timeout);
    }

};

module.exports = new Downloader();
