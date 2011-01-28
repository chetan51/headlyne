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
		dbg.called();
		console.log('checking...');

		var deadline = new Date().getTime();
		deadline = deadline - Ni.config('feed_expiry_length') + Ni.config('feed_time_to_expiry');

		Ni.model('Feed').fetchOutdated(
			deadline,
			function updateList(err, feed_array)
			{
				dbg.called();
				if(err && err.message != 'No feeds to process'){
					setTimeout(self.start, Ni.config('feed_update_polls'));
					return;
				} else if(err) {
					dbg.log(err);
					setTimeout(self.start, Ni.config('feed_update_polls'));
					return;
				}

				for(i=0; i<feed_array.length; i++)
				{
					self.enqueue(
						feed_array[i].url,
						function unlock()
						{
							Ni.model('Feed').unlock(
								feed_array[i].url,
								function(){}
							);
						}
					);
				}
				setTimeout(self.start, Ni.config('feed_update_polls'));

			}
		);
	}
	
	this.enqueue = function(feed_url, callback)
	{
		dbg.called();
		
		resque.enqueue(
			'FeedUpdater',
			'updateFeed',
			[feed_url],
			callback
		);
	}
	
	this.worker = new function()
	{
		var self = this;
		
		this.updateFeed = function updateFeed(feed_url, callback) {
			dbg.called();

			Ni.library('FeedServer').updateFeedForURL(
				feed_url,
				Ni.config('max_num_feed_items'),
				function () {},
				callback
			);
		}
	}
};

module.exports = new FeedUpdater();
