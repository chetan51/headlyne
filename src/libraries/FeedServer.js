/**
 *	FeedServer
 * 
 *		Provides methods for retrieval of feeds and their content,
 *		integrating the downloader, content grabber and the database.
 **/

/**
 *	Module dependencies
 **/
var Downloader     = require('./Downloader.js'),
    FeedParser     = require('./FeedParser.js'),
    ContentGrabber = require('./ContentGrabber.js'),
    FeedModel      = require('../models/Feed.js');

/**
 *	The FeedServer library
 **/
var FeedServer = function()
{    
	var thisFeedServer = this;
	
	/**
	 *	Gets feed and items for feed for previewing to the user.
	 *	
	 *		If feed is in database and is up to date, calls callback
	 *		with it immediately.
	 *	
	 *		If feed is not in database or is not up to date, and
	 *		instant is false, it retrieves and stores the feed, and
	 *		calls callback when the feed is ready.
	 *	
	 *		If feed is not in database or is not up to date, and
	 *		instant is true, it calls the callback with null and
	 *		retrieves and stores the feed in the background for
	 *		later retrieval.
	 *	
	 *		Arguments: url of feed
	 *		           number of feed items to return
	 *		           callback function for success
	 *		           callback function for error
	 *		           return results instantly?
	 **/
	this.getFeedTeaser = function(url, num_feed_items, callback,
	                              errback, instant)
	{
		if (instant) {
			callback(null);
		}
		else {
			Downloader.fetch(
				url,
				function(data) {
					FeedParser.parse(
						data,
						function(feed) {
							// Mocking feed
							feed =
								{
									title: "RSS Title"
								}
							callback(feed);
						},
						function(err) {},
						30000
					);
				},
				function(err) {},
				30000
			);
		}
	}
};

/**
 *	Exports the FeedServer library
 **/
module.exports = new FeedServer();
