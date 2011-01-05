/**
 * Dependencies
 **/
var crypto  = require('crypto'),
    User    = require('../models/User'),
    dbg     = require('./Debugger.js');
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

		var now = new Date().getTime();
		var expiry_date = new Date();
		expiry_date.setTime(parseInt(now) + lifetime);

		var data = {
			'history': [],
			'user': username
		};

		var session_cookie = {
			'id'        : id,
			'data'      : data,
			'persistent': true,
			'expires'  : parseInt(expiry_date.getTime())
		};
		return session_cookie;
	}

	// passed a session object (as in the database).
	// returns true if the session has expired.
	this.checkExpired = function(session_object)
	{
		var now = new Date().getTime();
		
		// if still valid, pass the same session object.
		

		if( session_object.cookie.expires > now ) {
			dbg.log('\tSession is valid');
			return false;
		} else {
			dbg.log('\tSession has expired');
			return true;
		}
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
	 *			'expires',
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
							callback(err, true, sesh.cookie);
						}
					);
				}
			}
		);
	}
	
	/**
	 * Returns true if the session_cookie is a valid JSON object for session_cookies
	 **/
	this.validate_cookie = function(session_cookie)
	{
		if( typeof(session_cookie) == 'undefined' || session_cookie == null) return false;
		if( typeof(session_cookie.id) == 'undefined' || session_cookie.id == null) return false;
		if( typeof(session_cookie.data) == 'undefined' || session_cookie.data == null) return false;
		if( typeof(session_cookie.persistent) == 'undefined' || session_cookie.persistent == null) return false;
		if( typeof(session_cookie.expires) == 'undefined' || session_cookie.expires == null) return false;
		if( typeof(session_cookie.data.user) == 'undefined' || session_cookie.data.user == null) return false;

		return true;
	}
	
	/**
	 * Returns true if the session_cookie matches the user_cookie
	 **/
	this.match_cookie = function(session_cookie, user_cookie)
	{
		if( session_cookie.id         != user_cookie.id ) return false;
		if( session_cookie.persistent != user_cookie.persistent ) return false;
		if( session_cookie.expires    != user_cookie.expires ) return false;
		if( session_cookie.data.user  != user_cookie.data.user ) return false;

		return true;
	}

	/**
	 * Check if the session provided is a valid one or not.
	 *
	 * Returns true if valid and not expired.
	 * If expired, return false and delete it from the database.
	 **/
	this.checkAuth = function(session_cookie, callback)
	{
		if( !self.validate_cookie(session_cookie) ) {
			callback(new Error('Invalid Session Cookie'));
			return;
		}

		var username = session_cookie.data.user;
		
		User.get(
			username,
			function(err,user)
			{
				if(err != null) {
					callback(err);
					return;
				}
				// if user's cookie has expired...
				if(	user.session == null ||
					!self.validate_cookie( user.session.cookie ) ) {

					callback(new Error('Invalid Session Cookie'));
					return;
				}

				if( self.checkExpired(user.session)) {	
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
				if( !self.match_cookie(session_cookie, user.session.cookie) )
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
				callback(err);
			}
		);
	}
};

module.exports = new UserAuth();
