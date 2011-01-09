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
    FeedModel      = require('../models/Feed.js'),
    WebPageModel   = require('../models/WebPage.js'),
    Step           = require('step'),
    Ni             = require('ni'),
    dbg            = require('../../src/libraries/Debugger.js');

/**
 *	The FeedServer library
 **/
var FeedServer = function()
{    
	var self = this;

	/**
	 * Gets the content for a webpage given a URL
	 *
	 * 	Arguments:
	 * 		webpage_url
	 *
	 * 	Returns (via callback):
	 * 		err
	 * 		webpage {
	 * 			url
	 * 			url_hash
	 * 			title
	 * 			snippet
	 * 			body
	 * 		}
	 **/
	this.getFullContent = function(webpage_url, callback)
	{
		var fake_item = {}; fake_item.link = webpage_url;
		self.getWebPageForFeedItem(
			fake_item,
			function(err, webpage)
			{
				callback(err, webpage);
			}
		);
	}
	
	/**
	 *	Gets feed and items for feed for previewing to the user.
	 *	
	 *		If feed is in database and is up to date, calls callback
	 *		with it immediately.
	 *	
	 *		If feed is not in database or is not up to date, it calls
	 *		the callback with null and retrieves and stores the feed
	 *		in the background for later retrieval.
	 *		
	 *		The second callback is called with the feed as soon as
	 *		it is up to date.
	 *	
	 *		Arguments: url of feed
	 *		           number of feed items to return
	 *		           callback function called with whatever data
	 *		           	is immediately available
	 *		           callback function called when completely up
	 *		           	to date
	 **/
	this.getFeedTeaser = function(url, num_feed_items, callback_immediately, callback_updated)
	{
		FeedModel.isUpToDate(
			url,
			function(err, result) {
				if (err) {
					if (err.message == "No such feed") {
						callback_immediately(null, null);
						self.updateFeedForURL(
							url,
							num_feed_items,
							function(err, feed_teaser) {
								dbg.log('fire back from feedTeaser');
								callback_updated(err, feed_teaser);
							}
						);
					}
					else {
						callback_immediately(err);
						callback_updated(err);
					}
				}
				else {
					if (result) {
						self.getFeedTeaserFromDatabase(
							url,
							num_feed_items,
							function(err, feed_teaser) {
								callback_immediately(err, feed_teaser);
								callback_updated(err, feed_teaser);
							}
						);
					}
					else {
						callback_immediately(null, null);
						self.updateFeedForURL(
							url,
							num_feed_items,
							function(err, feed_teaser) {
								dbg.log('get feed teaser callback fired');
								callback_updated(err, feed_teaser);
							}
						);
					}
				}
			}
		);
	}
	
	/**
	 *	Gets feed and items and webpages from database and builds teaser.
	 *	
	 *		Arguments: url of feed
	 *		           callback function called with feed teaser when complete
	 **/
	this.getFeedTeaserFromDatabase = function(url, num_feed_items, callback)
	{
		FeedModel.get(
			url,
			function(err, feed) {
				if (err) {
					callback(err);
				}
				else {
					dbg.log('updating '+JSON.stringify(feed));
					self.updateWebPagesForFeedItems(
						feed.items,
						num_feed_items,
						function(err, webpages) {
							if (err) {
								callback(err);
							}
							else {
								var teaser = self.generateFeedTeaser(
									feed,
									feed.items,
									num_feed_items,
									webpages
								);
								callback(null, teaser);
							}
						}
					);
				}
			}
		);
	}
	
	/**
	 *	Updates the feed for given URL and its items and webpages in the database.
	 *	
	 *		Arguments: url of feed
	 *		           number of feed items to get
	 *		           callback function called with feed, items
	 *		               and webpages when complete
	 **/
	this.updateFeedForURL = function(url, num_feed_items, callback)
	{
		Downloader.fetch(
			url,
			function(err, data) {
				if (err) {
					callback(err);
				}
				else if (!data) {
					callback(new Error("Feed could not be downloaded"));
				}
				else {
					FeedParser.parse(
						data,
						function(err, feed) {
							if (err) {
								callback(err);
							}
							else {
								self.updateParsedFeed(
									url,
									feed,
									num_feed_items,
									function(err, teaser)
									{
										callback(err, teaser);
									}
								);
							}
						}
					);
				}
			}
		);
	}
	
	/**
	 *	Updates the given parsed feed and its items and webpages in the database.
	 *	
	 *		Arguments: url of feed
	 *		           parsed feed
	 *		           number of feed items to get
	 *		           callback function called with feed, items
	 *		               and webpages when complete
	 **/
	this.updateParsedFeed = function(url, feed, num_feed_items, callback)
	{
		Step(
			function processFeed() {
				var step = this;
			
				self.saveFeedAndItems(
					url,
					feed,
					feed.items,
					step.parallel()
				);
				
				self.updateWebPagesForFeedItems(
					feed.items,
					num_feed_items,
					step.parallel()
				);
			},
			function done(
				err,
				saved_feed,
				saved_webpages
			)
			{
				var teaser = self.generateFeedTeaser(
					saved_feed,
					saved_feed.items,
					num_feed_items,
					saved_webpages
				);
				
				dbg.log('generated teaser');
					
				if (err) {
					callback(err);
				}
				else {
					callback(null, teaser);
				}
			}
		);
	}
	
	/**
	 *	Saves or overwrites feed and its feed items in database.
	 *	
	 *		Arguments: url of feed
	 *		           the feed
	 *		           the feed's items
	 *		           callback function called with feed when complete
	 **/
	this.saveFeedAndItems = function(url, feed, items, callback)
	{
		FeedModel.save(
			url,
			feed.title,
			feed.author,
			feed.description,
			function(err, saved_feed) {
				if (err) {
					callback(err);
				}
				else {
					FeedModel.pushFeedItems(
						url,
						items,
						function(err, feed) {
							if (err) {
								callback(err);
							}
							else {
								/* Ideally, this should return feed
								 * items separately, but it's not
								 * working with Step so we can deal
								 * with it later when we need to
								 * separate feed and feed items.
								 */
								callback(null, feed);
							}
						}
					);
				}
			}
		);
	}
	
	/**
	 *	Retrieves and stores web pages for given feed items if they
	 *	aren't already in the database.
	 *	
	 *		Arguments: the feed items
	 *		           callback function called with saved
	 *		               web pages when complete
	 **/
	this.updateWebPagesForFeedItems = function(items, num_items, callback)
	{
		dbg.log('update webpages... '+num_items);
		dbg.log(callback);
		Step(
			function getAndSaveWebPages() {
				var group = this.group();
				var total_items = 0;
				items.forEach(
					function(item) {
						if (total_items < num_items) {
							dbg.log('updating '+item);
							self.getWebPageForFeedItem(
								item,
								group()
							);
							total_items++;
						}
					}
				);
			},
			function done(err, saved_webpages) {
				dbg.log('saved pages'+err+'|'+saved_webpages);
				if (err) {
					callback(err);
				}
				else {
					callback(null, saved_webpages);
				}
			}
		);
	}
	
	/**
	 *	Retrieves the web page associated with given feed item.
	 *	Gets it from the database if it's there.
	 *	
	 *		Arguments: the feed item
	 *		           callback function called with retrieved
	 *		               web page when complete
	 **/
	this.getWebPageForFeedItem = function(item, callback)
	{
		WebPageModel.get(
			item.link,
			function(err, webpage) {
				if (err) {
					if (err.message == "No such WebPage") {
						dbg.log('retrying...');
						self.fetchWebPageForFeedItem(
							item,
							callback
						);
					}
					else {
						dbg.log('error: '+err.message);
						callback(err);
					}
				}
				else {
					dbg.log('got page');
					callback(null, webpage);
				}
			}
		);
				
	}
	
	/**
	 *	Retrieves the web page associated with given feed item.
	 *	
	 *		Arguments: the feed item
	 *		           callback function called with retrieved
	 *		               web page when complete
	 **/
	this.fetchWebPageForFeedItem = function(item, callback)
	{
		Downloader.fetch(
			item.link,
			function(err, data) {
				if (!err && data) {
					ContentGrabber.readable(
						data,
						function(err, title, article) {
							if (!err && title && article) {
								WebPageModel.save(
									item.link,
									title,
									article,
									callback
								);
							}
							else {
								callback(null, null);
							}
						}
					);
				}
				else {
					callback(null, null);
				}
			}
		);
	}
	
	/**
	 *	Combines feed, items and webpages into one feed teaser object.
	 *	
	 *		Arguments: the feed
	 *		           the feed items
	 *		           webpages for each feed item
	 **/
	this.generateFeedTeaser = function(feed, items, num_feed_items, webpages)
	{
		feed.items = items.slice(0, num_feed_items);
		
		// Attach webpages to items
		for (var i in feed.items) {
			for (var j in webpages) {
				if (webpages[j] && feed.items[i].link == webpages[j].url) {
					feed.items[i].webpage = webpages[j];
				}
			}
		}
		
		return feed;
	}
};

/**
 *	Exports the FeedServer library
 **/
module.exports = new FeedServer();
