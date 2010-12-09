/**
 * User.js is the data model for a user.
 **/

/**
 * Model dependencies
 **/
var crypto         = require('crypto');
var DatabaseDriver = require('../libraries/DatabaseDriver.js');

/**
 * The User model
 **/
var UserModel = function()
{
	/**
	 * Saves a new user to the database.
	 * 	
	 * 	Arguments:    username
	 * 	              first name
	 * 	              last name
	 * 	              email address
	 * 	              
	 * 	Returns:      the user_id of the item that was saved
	 * 	              false on error
	 **/
	this.save = function(username, first_name, last_name, email_address)
	{
		DatabaseDriver.getCollection(
			'users',
			function(err)
			{
				errback(err);
			},
			function(collection)
			{
				var hasher = crypto.createHash('sha512');
				hasher.update(username);
				var username_hash = hasher.digest('hex');
				
				DatabaseDriver.ensureExists(
					collection,
					{'username': username},
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
					function(user_id)
					{
						callback(user_id);
						collection.db.close();
					}
				);
			}
		);
	}
	
	/**
	 * Gets a user from the database.
	 * 
	 * 	Arguments:    user_id
	 * 	              
	 * 	Returns:      JSON object {
	 * 	                  user_id
	 * 	                  url
	 * 	                  title
	 * 	                  author
	 * 	                  description
	 * 	                  time_modified
	 * 	              }
	 **/
	this.get = function(user_id, errback, callback)
	{
		DatabaseDriver.getCollection(
			'users',
			function(err)
			{
				errback(err);
			},
			function(collection)
			{
				collection.findOne(
					{'url_hash': user_id},
					function(err, doc)
					{
						if(err != null)
							errback(new Error('Database Search Error'));
						else {
							if(typeof(doc) == 'undefined') {
								errback(new Error('No such user'));
							} else {
								callback(doc);
							}
						}
					}
				);
			}
		);
	}
};

module.exports = new UserModel();
