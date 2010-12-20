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
	this.save = function(username, password, first_name, last_name, email_id, callback)
	{
		DatabaseDriver.getCollection(
			'users',
			function(err, collection)
			{
				if (err) {
					callback(err);
				}
				else {
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
						function(err, user)
						{
							if (err) {
								callback(err);
							}
							else {
								//delete user['password_hash'];
								//console.log(user);
								callback(null, user);
							}
						}
					);
				}
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
	this.get = function(username, callback)
	{
		var hasher = crypto.createHash('sha256');
		hasher.update(username);
		var key = hasher.digest('hex');
		
		DatabaseDriver.getCollection(
			'users',
			function(err, collection)
			{
				if (err) {
					callback(err);
				}	
				else {
					collection.findOne(
						{'username_hash': key},
						function(err, doc)
						{
							if(err != null)
								callback(new Error('Database Search Error'));
							else {
								if(typeof(doc) == 'undefined') {
									callback(new Error('No such User'));
								} else {
									//delete doc['password_hash'];
									callback(null, doc);
								}
							}
						}
					);
				}
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
	this.update = function(username, new_password, first_name, last_name, email_id, callback)
	{
		self.get(
			username,
			function(err, user)
			{
				if (err) {
					callback(err);
				}
				else {
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
						function(err, collection)
						{
							if (err) {
								callback(err);
							}
							else {
								DatabaseDriver.update(
									collection,
									{'username_hash': user.username_hash},
									user,
									function(err, user)
									{
										if (err) {
											callback(err);
										}
										else {
											callback(null, user);
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
	 * Sets a session to the user.
	 *
	 * 	Arguments:    username, session.
	 *
	 * 	Returns:      saved session object.
	 **/
	this.setSession = function(username, session, callback)
	{
		self.get(
			username,
			function(err, user)
			{
				if (err) {
					callback(err);
				}
				else {
					// The user exists.
					user.session = session;

					DatabaseDriver.getCollection(
						'users',
						function(err, collection)
						{
							if (err) {
								callback(err);
							}
							else {
								DatabaseDriver.update(
									collection,
									{'username_hash': user.username_hash},
									user,
									function(err, user)
									{
										if (err) {
											callback(err);
										}
										else {
											callback(null, user.session);
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
	 * Pushes a feed for a user. STUB!!!
	 * Also, the callback format for self.get is not properly implemented, so fix that.
	 * And fix the callback format of this function itself.
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
					function(err, collection)
					{
						if (err) {
							errback(err);
						}
						else {
							DatabaseDriver.update(
								collection,
								{'url_hash': feed.url_hash},
								feed,
								function(err, feed)
								{
									if (err) {
										errback(err);
									}
									else {
										callback(feed);
									}
								}
							);
						}
					}
				);
			}
		);
	}

	/**
	 * Pops a feed item from a feed. STUB!
	 * Also, the callback format for self.get is not properly implemented, so fix that.
	 * And fix the callback format of this function itself.
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
					function(err, collection)
					{
						if (err) {
							errback(err);
						}
						else {
							DatabaseDriver.update(
								collection,
								{'url_hash':feed.url_hash},
								feed,
								function(err, new_feed)
								{
									if (err) {
										errback(err);
									}
									else {
										callback(new_feed, feed_items);
									}
								}
							);
						}
					}
				);
			}
		);
	}
}

module.exports = new User();
