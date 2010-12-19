/**
 * Dependencies
 **/
var crypto  = require('crypto'),
    User    = require('../models/User'),
    Ni      = require('ni');


/**
 *	Provides functions for user-authentication.
 **/
var UserAuth = function()
{
	/**
	 *	Class variables
	 */
	var self = this;

	this.session_gen = function(username, lifetime)
	{
		var id_gen = crypto.createHash('sha256');
		id_gen.update(Math.random() + username);
		var id = id_gen.digest('hex');

		var data = {
			'history': [],
			'user': username
		};

		var session_cookie = {
			'id'        : id,
			'data'      : data,
			'persistent': true,
			'lifetime'  : lifetime
		};
		return session_cookie;
	}

	// passed a session object (as in the database).
	// returns true if the session has expired.
	this.checkExpired = function(session_object)
	{
		var now = new Date().getTime();
		
		// if still valid, pass the same session object.
		if(	session_object.created +
			session_object.cookie.lifetime
			> now )
			return false;
		else	return true;
	}
	
	/**
	 *	Authenticates a user based on username and password.
	 *	If the credentials are invalid, returns an error.
	 *	Otherwise, return a new or existent session from the database
	 *
	 *	Arguments:
	 *		username
	 *		password
	 *
	 *		optional 'lifetime' -- if session created,
	 *		the lifetime for it.
	 *
	 *	callback:
	 *		is_new_session,    true if the session
	 *		                   expired or did not exist
	 *		session JSON
	 *		{
	 *			'id': unique_id,
	 *			'data': {
	 *				history[],
	 *				user: 'username'
	 *			},
	 *			'persistent',
	 *			'lifetime',
	 *		}
	 **/
	this.authenticate = function( username, password, callback )
	{
		User.get(
			username,
			function(err, user)
			{
				if(err != null)
				{
					callback(err);
					return;
				}
				var hasher = crypto.createHash('sha256');
				hasher.update(password);
				var pass_hash = hasher.digest('hex');

				// if invalid, throw an error.
				if(user.password_hash != pass_hash)
				{
					callback(new Error('Invalid Password'));
					return;
				}

				// if the session has NOT expired..
				if(	user.session != null &&
					user.session.cookie != null &&
					! self.checkExpired(user.session)
				)
					callback(null, false, user.session.cookie);
				else {
					// generate a new session
					var new_sesh={};
					new_sesh.cookie = self.session_gen( username, Ni.config('session_lifetime') );
					new_sesh.created = new Date().getTime();
					
					User.setSession(
						username,
						new_sesh,
						function(err, sesh)
						{
							callback(err, true, sesh);
						}
					);
				}
			}
		);
	}

	/**
	 * Check if the session provided is a valid one or not.
	 *
	 * Returns true if valid and not expired.
	 * If expired, return false and delete it from the database.
	 **/
	this.checkAuth = function(session_cookie, callback)
	{
		if(session_cookie == null || typeof(session_cookie.data.username) != 'undefined')
			callback(new Error('Invalid Session Cookie'));

		var username = session_cookie.data.username;

		User.get(
			username,
			function(err,user)
			{
				if(err != null) {
					callback(err);
					return;
				}
				// if user's cookie has expired...
				if (	user.session == null ||
					user.session.cookie == null ||
					self.checkExpired(user.session)) {
					
					// erase the session.
					User.setSession(
						username,
						null,
						function(err, s)
						{
							callback(err, false);
						}
					);
					return;
				}

				// otherwise, check if the objects match.
				var hasher1 = createHash('sha256');
				var hasher2 = createHash('sha256');
				hasher1.update(session_cookie);
				hasher2.update(user.session.cookie);
				var input_cookie_hash = hasher1.digest('hex');
				var expected_hash = hasher2.digest('hex');

				if( input_cookie_hash != expected_hash)
					callback(new Error('Invalid Session Cookie'));
				else {
					// session objects match, and not expired.
					callback(null, true);
				}
			}
		);
	}

	/**
	 * Removes the session object from the user.
	 * Returns err=null if successful.
	 **/
	this.invalidate = function(username, callback)
	{
		User.setSession(
			username,
			null,
			function(err, s)
			{
				callback(err, s);
			}
		);
	}
}

module.exports = new UserAuth();
