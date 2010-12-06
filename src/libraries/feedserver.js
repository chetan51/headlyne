/**
 * FeedServer - a controller that, given a particular feed url,
 * serves the top-most article back to the user.
 **/

/**
 * Module dependencies
 **/
var     Downloader = require('downloader'),
	FeedReader = require('feedreader'),
	ContentGrabber = require('contentgrabber');

/**
 * The FeedServer
 **/
var FeedServer = function()
{    
	var thisFeedServer = this;
	
	this.new_items = function(url, feed_hash)
	{
		Downloader.fetch(
			url,
			function(rsshtml)
			{
				// Hash rsshtml.
				// If hash does not match feed_hash:
				// modified returns top item(s)
				// Else return null;
			}
		);
	}

	this.getContent = function(url, feed_hash, callback, errback)
	{
		var items = thisFeedServer.new_items(url, feed_hash);
		if(items != null ) {
			var top_item = items[0];
			rss = FeedReader.parse(rsshtml);
			content_url = selectURL(top_item);

			Downloader.fetch(
				content_url,
				function(content_html)
				{
					ContentGrabber.readable(
						content_html,
						function(clean_html)
						{
							callback(clean_html);
						},
						function(err)
						{
							errback(err);
						}
					);
				},
				function(err)
				{
					errback(err);
				}
			);
		}
	}

	this.selectURL = function(item)
	{
		// IF title has a link, prefer that over the provided 'Link'
		// otherwise select 'Link' content.
		// may be modified (customized by user?)??
	}
};

/**
 * Exports the FeedServer
 **/
module.exports = new FeedServer();
