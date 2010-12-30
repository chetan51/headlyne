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
	 * userUpdateHelper -- an internal use function for add, update and 
	 * 	removeFeed. Given a new user object, updates the old one
	 * 	with it.
	 *
	 * 	Arguments:
	 * 		user_object
	 *
	 * 		callback(err, new_user_object)
	 **/
	this.userUpdateHelper = function(user_object, callback)
	{
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
					{'username_hash': user_object.username_hash},
					user_object,
					function(err, user)
					{
						if (err) {
							callback(err);
							return;
						}
						callback(null, user);
					}
				);
			}
		);
	}

	/**
	 * Updates feed placement for a user.
	 *
	 * 	Arguments:
	 * 		username,
	 * 		feed_url,
	 * 		row,
	 * 		column
	 *
	 * 	Returns:      list of feeds.
	 **/
	this.updateFeed = function(username, feed_url, row, column, callback)
	{
		self.get(
			username,
			function(err, user)
			{
				if(err != null) {
					callback(err);
					return;
				}
				
				// the user exists, find the old entry.
				var to_move;
				for( i in user.feeds )
				{
					for( j in user.feeds[i] )
					{
						if(
							'url' in user.feeds[i][j] &&
							user.feeds[i][j].url == feed_url ) {

							to_move = user.feeds[i].splice(j, 1);
						}
					}
				}
				
				// now, add it in the right place.

				// add columns if necessary
				if( user.feeds.length <= column )
				{
					while(user.feeds.length <= column)
					{
						user.feeds.splice(
							user.feeds.length, // add at end
							0,
							[] // splice an empty array
						);
					}
				}
				
				// add url in correct column.
				user.feeds[column].splice(
					row,
					0,
					to_move[0]
				);
				
				// update the user.
				self.userUpdateHelper(
					user,
					function(err, user2)
					{
						callback(err, user2.feeds);
					}
				);
			}
		);
	}

	/**
	 * Adds a feed for a user.
	 * 
	 * 	Arguments:
	 * 		username,
	 * 		feed_url,
	 * 		row,
	 * 		column
	 *
	 * 	Returns:      list of feeds.
	 **/
	this.addFeed = function(username, feed_url, row, column, callback)
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

				// add columns if necessary
				if( user.feeds.length <= column )
				{
					while(user.feeds.length <= column)
					{
						user.feeds.splice(
							user.feeds.length, // add at end
							0,
							[] // splice an empty array
						);
					}
				}
				
				// add url in correct column.
				user.feeds[column].splice(
					row,
					0,
					{'url':feed_url}
				);
				
				// update the user.
				self.userUpdateHelper(
					user,
					function(err, user2)
					{
						callback(err, user2.feeds);
					}
				);
			}
		);
	}

	/**
	 * Remove a feed column.
	 * 
	 * 	Arguments:
	 * 		username
	 * 		column to remove.
	 *
	 * 	Returns: list of feeds.
	 **/
	this.deleteColumn = function(username, column, callback)
	{
		self.get(
			username,
			function(err, user)
			{
				if(err != null) {
					callback(err);
					return;
				}

				// The user exists, remove the bad column.
				if( column < user.feeds.length ) {
					user.feeds.splice(column, 1);
				}

				// update the user.
				self.userUpdateHelper(
					user,
					function(err, user2)
					{
						callback(err, user2.feeds);
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
				var found=false;
				for( i in user.feeds )
				{
					for( j in user.feeds[i] )
					{
						if( 'url' in user.feeds[i][j]       &&
						    user.feeds[i][j].url == feed_url  ) {
							
							user.feeds[i].splice(j, 1);
							found=true;
						}
					}
				}

				// if not found, toss an error.
				if( !found )
				{
					callback(new Error('No such feed'), user.feeds);
					return;
				}

				// otherwise, update the user.
				self.userUpdateHelper(
					user,
					function(err, user2)
					{
						callback(err, user2.feeds);
					}
				);
			}
		);
	}
}

module.exports = new User();
