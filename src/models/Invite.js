/**
 *    Invite model
 **/

/**
 * Model dependencies
 **/
var crypto         = require('crypto');
var DatabaseDriver = require('../libraries/DatabaseDriver.js');

/**
 * The invite model
 **/
var InviteModel = function()
{
	var self = this;

	/**
	 * Adds an invite to the database.
	 * 	
	 * 	Arguments:    inviter
	 * 	              
	 * 	Returns:      the code that was saved
	 **/
	this.add = function(inviter, callback)
	{
		DatabaseDriver.getCollection(
			'invites',
			function(err, collection)
			{
				if (err) {
					callback(err);
				}
				else {
					var hasher = crypto.createHash('sha256');
					hasher.update(inviter + Math.random());
					var invite_code = hasher.digest('base64');
					invite_code = invite_code.slice(10, 20);

					DatabaseDriver.ensureInsert(
						collection,
						{'invite_code': invite_code},
						{'invite_code': invite_code,
						 'inviter'    : inviter
						},
						function(err, invite)
						{
							if (err) {
								callback(err);
							}
							else {
								callback(null, invite.invite_code);
							}
						}
					);
				}
			}
		);
	}
	
	/**
	 * Checks if an invite is in the database.
	 * 
	 * 	Arguments:    code
	 * 	              
	 * 	Returns:      true of false
	 **/
	this.exists = function(code, callback)
	{
		DatabaseDriver.getCollection(
			'invites',
			function(err, collection)
			{
				if (err) {
					callback(err);
				}
				else {
					collection.findOne(
						{'invite_code': code},
						function(err, doc)
						{
							if(err != null)
								callback(new Error('Database Search Error'));
							else {
								if(typeof(doc) == 'undefined') {
									callback(null, false);
								} else {
									callback(null, true );
								}
							}
						}
					);
				}
			}
		);
	}
	
	/**
	 * Removes an invite from the database.
	 * 
	 * 	Arguments:    code
	 * 	              
	 * 	Returns:      true if there are no errors.
	 **/
	this.remove = function(code, callback)
	{
		DatabaseDriver.getCollection(
			'invites',
			function(err, collection)
			{
				if (err) {
					callback(err);
				}
				else {
					collection.remove(
						{'invite_code': code},
						function(err, doc)
						{
							if(err != null)
								callback(new Error('Database Search Error'));
							else {
								callback(null, true );
							}
						}
					);
				}
			}
		);
	}

	/**
	 * Adds a person's details to the invite requested list.
	 *
	 * 	Arguments:
	 * 		email
	 * 		first_name
	 * 		last_name
	 * 	Returns:
	 * 		nothing (only errors, if any)
	 **/
	this.request_invite = function(email, first_name, last_name, callback)
	{
		DatabaseDriver.getCollection(
			'invite_requested',
			function(err, collection)
			{
				if (err) {
					callback(err);
				}
				else {
					DatabaseDriver.overwrite(
						collection,
						{'email' : email},
						{'email'     : email,
						 'first_name': first_name,
						 'last_name' : last_name
						},
						function(err, added)
						{
							if (err) {
								callback(err);
							}
							else {
								callback(null);
							}
						}
					);
				}
			}
		);
	}
}

module.exports = new InviteModel();
