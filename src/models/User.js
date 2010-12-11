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
	 * Saves a new user to the database.
	 * 	
	 * 	Arguments:    username
	 * 	              password
	 * 	              first name
	 * 	              last name
	 * 	              email address
	 * 	              
	 * 	Returns:      JSON object of the User that was saved
	 * 	              (password is stripped)
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

				var hasher = crypto.createHash('sha256');
				hasher.update(username);
				var usn = hasher.digest('hex');

				DatabaseDriver.ensureInsert(
					collection,
					{'username_hash': usn},
					{'username_hash': usn,
					 'username': username,
					 'password_hash': key,
					 'first_name': first_name,
					 'last_name': last_name,
					 'email_id': email_id,
					 'feeds': [],
					 'session':{}
					},
					function(err)
					{
						errback(err);
					},
					function(user)
					{
						//delete user['password_hash'];
						callback(user);
					}
				);
			}
		);
	}

	/**
	 * Gets a user from the database.
	 * 
	 * 	Arguments:    username
	 * 	              
	 * 	Returns:      JSON object {
	 * 	                  username
	 * 	                  first_name
	 * 	                  last_name
	 * 	                  email_id
	 * 	                  feeds{}[]
	 * 	                  session{}
	 * 	              }
	 **/
	this.get = function(username, errback, callback)
	{
		var hasher = crypto.createHash('sha256');
		hasher.update(username);
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
					{'username_hash': key},
					function(err, doc)
					{
						if(err != null)
							errback(new Error('Database Search Error'));
						else {
							if(typeof(doc) == 'undefined') {
								errback(new Error('No such User'));
							} else {
								//delete doc['password_hash'];
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
	 * 	Arguments:    username, new_password, first_name, last_name, email_id
	 * 	              For unchanged parameters, pass null.
	 *
	 * 	Returns:      updated user object.
	 **/
	this.update = function(
		username,
		new_password,
		first_name,
		last_name,
		email_id,
		errback,
		callback )
	{
		self.get(
			username,
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
					user.password_hash = hasher.digest('hex');
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
							{'username_hash': user.username_hash},
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
	 * Sets a session to the user.
	 *
	 * 	Arguments:    username, session.
	 *
	 * 	Returns:      saved session object.
	 **/
	this.setSession = function(username, session, errback, callback)
	{
		self.get(
			username,
			function(err)
			{
				errback(err);
			},
			function(user)
			{
				// The user exists.
				user.session = session;

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
							{'username_hash': user.username_hash},
							user,
							function(err)
							{
								errback(err);
							},
							function(user)
							{
								callback(user.session);
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
