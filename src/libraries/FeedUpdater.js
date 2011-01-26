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
		Ni.model('Feeds').getAll(
			{
				//older than Ni.config seconds.
				//var start = new Date(), end = new Date();
				//db.feeds.find({updated_on: {$gte: start, $lt: end}});
				// function should set 'updated_on' on all retrieved feeds.
			},
			function updateList(feed_array)
			{
				dbg.cal`led();
				//for each one,
					self.enqueue(feed_url);
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
