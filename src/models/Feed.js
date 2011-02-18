/**
 * Feed.js is the data model for a feed.
 **/

/**
 * Model dependencies
 **/
var crypto         = require('crypto');
var DatabaseDriver = require('../libraries/DatabaseDriver.js');
var Ni             = require('ni');
var dbg            = require('../../src/libraries/Debugger.js');

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
	this.save = function save(url, title, author, description, callback)
	{
		dbg.called();
		
		DatabaseDriver.getCollection(
			'feeds',
			function updateFeed(err, collection)
			{
				dbg.called();
		
				if (err) {
					callback(err);
				}
				else {
					var hasher = crypto.createHash('sha256');
					hasher.update(url);
					var url_hash = hasher.digest('hex');
					
					DatabaseDriver.overwrite(
						collection,
						{'url_hash': url_hash},
						{'url': url,
						 'url_hash': url_hash,
						 'update_lock': false,
						 'title': title,
						 'author': author,
						 'description': description,
						 'time_modified': new Date().getTime()+'',
						 'time_accessed': new Date().getTime()+'',
						 'items': []
						},
						function returnUpdatedFeed(err, feed)
						{
							dbg.called();
		
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
	this.get = function get(feed_url, callback)
	{
		dbg.called();
		
		var hasher = crypto.createHash('sha256');
		hasher.update(feed_url);
		var feed_id = hasher.digest('hex');

		DatabaseDriver.getCollection(
			'feeds',
			function getFeed(err, collection)
			{
				dbg.called();
		
				if (err) {
					callback(err);
				}
				else {
					collection.findOne(
						{'url_hash': feed_id},
						function checkGotFeed(err, feed)
						{
							dbg.called();
		
							if(err != null)
								callback(new Error('Database Search Error'));
							else {
								if(typeof(feed) == 'undefined') {
									callback(new Error('No such feed'));
								} else {
									feed.time_accessed = new Date().getTime()+'';
									
									callback(null, feed);
									
									// Update time accessed
									DatabaseDriver.update(
										collection,
										{'url_hash':feed.url_hash},
										feed,
										function accessTimeUpdated(err, new_feed) {
											dbg.called();
										}
									);
								}
							}
						}
					);
				}
			}
		);
	}

	/**
	 * Checks if a feed is up to date, relative to the feed expiry length.
	 * 
	 * 	Arguments:    feed_url
	 * 	              
	 * 	Returns:      true if feed.time_modified + expiry_length
	 * 	                  > now
	 * 	              false otherwise
	 **/
	this.isUpToDate = function isUpToDate(feed_url, callback)
	{
		dbg.called();
		
		self.get(
			feed_url,
			function checkIfUpToDate(err, feed)
			{
				dbg.called();
		
				if (err) {
					callback(err);
				}
				else {
					var now = new Date().getTime();
					var expires = parseInt(feed.time_modified) + parseInt(Ni.config('feed_expiry_length'));
					if( now < expires )
						callback(null, true);
					else
						callback(null, false);
				}
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
	this.remove = function remove(feed_url, callback)
	{
		dbg.called();
		
		var hasher = crypto.createHash('sha256');
		hasher.update(feed_url);
		var feed_id = hasher.digest('hex');
		DatabaseDriver.getCollection(
			'feeds',
			function removeFeed(err, collection)
			{
				dbg.called();
		
				if (err) {
					callback(err);
				}
				else {
					collection.remove(
						{'url_hash':feed_id},
						function returnResult(err, doc)
						{
							if(err != null)
								callback(new Error('Database Deletion Error'));
							else {
								callback(null);
							}
						}
					);
				}
			}
		);
	}

	/**
	 * Fetches all feeds, ordered by time_accessed, older than given date.
	 * Feeds it fetches are updated to current time.
	 *
	 * 	Arguments:
	 * 		date
	 *
	 * 	Returns:
	 * 		array of feeds.
	 **/
	 this.fetchOutdated = function fetchOutdated(date, callback)
	 {
		 dbg.called();

		 DatabaseDriver.getCollection(
		 	'feeds',
			function getFeeds(err, collection)
			{
				if (err) {
					callback(err);
				} else {
					collection.find(
						{ 'time_modified' : {'$lt': date},
						  'update_lock'   : false
						},
						{'sort'          : 'time_accessed'},
						function checkGotFeeds(err, feeds_cursor)
						{
							dbg.called();
		
							if(err != null)
								callback(new Error('Database Search Error'));
							else {
								if(typeof(feeds_cursor) == 'undefined') {
									callback(new Error('No outdated feeds'));
								} else {
									feeds_cursor.toArray( function convertFeedstoArray(err, feeds)
									{
										dbg.called();

										callback(null, feeds);

										feeds.forEach(function eachFeed(feed, i) {
											feed.update_lock = true;
											
											// Set it with a lock
											DatabaseDriver.update(
												collection,
												{'url_hash':feed.url_hash},
												feed,
												function setUpdateLock(err, new_feed) {
													dbg.called();
												}
											);
										});
									});
								}
							}
						}
					);
				}
			}
		);
	 }

	 this.unlock = function unlock(feed_url, callback)
	 {
		dbg.called();
		
		DatabaseDriver.getCollection(
			'feeds',
			function updateFeed(err, collection)
			{
				dbg.called();
				
				if (err) {
					callback(err);
				} else {
					var hasher = crypto.createHash('sha256');
					hasher.update(feed_url);
					var url_hash = hasher.digest('hex');

					collection.find(
						{ 'url_hash' : url_hash },
						function checkGotFeed(err, feed)
						{
							dbg.called();
		
							if(err != null)
								callback(new Error('Database Search Error'));
							else {
								feed.time_modified = new Date().getTime()+'';
								feed.update_lock = false;

								DatabaseDriver.update(
									collection,
									{'url_hash': feed.url_hash},
									feed,
									function unlocked(err, new_feed) {
										dbg.called();
										callback(null);
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
	 * Pushes a feed item into a feed.
	 *
	 * 	Arguments:    feed_url, Feed({url, title, description, time_published})
	 *
	 * 	Returns:      updated feed.
	 **/
	this.pushFeedItems = function pushFeedItems(feed_url, feed_items, callback)
	{
		dbg.called();
		var local_items = feed_items;
		self.get(
			feed_url,
			function pushItems(err, feed)
			{
				dbg.called();
		
				if (err) {
					callback(err);
				}
				else {
					// The feed exists.
					feed.items = feed.items.concat(local_items);
					feed.time_modified = new Date().getTime()+'';
					var t_feed = JSON.stringify(feed);
					var t2_feed = JSON.parse(t_feed);
					DatabaseDriver.getCollection(
						'feeds',
						function updateDatabase(err, collection)
						{
							dbg.called();
		
							if (err) {
								callback(err);
							}
							else {
								DatabaseDriver.update(
									collection,
									{'url_hash': feed.url_hash},
									t2_feed,
									function returnResult(err, updated_feed)
									{
										if (err) {
											callback(err);
										}
										else {
											callback(null, updated_feed);
										}
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
	 * Pops a feed item from a feed.
	 *
	 * 	Arguments:    feed_url
	 *
	 * 	Returns:      updated feed, popped items.
	 **/
	this.popFeedItems = function popFeedItems(feed_url, callback, pop_size)
	{
		dbg.called();
		
		if(pop_size == null || typeof(pop_size) == 'undefined')
		{
			pop_size = 1;
		}

		self.get(
			feed_url,
			function getFeedItems(err, feed)
			{
				dbg.called();
		
				if (err) {
					callback(err);
				}
				else {
					// The feed exists.
					var feed_items = feed.items.splice(0, pop_size);
					feed.time_modified = new Date().getTime()+'';
					
					DatabaseDriver.getCollection(
						'feeds',
						function updateDatabaseForFeed(err, collection)
						{
							dbg.called();
		
							if (err) {
								callback(err);
							}
							else {
								DatabaseDriver.update(
									collection,
									{'url_hash':feed.url_hash},
									feed,
									function returnResult(err, new_feed)
									{
										if (err) {
											callback(err);
										}
										else {
											callback(null, new_feed, feed_items);
										}
									}
								);
							}
						}
					);
				}
			}
		);
	}
};

module.exports = new Feed();
