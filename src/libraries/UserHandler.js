/**
 * Dependencies
 **/
var crypto  = require('crypto'),
    User    = require('../models/User'),
    dbg     = require('./Debugger.js');
    Ni      = require('ni');


/**
 *	Provides functions for user handling.
 **/
var UserAuth = function()
{
	/**
	 *	Class variables
	 */
	var self = this;
	
	/*
	 *	Validates credentials and authenticates user.
	 *	
	 *		Arguments: credentials {
	 *		               username,
	 *		               password
	 *		           }
	 *		Returns (via callback): error
	 *		                        logged in?
	 *		                        error message
	 *		                        cookie
	 */
	this.login = function(params, callback) {
		if (params.username == null || params.username == "") {
			callback(null, false, "Please enter your username.");
		}
		else if (params.password == null || params.password == "") {
			callback(null, false, "Please enter your password.");
		}
		else {
			Ni.library('UserAuth').authenticate(
				params.username,
				params.password,
				function(err, is_new, cookie)
				{
					if(err != null) {
						if( err.message == 'No such User' ||
						    err.message == 'Invalid Password' )
						{
							callback(null, false, "Invalid username or password.");
						} else {
							callback(err);
						}
					} else {    // logged in successfully
						callback(null, true, null, cookie);
					}
				}
			);
		}
	}

	/*
	 *	Validates input fields and registers new user.
	 *	
	 *		Arguments: input fields {
	 *		               username,
	 *		               email address,
	 *		               password,
	 *		               confirm password
	 *		           }
	 *		Returns (via callback): error
	 *		                        registered?
	 *		                        error message
	 */
	this.signup = function(params, callback) {
		if (params.username == null || params.username == "") {
			callback(null, false, "Please enter a username.");
		}
		else if (params.email == null || params.email == "") {
			callback(null, false, "Please enter your email address.");
		}
		else if (params.password == null || params.password == "") {
			callback(null, false, "Please enter a password.");
		}
		else if (params.confirm_password == null || params.confirm_password == "") {
			callback(null, false, "Please confirm the password.");
		}
		else if (params.password != params.confirm_password) {
			callback(null, false, "Passwords do not match.");
		}
		else {
			var	username    = params.username,
				password    = params.password,
				first_name  = "",
				last_name   = "",
				email       = "";

			if (params.first_name != 'undefined') first_name = params.first_name;
			if (params.last_name != 'undefined') last_name = params.last_name;
			if (params.email != 'undefined') email = params.email;

			Ni.model('User').save(
				username,
				password,
				first_name,
				last_name,
				email,
				function(err, user)
				{
					if(err != null) {
						if (err.message == "Database match exists") {
							callback(null, false, "That username is taken.");
						}
						else {
							callback(err);
						}
					}
					else {
						callback(null, true);
					}
				}
			);
		}
	}
};

module.exports = new UserAuth();
