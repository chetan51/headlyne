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
	 * 	                  feeds{}
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
	 * Updates feed placement for a user.
	 *
	 * **Since addFeed does this anyway, this is just an alternate
	 * call to perform the same thing, for more understandable code.
	 * Call this when updating, and call add when adding new entries.
	 **/
	this.updateFeed = function(username, feed_url, placement, callback)
	{
		self.addFeed(username, feed_url, placement, callback);
	}

	/**
	 * Adds a feed for a user.
	 * 
	 * 	Arguments:
	 * 		username
	 * 		feed_url
	 * 		placement: {
	 * 			row: ,
	 * 			column:
	 * 		}
	 *
	 * 	Returns:      list of feeds.
	 **/
	this.addFeed = function(username, feed_url, placement, callback)
	{
		self.get(
			username,
			function(err, user)
			{
				if(err != null) {
					callback(err);
					return;
				}

				// The user exists, add the new entry.
				var entry = {
					'url': feed_url,
					'placement': placement
				};
				
				user.feeds[feed_url] = entry;

				DatabaseDriver.getCollection(
					'users',
					function(err, collection)
					{
						if (err) {
							callback(err);
							return;
						}
						
						DatabaseDriver.update(
							collection,
							{'username_hash': user.username_hash},
							user,
							function(err, user)
							{
								if (err) {
									callback(err);
									return;
								}
								callback(user);
							}
						);
					}
				);
			}
		);
	}
	
	/**
	 * Remove a feed from a user.
	 * 
	 * 	Arguments:
	 * 		username
	 * 		feed_url
	 *
	 * 	Returns: list of feeds.
	 **/
	this.removeFeed = function(username, feed_url, callback)
	{
		self.get(
			username,
			function(err, user)
			{
				if(err != null) {
					callback(err);
					return;
				}

				// The user exists, find and remove the old feed.
				delete user.feeds[feed_url];

				DatabaseDriver.getCollection(
					'users',
					function(err, collection)
					{
						if (err) {
							callback(err);
							return;
						}
						
						DatabaseDriver.update(
							collection,
							{'username_hash': user.username_hash},
							user,
							function(err, user)
							{
								if (err) {
									callback(err);
									return;
								}
								callback(user);
							}
						);
					}
				);
			}
		);
	}
}

module.exports = new User();
