/**
 * Feed.js is the data model for a feed.
 **/

/**
 * Model dependencies
 **/
var crypto         = require('crypto');
var DatabaseDriver = require('../libraries/DatabaseDriver.js');

/**
 * The Feed model
 **/
var Feed = function()
{
	/**
	 * Saves a feed to the database.
	 * 	
	 * 	Arguments:    url
	 * 	              title
	 * 	              author
	 * 	              description
	 * 	              
	 * 	Returns:      the feed_id of the item that was saved
	 * 	              false on error
	 **/
	this.save = function(url, title, author, description, errback, callback)
	{
		DatabaseDriver.getCollection(
			'feeds',
			function(err)
			{
				errback(err);
			},
			function(collection)
			{
				var hasher = crypto.createHash('sha512');
				hasher.update(url);
				var url_hash = hasher.digest('hex');
				
				DatabaseDriver.ensureExists(
					collection,
					{'url_hash': url_hash},
					{'url': url,
					 'url_hash': url_hash,
					 'update_lock': false,
					 'title': title,
					 'author': author,
					 'description': description,
					 'time_modified': new Date().getTime()
					},
					function(err)
					{
						errback(err);
						collection.db.close();
					},
					function(feed_id)
					{
						callback(feed_id);
						collection.db.close();
					}
				);
			}
		);
	}
	
	/**
	 * Gets a feed from the database.
	 * 
	 * 	Arguments:    feed_id
	 * 	              
	 * 	Returns:      JSON object {
	 * 	                  feed_id
	 * 	                  url
	 * 	                  title
	 * 	                  author
	 * 	                  description
	 * 	                  time_modified
	 * 	              }
	 **/
	this.get = function(feed_id, errback, callback)
	{
		DatabaseDriver.getCollection(
			'feeds',
			function(err)
			{
				errback(err);
			},
			function(collection)
			{
				collection.findOne(
					{'url_hash': feed_id},
					function(err, doc)
					{
						if(err != null)
							errback(new Error('Database Search Error'));
						else {
							if(typeof(doc) == 'undefined') {
								errback(new Error('No such feed'));
							} else {
								callback(doc);
							}
						}
					}
				);
			}
		);
	}

	/**
	 * Checks if a feed is up to date, relative to a given
	 * expiry length.
	 * 
	 * 	Arguments:    feed_id
	 * 	              expiry_length (in minutes)
	 * 	              
	 * 	Returns:      true if feed.time_modified
	 * 	                  < now - expiry_length
	 * 	              false otherwise
	 **/
	this.isUpToDate = function(feed_id, expiry_length)
	{
		
	}
};

module.exports = new Feed();
