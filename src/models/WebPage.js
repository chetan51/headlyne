/**
 * WebPage.js is the data model for a web-page's readable content.
 **/

/**
 * Model dependencies
 **/
var crypto         = require('crypto');
var DatabaseDriver = require('../libraries/DatabaseDriver.js');
var ContentGrabber = require('../libraries/ContentGrabber.js');

/**
 * The WebPage model
 **/
var WebPage = function()
{
	var self = this;

	/**
	 * Saves a webpage to the database.
	 * 	
	 * 	Arguments:    url
	 * 	              title
	 * 	              body
	 * 	              
	 * 	Returns:      the webpage that was saved
	 **/
	this.save = function(url, title, body, callback)
	{
		DatabaseDriver.getCollection(
			'webpages',
			function(err, collection)
			{
				if (err) {
					callback(err);
				}
				else {
					var hasher = crypto.createHash('sha256');
					hasher.update(url);
					var url_hash = hasher.digest('hex');
					var snippet = ContentGrabber.snip(body);

					DatabaseDriver.ensureExists(
						collection,
						{'url_hash': url_hash},
						{'url': url,
						 'url_hash': url_hash,
						 'title': title,
						 'snippet': snippet,
						 'body': body,
						},
						function(err, feed)
						{
							if (err) {
								callback(err);
							}
							else {
								callback(null, feed);
							}
						}
					);
				}
			}
		);
	}
	
	/**
	 * Gets a webpage from the database.
	 * 
	 * 	Arguments:    page_url
	 * 	              
	 * 	Returns:      JSON object {
	 * 	                  url
	 * 	                  url_hash
	 * 	                  title
	 * 	                  snippet
	 * 	                  body
	 * 	              }
	 **/
	this.get = function(page_url, callback)
	{
		var hasher = crypto.createHash('sha256');
		hasher.update(page_url);
		var page_id = hasher.digest('hex');

		DatabaseDriver.getCollection(
			'webpages',
			function(err, collection)
			{
				if (err) {
					callback(err);
				}
				else {
					collection.findOne(
						{'url_hash': page_id},
						function(err, doc)
						{
							if(err != null)
								callback(new Error('Database Search Error'));
							else {
								if(typeof(doc) == 'undefined') {
									callback(new Error('No such WebPage'));
								} else {
									callback(null, doc);
								}
							}
						}
					);
				}
			}
		);
	}
}

module.exports = new WebPage();
