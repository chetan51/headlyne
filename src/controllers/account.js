/*
 *  AccountController - handles logging in, signing up and logging out of
 *  user accounts.
 */

/*
 *  Module dependencies
 */

var Ni   = require('ni');
var Step = require('step');
var dbg  = require('../libraries/Debugger.js');

/*
 *  The account controller
 */
var AccountController = function()
{
	var self = this;

	this.index = function index(req, res, next)
	{
		dbg.called();
		
		res.error('Nothing to do.');
	}

	this.login = function login(req, res, next) {
		dbg.called();
		
		var view_parameters = {};
		
		if(req.method != 'POST' || !req.body) {
			// Show login page
			var html = Ni.library('Templater').getLoginPage(
				view_parameters
			);
			
			res.ok(html);
		}
		else {
			// Check login
			var params = req.body;
			view_parameters = params;
			view_parameters.error_message = null;
			
			self._login(
				params,
				function setCookieAndLogin(err, logged_in, error_message, cookie) {
					dbg.called();
		
					if (err) {
						view_parameters.error_message = "Uh oh, something went wrong. Please try again.";
					}
					else {
						if (!logged_in) {
							view_parameters.error_message = error_message;
						}
						else {
							res.setCookie(
								'cookie',
								JSON.stringify(cookie),
								{
									path    : '/',
									expires : cookie.expires
								}
							);
						
							res.moved('/');
						}
					}
					
					if (view_parameters.error_message) {
						var html = Ni.library('Templater').getLoginPage(
							view_parameters
						);
						res.ok(html);
					}
				}
			);
		}
	}
	
	/*
	 *	Helper that validates credentials and authenticates user.
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
	this._login = function _login(params, callback) {
		dbg.called();
		
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
				function checkAuthenticationAttempt(err, is_new, cookie)
				{
					dbg.called();
		
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

	this.logout = function logout(req, res, next) {
		dbg.called();
		
		Ni.helper('cookies').checkCookie(
			req,
			res,
			function clearCookieAndLogout(err, cookie)
			{
				dbg.called();
		
				if( !err ) {
					Ni.library('UserAuth').invalidate(
						cookie.data.user,
						function(err) {}
					);
				}
					
				res.clearCookie('cookie');
				res.moved('/');
			}
		);
	}
	
	/*	Plain sign up, no invite
	 *
	this.signup = function signup(req, res, next) {
		dbg.called();
		
		var view_parameters = {};
		
		if(req.method == 'POST' && req.body) {
			// Check sign up
			var params = req.body;
			view_parameters = params;
			
			self._signup(
				params,
				function checkSignupAttempt(err, signed_up, error_message) {
					dbg.called();
		
					if (err) {
						view_parameters.error_message = "Uh oh, something went wrong. Please try again.";
						
						var html = Ni.library('Templater').getSignupPage(
							view_parameters
						);
						res.ok(html);
					}
					else {
						if (!signed_up) {
							view_parameters.error_message = error_message;
							
							var html = Ni.library('Templater').getSignupPage(
								view_parameters
							);
							res.ok(html);
						}
						else {
							// new user created. login the user and proceed.
							req.body = params;
							self.login(req, res, next);
						}
					}
				}
			);
		}
		else {
			var html = Ni.library('Templater').getSignupPage(
				view_parameters
			);
			res.ok(html);
		}
	}
	*/
	
	/*
	 *	Helper that validates input fields and registers new user.
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
	this._signup = function _signup(params, callback) {
		dbg.called();
		
		if (params.username == null || params.username == "") {
			callback(null, false, "Please enter a username.");
		}
		else if (params.email == null || params.email == "") {
			callback(null, false, "Please enter your email address.");
		}
		else if (params.first_name == null || params.first_name == "") {
			callback(null, false, "Please enter your first name.");
		}
		else if (params.last_name == null || params.last_name == "") {
			callback(null, false, "Please enter your last name.");
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
			Ni.model('User').save(
				params.username,
				params.password,
				params.first_name,
				params.last_name,
				params.email,
				function finishSignup(err, user)
				{
					dbg.called();
		
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
	
	/*
	 *    Invite-based sign up
	 */
	this.signup = function signup(req, res, next) {
		dbg.called();
		
		var view_parameters = {};
		
		if(req.method == 'POST' && req.body) {
			// Check sign up
			var params = req.body, param_error=false;
			view_parameters = params;
		
			if (params.username == null || params.username == "") {
				view_parameters.error_message = "Please enter a username."; param_error=true;
			}
			else if (params.email == null || params.email == "") {
				view_parameters.error_message = "Please enter your email address."; param_error=true;
			}
			else if (params.first_name == null || params.first_name == "") {
				view_parameters.error_message = "Please enter your first name."; param_error=true;
			}
			else if (params.last_name == null || params.last_name == "") {
				view_parameters.error_message = "Please enter your last name."; param_error=true;
			}
			else if (params.password == null || params.password == "") {
				view_parameters.error_message = "Please enter a password."; param_error=true;
			}
			else if (params.confirm_password == null || params.confirm_password == "") {
				view_parameters.error_message = "Please confirm the password."; param_error=true;
			}
			else if (params.password != params.confirm_password) {
				view_parameters.error_message = "Passwords do not match."; param_error=true;
			}
			else if (params.invite_code == null || params.invite_code == "") {
				view_parameters.error_message = "Please enter your invite code."; param_error=true;
			}

			if(param_error) {
				var html = Ni.library('Templater').getSignupPageWithInvite(
					view_parameters
				);
				res.ok(html);
			} else {
				Step(
					function checkCode()
					{
						dbg.called();
		
						Ni.model('Invite').exists(
							params.invite_code,
							this
						);
					},
					function addUser(err, is_valid)
					{
						dbg.called();
		
						if(err) throw err;
						if(!is_valid) {
							throw new Error('Invalid invite code.');
						} else {
							Ni.model('User').save(
								params.username,
								params.password,
								params.first_name,
								params.last_name,
								params.email,
								this
							);
						}
					},
					function checkIfAdded(err, user)
					{
						dbg.called();
		
						if(err != null) {
							throw err;
						} else {
							return true;
						}
					},
					function finish(err, completed)
					{
						dbg.called();
		
						if(err) {
							if( err.message == "Database match exists" ) {
								view_parameters.error_message = 'That username is already taken.';
							} else if( err.message == "Invalid Invite Code.") {
								view_parameters.error_message = err.message;
							} else {
								view_parameters.error_message = "Uh oh, something went wrong. Please try again.";
							}
							var html = Ni.library('Templater').getSignupPageWithInvite(
								view_parameters
							);
							res.ok(html);
							return;
						} else {
							// first, remove the invite code.
							Ni.model('Invite').remove(
								params.invite_code,
								function(err){}
							);
							
							// add default feeds for the user.
							Ni.model('User').updateFeeds(
								params.username,
								Ni.config('default_feeds'),
								function loginUser(err)
								{
									dbg.called();
		
									// new user created. login the user and proceed.
									req.body = params;
									self.login(req, res, next);
								}
							);
							return;
						}
					}
				);
			}
		} else {
			var html = Ni.library('Templater').getSignupPageWithInvite(
				view_parameters
			);
			res.ok(html);
		}
	}

	this.request_invite = function request_invite(req, res, next)
	{
		dbg.called();
		
		var view_parameters = {};
		
		if(req.method == 'POST' && req.body) {
			// Check sign up
			var params = req.body, param_error=false;
			view_parameters = params;
		
			if (params.email == null || params.email == "") {
				view_parameters.error_message = "Please enter your email address."; param_error=true;
			}
			else if (params.first_name == null || params.first_name == "") {
				view_parameters.error_message = "Please enter your first name."; param_error=true;
			}
			else if (params.last_name == null || params.last_name == "") {
				view_parameters.error_message = "Please enter your last name."; param_error=true;
			}

			if(param_error) {
				var html = Ni.library('Templater').getRequestInvites(
					view_parameters
				);
				res.ok(html);
			} else {
				// add the request to the database.
				Ni.model('Invite').request_invite(
					params.email,
					params.first_name,
					params.last_name,
					function checkInviteRequested(err)
					{
						dbg.called();
		
						if(err) {
							view_parameters.error_message = err.message;
							var html = Ni.library('Templater').getRequestInvites(
								view_parameters
							);
							res.ok(html);
						} else {
							// redirect to requested_invites page
							res.moved('/account/invite_requested');
						}
					}
				);
			}
		} else {
			var html = Ni.library('Templater').getRequestInvites(
				view_parameters
			);
			res.ok(html);
		}
	}
	
	this.invite_requested = function invite_requested(req, res, next)
	{
		dbg.called();
		
		var view_parameters = {};
		
		var html = Ni.library('Templater').getInviteRequested(
			view_parameters
		);
		res.ok(html);
	}
};

/*
 *  Exports the account controller
 */

module.exports = new AccountController();
