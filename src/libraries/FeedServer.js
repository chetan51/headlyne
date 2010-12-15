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
    Step           = require('step');

/**
 *	The FeedServer library
 **/
var FeedServer = function()
{    
	var thisFeedServer = this;
	
	/**
	 *	Gets feed and items for feed for previewing to the user.
	 *	Returns whatever is immediately available, or null if it
	 *	will take time to retrieve everything.
	 *	
	 *		If feed is in database and is up to date, calls callback
	 *		with it immediately.
	 *	
	 *		If feed is not in database or is not up to date, it calls
	 *		the callback with null and retrieves and stores the feed
	 *		in the background for later retrieval.
	 *	
	 *		Arguments: url of feed
	 *		           number of feed items to return
	 *		           callback function for success
	 *		           callback function for error
	 **/
	this.getFeedTeaserUrgently = function(url, num_feed_items, callback, errback)
	{
		var self = this;

		FeedModel.isUpToDate(
			url,
			30,
			function(err) {
				if (err.message == "No such feed") {
					callback(null);
					self.getFeedTeaser(
						url,
						num_feed_items,
						function(feed) {},
						function(err) {}
					);
				}
			},
			function(result) {
				if (result) {
					FeedModel.get(
						url,
						function(err) {},
						function(feed) {
							callback(feed);
						}
					);
				}
				else {
					callback(null);
					self.getFeedTeaser(
						url,
						num_feed_items,
						function(feed) {},
						function(err) {}
					);
				}
			}
		);
	}
	
	/**
	 *	Gets feed and items for feed for previewing to the user.
	 *	
	 *		If feed is in database and is up to date, calls callback
	 *		with it immediately.
	 *	
	 *		If feed is not in database or is not up to date, it
	 *		retrieves and stores the feed, and calls callback when
	 *		the feed is ready.
	 *	
	 *		Arguments: url of feed
	 *		           number of feed items to return
	 *		           callback function for success
	 *		           callback function for error
	 **/
	this.getFeedTeaser = function(url, num_feed_items, callback, errback)
	{
		var self = this;
		
		Downloader.fetch(
			url,
			function(data) {
				FeedParser.parse(
					data,
					function(feed) {
						// Mocking feed
						feed =
							{
								title: "RSS Title",
								author: "Sample author",
								description: "Sample RSS feed",
								items:
									[
										{
											url: "http://item1url",
											title: "Item 1 Title"
										}
									]
							}
				
						Step(
							function saveFeedAndRetrieveItems() {
								var step = this;
							
								self.saveFeedAndItems(
									url,
									feed,
									step.parallel()
								);
								
								self.getWebPagesForFeedItems(
									feed.items,
									step.parallel()
								);
							},
							function done(err, saved_feed, saved_webpages) {
								if (err) {
									errback(err);
								}
								else {
									callback(feed);
								}
							}
						);
					},
					function(err) {},
					30000
				);
			},
			function(err) {},
			30000
		);
	}
	
	this.saveFeedAndItems = function(url, feed, callback)
	{
		FeedModel.save(
			url,
			feed.title,
			feed.author,
			feed.description,
			function(err) {},
			function(saved_feed) {
				FeedModel.pushFeedItems(
					url,
					feed.items,
					function(err) {},
					function(feed) {
						callback(null, feed);
					}
				);
			}
		);
	}
	
	this.getWebPagesForFeedItems = function(items, callback)
	{
		Step(
			function getAndSaveWebPages() {
				var group = this.group();
				items.forEach(
					function(item) {
						WebPageModel.save(
							item.url,
							"Webpage 1 Title",
							"eanrst",
							function(err) {
								group()(err);
							},
							function(saved_page) {
								group()(null, saved_page);
							}
						);
					}
				);
			},
			function done(err, saved_webpages) {
				if (err) {
					callback(err);
				}
				else {
					callback(null, saved_webpages);
				}
			}
		);
	}
};

/**
 *	Exports the FeedServer library
 **/
module.exports = new FeedServer();
