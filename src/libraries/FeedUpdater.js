/**
 *	Module dependencies
 **/
var url  = require('url'),
    http = require('http'),
    rest = require('restler'),
    Ni   = require('ni'),
    dbg  = require('./Debugger');

var resque = require('coffee-resque').connect({
	host: "localhost",
	port: 6379
});

/**
 *	FeedUpdater library
 **/
var FeedUpdater = function() {
	
	var self = this;
	
	this.start = function()
	{
		var deadline = new Date().getTime();
		deadline = deadline - Ni.config('feed_expiry_length') + Ni.config('feed_time_to_expiry');

		Ni.model('Feeds').fetchOutdated(
			deadline,
			function updateList(err, feed_array)
			{
				dbg.called();
				if(err && err.message != 'No feeds to process'){
					setTimeout(30*1000, self.start);
					return;
				} else if(err) {
					dbg.log(err);
					setTimeout(30*1000, self.start);
					return;
				}

				for(i=0; i<feed_array.length; i++)
				{
					self.enqueue(feed_array[i].url);
				}
				setTimeout(30*1000, self.start);

			}
		);
	}
	
	this.enqueue = function(feed_url, callback)
	{
		dbg.called();
		
		resque.enqueue(
			'FeedUpdater',
			'enqueue',
			[feed_url],
			callback
		);
	}
	
	this.worker = new function()
	{

	}
};

module.exports = new FeedUpdater();
