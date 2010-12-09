/**
 * User.js is the data model for user information.
 **/

/**
 * Model dependencies
 **/
var crypto         = require('crypto');
var DatabaseDriver = require('../libraries/DatabaseDriver.js');

/**
 * The User model
 **/
var User = function()
{
	var self = this;

	/**
	 * Saves a new user
	 * 	
	 * 	Arguments:    username
	 * 	              password
	 * 	              first_name
	 * 	              last_name
	 * 	              email_id
	 * 	              
	 * 	Returns:      the saved object.
	 **/
	this.save = function(username, password, first_name, last_name, email_id, errback, callback)
	{
		DatabaseDriver.getCollection(
			'users',
			function(err)
			{
				errback(err);
			},
			function(collection)
			{
				var hasher = crypto.createHash('sha256');
				hasher.update(password);
				var key = hasher.digest('hex');

				DatabaseDriver.ensureInsert(
					collection,
					{'username': username},
					{'username': username,
					 'password': key,
					 'first_name': first_name,
					 'last_name': last_name,
					 'email_id': email_id,
					 'feeds': {}
					},
					function(err)
					{
						errback(err);
						collection.db.close();
					},
					function(user)
					{
						delete user['password'];
						callback(user);
						collection.db.close();
					}
				);
			}
		);
	}

	/**
	 * Gets a user from the database.
	 * 
	 * 	Arguments:    username
	 * 	              password
	 * 	              
	 * 	Returns:      JSON object {
	 * 	                  username
	 * 	                  first_name
	 * 	                  last_name
	 * 	                  email_id
	 * 	                  feeds[]
	 * 	              }
	 **/
	this.get = function(username, password, errback, callback)
	{
		var hasher = crypto.createHash('sha256');
		hasher.update(password);
		var key = hasher.digest('hex');

		DatabaseDriver.getCollection(
			'users',
			function(err)
			{
				errback(err);
			},
			function(collection)
			{
				collection.findOne(
					{
						'username': username,
						'password': key
					},
					function(err, doc)
					{
						if(err != null)
							errback(new Error('Database Search Error'));
						else {
							if(typeof(doc) == 'undefined') {
								errback(new Error('No such User'));
							} else {
								delete doc['password'];
								callback(doc);
							}
						}
					}
				);
			}
		);
	}

	/**
	 * Update user information.
	 *
	 * 	Arguments:    username, password, new_password, first_name, last_name, email_id
	 * 	              For unchanged parameters, pass null.
	 *
	 * 	Returns:      updated user object.
	 **/
	this.update = function(
		username,
		password,
		new_password,
		first_name,
		last_name,
		email_id,
		errback,
		callback )
	{
		self.get(
			username,
			password,
			function(err)
			{
				errback(err);
			},
			function(user)
			{
				// The user exists.
				if(new_password != null)
				{
					var hasher = crypto.createHash('sha256');
					hasher.update(new_password);
					user.password = hasher.digest('hex');
				}
				if(first_name != null)
					user.first_name = first_name;
				if(last_name != null)
					user.last_name = last_name;
				if(email_id != null)
					user.email_id = email_id;

				DatabaseDriver.getCollection(
					'users',
					function(err)
					{
						errback(err);
					},
					function(collection)
					{
						DatabaseDriver.update(
							collection,
							{
								'username': user.username,
								'password': user.password
							},
							user,
							function(err)
							{
								errback(err);
							},
							function(user)
							{
								callback(user);
							}
						);
					}
				);
			}
		);
	}

	/**
	 * Pushes a feed for a user. STUB!!!
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
	 * Pops a feed item from a feed. STUB!
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
}

module.exports = new User();
