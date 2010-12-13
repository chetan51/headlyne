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
	var self = this;

	/**
	 * Saves a feed to the database.
	 * 	
	 * 	Arguments:    url
	 * 	              title
	 * 	              author
	 * 	              description
	 * 	              
	 * 	Returns:      the feed that was saved
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
				var hasher = crypto.createHash('sha256');
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
					 'time_modified': new Date().getTime(),
					 'items': []
					},
					function(err)
					{
						errback(err);
					},
					function(feed)
					{
						callback(feed);
					}
				);
			}
		);
	}
	
	/**
	 * Gets a feed from the database.
	 * 
	 * 	Arguments:    feed_url
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
	this.get = function(feed_url, errback, callback)
	{
		var hasher = crypto.createHash('sha256');
		hasher.update(feed_url);
		var feed_id = hasher.digest('hex');

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
	 * 	Arguments:    feed_url
	 * 	              expiry_length (in minutes)
	 * 	              
	 * 	Returns:      true if feed.time_modified + expiry_length
	 * 	                  > now
	 * 	              false otherwise
	 **/
	this.isUpToDate = function(feed_url, expiry_length, errback, callback)
	{
		expiry_length = expiry_length*1000*60;
		self.get(
			feed_url,
			function(err)
			{
				errback(err);
			},
			function(feed)
			{
				var now = new Date().getTime();
				var expires = parseInt(feed.time_modified) + parseInt(expiry_length);
				if( now < expires )
					callback(true);
				else
					callback(false);
			}
		);
	}

	/**
	 * Deletes a feed.
	 *
	 * 	Arguments:    feed_url
	 *
	 * 	Returns:      calls the callback with no parameters
	 * 	              if the deletion was successful.
	 * 	              Otherwise, it calls the errback.
	 **/
	this.remove = function(feed_url, errback, callback)
	{
		var hasher = crypto.createHash('sha256');
		hasher.update(feed_url);
		var feed_id = hasher.digest('hex');
		DatabaseDriver.getCollection(
			'feeds',
			function(err)
			{
				errback(err);
			},
			function(collection)
			{
				collection.remove(
					{'url_hash':feed_id},
					function(err, doc)
					{
						if(err != null)
							errback(new Error('Database Deletion Error'));
						else {
							callback();
						}
					}
				);
			}
		);
	}

	/**
	 * Pushes a feed item into a feed.
	 *
	 * 	Arguments:    feed_url, Feed({url, title, description, time_published})
	 *
	 * 	Returns:      updated feed.
	 **/
	this.pushFeedItems = function(feed_url, feed_items, errback, callback)
	{
		self.get(
			feed_url,
			function(err)
			{
				errback(err);
			},
			function(feed)
			{
				// The feed exists.
				feed.items = feed.items.concat(feed_items);
				feed.time_modified = new Date().getTime();
				DatabaseDriver.getCollection(
					'feeds',
					function(err)
					{
						errback(err);
					},
					function(collection)
					{
					DatabaseDriver.update(
						collection,
						{'url_hash': feed.url_hash},
						feed,
						function(err)
						{
							errback(err);
						},
						function(feed)
						{
							callback(feed);
						}
					);
					}
				);
			}
		);
	}

	/**
	 * Pops a feed item from a feed.
	 *
	 * 	Arguments:    feed_url
	 *
	 * 	Returns:      updated feed, popped items.
	 **/
	this.popFeedItems = function(feed_url, errback, callback, pop_size)
	{
		if(pop_size == null || typeof(pop_size) == 'undefined')
		{
			pop_size = 1;
		}

		self.get(
			feed_url,
			function(err)
			{
				errback(err);
			},
			function(feed)
			{
				// The feed exists.
				var feed_items = feed.items.splice(0, pop_size);
				feed.time_modified = new Date().getTime();
				
				DatabaseDriver.getCollection(
					'feeds',
					function(err)
					{
						errback(err);
					},
					function(collection)
					{
						DatabaseDriver.update(
							collection,
							{'url_hash':feed.url_hash},
							feed,
							function(err)
							{
								errback(err);
							},
							function(new_feed)
							{
								callback(new_feed, feed_items);
							}
						);
					}
				);
			}
		);
	}
};

module.exports = new Feed();
