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
	this.getFullContent = function getFullContent(webpage_url, callback)
	{
		dbg.called();
		
		var fake_item = {}; fake_item.link = webpage_url;
		self.getWebPageForFeedItem(
			true,
			fake_item,
			function returnWebPage(err, webpage)
			{
				dbg.called();
		
				callback(err, webpage);
				dbg.exited();
			}
		);
		dbg.exited();
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
	this.getFeedTeaser = function getFeedTeaser(url, num_feed_items, callback_immediately, callback_updated)
	{
		dbg.called();
		
		FeedModel.isUpToDate(
			url,
			function updateOrReturnFeed(err, result) {
				dbg.called();
		
				if (err) {
					if (err.message == "No such feed") {
						callback_immediately(null, null);
						self.updateFeedForURL(
							url,
							num_feed_items,
							function returnFeedUpdated(err, feed_teaser) {
								dbg.called();
		
								callback_updated(err, feed_teaser);
								dbg.exited();
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
							function returnFeedImmediatelyAndUpdated(err, feed_teaser) {
								dbg.called();
		
								callback_immediately(err, feed_teaser);
								callback_updated(err, feed_teaser);
								dbg.exited();
							}
						);
					}
					else {
						callback_immediately(null, null);
						self.updateFeedForURL(
							url,
							num_feed_items,
							function returnFeedUpdated(err, feed_teaser) {
								dbg.called();
		
								callback_updated(err, feed_teaser);
								dbg.exited();
							}
						);
					}
				}
				dbg.exited();
			}
		);
		dbg.exited();
	}
	
	/**
	 *	Gets feed and items and webpages from database and builds teaser.
	 *	
	 *		Arguments: url of feed
	 *		           callback function called with feed teaser when complete
	 **/
	this.getFeedTeaserFromDatabase = function getFeedTeaserFromDatabase(url, num_feed_items, callback)
	{
		dbg.called();
		
		FeedModel.get(
			url,
			function updateWebPagesAndReturnFeedTeaser(err, feed) {
				dbg.called();
		
				if (err) {
					callback(err);
				}
				else {
					self.updateWebPagesForFeedItems(
						feed.items,
						num_feed_items,
						function returnFeedTeaser(err, webpages) {
							dbg.called();
		
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
							dbg.exited();
						}
					);
				}
				dbg.exited();
			}
		);
		dbg.exited();
	}
	
	/**
	 *	Updates the feed for given URL and its items and webpages in the database.
	 *	
	 *		Arguments: url of feed
	 *		           number of feed items to get
	 *		           callback function called with feed, items
	 *		               and webpages when complete
	 **/
	this.updateFeedForURL = function updateFeedForURL(url, num_feed_items, callback)
	{
		dbg.called();
		
		Downloader.fetch(
			url,
			function parseAndReturnFeed(err, data, real_url) {
				dbg.called();
		
				if (err) {
					callback(err);
				}
				else if (!data) {
					callback(new Error("Feed could not be downloaded"));
				}
				else {
					FeedParser.parse(
						data,
						function updateAndReturnFeed(err, feed) {
							dbg.called();
		
							if (err) {
								callback(err);
							}
							else {
								self.updateParsedFeed(
									url,
									feed,
									num_feed_items,
									function returnParsedFeed(err, teaser)
									{
										dbg.called();
										
										callback(err, teaser);
										dbg.exited();
									}
								);
							}
							dbg.exited();
						}
					);
				}
				dbg.exited();
			}
		);
		dbg.exited();
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
	this.updateParsedFeed = function updateParsedFeed(url, feed, num_feed_items, callback)
	{
		dbg.called();
		
		Step(
			function processFeed() {
				dbg.called();
		
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
				dbg.exited();
			},
			function generateAndReturnTeaser(
				err,
				saved_feed,
				saved_webpages
			)
			{
				dbg.called();
		
				//var teaser = ;
				self.generateFeedTeaser(
					saved_feed,
					saved_feed.items,
					num_feed_items,
					saved_webpages
				);
				if (err) {
					callback(err);
				} else {
					callback(null, saved_feed);
				}
				dbg.exited();
				return;
			}
		);
		dbg.exited();
	}
	
	/**
	 *	Saves or overwrites feed and its feed items in database.
	 *	
	 *		Arguments: url of feed
	 *		           the feed
	 *		           the feed's items
	 *		           callback function called with feed when complete
	 **/
	this.saveFeedAndItems = function saveFeedAndItems(url, feed, items, callback)
	{
		dbg.called();
		
		FeedModel.save(
			url,
			feed.title,
			feed.author,
			feed.description,
			function saveFeedItems(err, saved_feed) {
				dbg.called();
		
				if (err) {
					callback(err);
				}
				else {
					FeedModel.pushFeedItems(
						url,
						items,
						function returnFeedWithFeedItemsUpdated(err, updated_feed) {
							dbg.called();
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
								callback(null, updated_feed);
							}
							dbg.exited();
						}
					);

				}
				dbg.exited();
			}
		);
		dbg.exited();
	}
	
	/**
	 *	Retrieves and stores web pages for given feed items if they
	 *	aren't already in the database.
	 *	
	 *		Arguments: the feed items
	 *		           callback function called with saved
	 *		               web pages when complete
	 **/
	this.updateWebPagesForFeedItems = function updateWebPagesForFeedItems(items, num_items, callback)
	{
		dbg.called();
		
		Step(
			function getAndSaveWebPages() {
				dbg.called();
		
				var group = this.group();
				var total_items = 0;
				items.forEach(
					function eachItem(item) {
						dbg.called();
		
						if (total_items < num_items) {
							self.getWebPageForFeedItem(
								(total_items != 0),
								item,
								group()
							);
							total_items++;
						}
						dbg.exited();
					}
				);
				dbg.exited();
			},
			function returnSavedWebpages(err, saved_webpages) {
				dbg.called();
		
				if (err) {
					callback(err);
				}
				else {
					callback(null, saved_webpages);
				}
				dbg.exited();
				return;
			}
		);
		dbg.exited();
	}
	
	/**
	 *	Retrieves the web page associated with given feed item.
	 *	Gets it from the database if it's there.
	 *	
	 *	Arguments:
	 *		fetch_immediately -- flag. if true, background 
	 *		    download. If false, fetch and return.
	 *		the feed item
	 *		callback function called with retrieved
	 *		    web page when complete
	 **/
	this.getWebPageForFeedItem = function getWebPageForFeedItem(fetch_immediately, item, callback)
	{
		dbg.called();
		dbg.log(process.memoryUsage().heapUsed);
		
		WebPageModel.get(
			item.link,
			function fetchOrReturnWebPage(err, webpage) {
				dbg.called();
		
				if (err) {
					if (err.message == "No such WebPage") {
						// return a null page, fetch the item afterwards.
						if( fetch_immediately ) {
							callback(null, 
								{
									"url":item.link,
									"title": item.title,
									"snippet": "Loading Snippet...",
									"body": "Loading Article..."
								}
							);
							self.fetchWebPageForFeedItem(
								item,
								function updatedWebPage(err, webpage)
								{
									dbg.called();
									// do nothing, for now.
									dbg.exited();
								}
							);
						} else {
							// return after fetching.
							self.fetchWebPageForFeedItem(
								item,
								callback
							);
						}
					}
					else {
						callback(err);
					}
				}
				else {
					callback(null, webpage);
				}
				dbg.exited();
			}
		);
		dbg.exited();
	}
	
	/**
	 *	Retrieves the web page associated with given feed item.
	 *	
	 *		Arguments: the feed item
	 *		           callback function called with retrieved
	 *		               web page when complete
	 **/
	this.fetchWebPageForFeedItem = function fetchWebPageForFeedItem(item, callback)
	{
		dbg.called();
		
		Downloader.fetch(
			item.link,
			function grabContentForWebPage(err, data, real_url) {
				dbg.called();
		
				if (!err && data) {
					ContentGrabber.readable(
						real_url,
						data,
						function saveWebPage(err, title, article) {
							dbg.called();
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
							dbg.exited();
						}
					);
				}
				else {
					callback(null, null);
				}
				dbg.exited();
			}
		);
		dbg.exited();
	}
	
	/**
	 *	Combines feed, items and webpages into one feed teaser object.
	 *	
	 *		Arguments: the feed
	 *		           the feed items
	 *		           webpages for each feed item
	 **/
	this.generateFeedTeaser = function generateFeedTeaser(feed, items, num_feed_items, webpages)
	{
		dbg.called();
		
		feed.items = items.slice(0, num_feed_items);
		
		// Attach webpages to items
		for (var i in feed.items) {
			for (var j in webpages) {
				if (webpages[j] && feed.items[i].link == webpages[j].url) {
					feed.items[i].webpage = webpages[j];
				}
			}
		}
		dbg.exited();
		return feed;
	}
};

/**
 *	Exports the FeedServer library
 **/
module.exports = new FeedServer();
