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
	var interval_id;
	
	this.start = function start()
	{
		interval_id = setInterval(self.poll, Ni.config('feed_update_polls'));
		self.poll();
	}
	this.poll = function poll()
	{
		dbg.called();

		var deadline = new Date().getTime();
		deadline = deadline - Ni.config('feed_expiry_length') + Ni.config('feed_time_to_expiry');

		Ni.model('Feed').fetchOutdated(
			deadline,
			function fetchedOutdatedFeeds(err, feed_array)
			{
				dbg.called();
				if(err && err.message == 'No outdated feeds'){
					console.log('No feeds to process');
					return;
				} else if(err) {
					console.log(err);
					return;
				}

				for(i=0; i<feed_array.length; i++)
				{
					var url = feed_array[i].url;
					self.enqueue(
						url,
						function unlockFeed(err, teaser)
						{
							dbg.called();
							Ni.model('Feed').unlock(
								url,
								function(){}
							);
						}
					);
				}
				delete feed_array;
			}
		);
	}
	
	this.enqueue = function enqueue(feed_url, callback)
	{
		dbg.called();
		
		/*resque.enqueue(
			'FeedUpdater',
			'updateFeed',
			[feed_url],
			callback
		);*/
		dbg.log("before updater:"+process.memoryUsage().heapUsed);
		self.worker.updateFeed(feed_url, callback);
		dbg.log("after updater:"+process.memoryUsage().heapUsed);
	}
	
	this.worker = new function()
	{
		var self = this;
		
		this.updateFeed = function updateFeed(feed_url, callback) {
			dbg.called();

			Ni.library('FeedServer').updateFeedForURL(
				feed_url,
				Ni.config('max_num_feed_items'),
				function() {},
				callback
			);
		}
	}
};

module.exports = new FeedUpdater();
