/*
 *  HomeController - a controller to be used with Ni that is called by
 *  the router when a user visits the root URL, /.
 *
 *  When the root URL, /, is loaded, the index function below is called.
 */

/*
 *  Module dependencies
 */

var Ni   = require('ni');
var sys  = require('sys');
var Quip = require('quip');
var jade = require('jade');
var jade = require('jade');
var Step = require('step');
var dbg  = require('../../src/libraries/Debugger.js');

/*
 *  The home controller
 */
var HomeController = function()
{
	var self = this;

	this.index = function(req, res, next)
	{
		Ni.helper('cookies').checkCookie(req, res, function(err, cookie)
		{
			if( err ) {
				dbg.log('redirect: home to logout');
				res.moved('/home/logout');
			} else {
				// if valid, serve the page requested.
				var global_user, global_feed_array=[];
				Step(
					function getUser()
					{
						dbg.log('getUser '+cookie.data.user);
						Ni.model('User').get(
							cookie.data.user,
							this
						);
					},
					function STUBuser(err, user)
					{
						global_user = user;
						dbg.log(global_user.feeds);
					/*
						var new_feeds = [
							[
								{
									url: 'http://feeds.feedburner.com/quotationspage/qotd',
									num_feed_items: 9,
									body_selection: 'item',
									title_selection: 'item'
								}
							],
							[
								{
									url: 'http://feeds.reuters.com/reuters/companyNews?format=xml',
									num_feed_items: 2,
									body_selection: 'webpage',
									title_selection: 'webpage'
								},
								{
									url: 'http://feeds.reuters.com/reuters/entertainment',
									num_feed_items: 2,
									body_selection: 'item',
									title_selection: 'webpage'
								},
							],
							[
								{
									url: 'http://feeds.feedburner.com/FutilityCloset',
									num_feed_items: 3,
									body_selection: 'webpage',
									title_selection: 'item'
								}
							]
						];
						global_user.feeds = new_feeds;
						Ni.model('User').updateFeeds(
							cookie.data.user,
							new_feeds,
							this
						);
					},
					function getTeasers(err, feed_array)
					{*/
						dbg.log('get teasers for '+JSON.stringify(global_user));
						if (err) throw err;
						
						var count=0, done_count=0;
						for(i in global_user.feeds) {
							for(j in global_user.feeds[i]) {
								global_feed_array[i] = [];
								count = count + 1;
							}
						}

						var _this = this;
						global_user.feeds.forEach(function(feeds_i, i) {
							feeds_i.forEach(function(feeds_j, j) {
								Ni.library('UserHandler').createTeaser(
									cookie,
									feeds_j.url,
									function(err, teaser)
									{
										done_count = done_count + 1;
										global_feed_array[i][j] = teaser;
										
										if( done_count == count ) {
											_this();
										}
									}
								);
							});
						});
						
						if(!count)
						{
							throw new Error('No feeds saved!');
						}
					},
					function(err, teasers)
					{
						dbg.log('got all teasers. Err: '+err);
						var columns = [];
						columns[0] = {};

						if(!err) {
							// fill columns variable
							for( i in global_feed_array) {
								columns[i] = {};
								columns[i].feeds = global_feed_array[i];
							}
						}

						// return teasers
						var home = Ni.library('Templater').getHomePage(
							{
								feed_map: columns,
								name    : cookie.data.user,
							},
							true
						);
						
						res.ok(home);
					}
				);
			}
		}); // close checkCookie
	}

	this.sample = function(req, res, next)
	{
		var global_user={}, global_feed_array=[];
		Step(
			function STUBuser()
			{
				var new_feeds = [
					[
						{
							url: 'http://feeds.feedburner.com/quotationspage/qotd',
							num_feed_items: 9,
							body_selection: 'item',
							title_selection: 'item'
						}
					],
					[
						{
							url: 'http://feeds.reuters.com/reuters/companyNews?format=xml',
							num_feed_items: 2,
							body_selection: 'webpage',
							title_selection: 'webpage'
						},
						{
							url: 'http://feeds.reuters.com/reuters/entertainment',
							num_feed_items: 2,
							body_selection: 'item',
							title_selection: 'webpage'
						},
					],
					[
						{
							url: 'http://feeds.feedburner.com/FutilityCloset',
							num_feed_items: 3,
							body_selection: 'webpage',
							title_selection: 'item'
						}
					]
				];
				global_user.feeds = new_feeds;
				return new_feeds;
			},
			function getTeasers(err, feed_array)
			{
				dbg.log('getting teasers');
				if (err) throw err;
				
				var count=0, done_count=0;
				for(i in global_user.feeds) {
					for(j in global_user.feeds[i]) {
						global_feed_array[i] = [];
						count = count + 1;
					}
				}
				
				var _this = this;
				global_user.feeds.forEach(function(feeds_i, i) {
					feeds_i.forEach(function(feeds_j, j) {
						Ni.library('FeedServer').getFeedTeaser(
							feeds_j.url,
							feeds_j.num_feed_items,
							function(){},
							function(err, teaser)
							{
								for( keys in global_user.feeds[i][j] )
								{
									teaser[keys] = global_user.feeds[i][j][keys];
								}
								
								var teaser_html = Ni.library('Templater').getFeedTeaser(
									{feed: teaser}
								);

								done_count = done_count + 1;
								global_feed_array[i][j] = teaser_html;

								if( done_count == count ) {
									_this();
								}
							}
						);
					});
				});
				if(!count)
				{
					throw new Error('No feeds saved!');
				}
			},
			function sendResponse(err, teasers)
			{
				dbg.log('got all teasers. Err: '+err);
				var columns = [];
				columns[0] = {};
				
				if(!err) {
					// fill columns variable
					for( i in global_feed_array) {
						columns[i] = {};
						columns[i].feeds = global_feed_array[i];
					}
				}
				
				// return teasers
				var home = Ni.library('Templater').getHomePage(
					{feed_map: columns},
					false
				);
				
				res.ok(home);
			}
		);
	}
	
	this.login = function(req, res, next) {
		var view_parameters = {};
		
		if(req.method == 'POST' && req.body) {
			// Check login
			var params = req.body;
			view_parameters = params;
			
			Ni.library('UserHandler').login(
				params,
				function(err, logged_in, error_message, cookie) {
					if (err) {
						view_parameters.error_message = "Uh oh, something went wrong. Please try again.";
						
						var html = Ni.library('Templater').getLoginPage(
							view_parameters
						);
						res.ok(html);
					}
					else {
						if (!logged_in) {
							view_parameters.error_message = error_message;
							
							var html = Ni.library('Templater').getLoginPage(
								view_parameters
							);
							res.ok(html);
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
							dbg.log('redirect: login to home, logged in');
						}
					}
				}
			);
		}
		else {
			var html = Ni.library('Templater').getLoginPage(
				view_parameters
			);
			res.ok(html);
		}		
	}
	
	this.logout = function(req, res, next) {
		Ni.helper('cookies').checkCookie(req, res, function(err, cookie)
		{
			if( err ) {
				dbg.log('redirect: logout to sample:');
				dbg.log(err.message);
				
				res.clearCookie('cookie');
				res.moved('/home/sample');
			} else {
				dbg.log(cookie.data);
				Ni.library('UserAuth').invalidate(
					cookie.data.user,
					function(err)
					{
						// no errors -- attach a null cookie, direct to
						// login page, and get moving.
						res.clearCookie('cookie');
						res.moved('/home/sample');
						dbg.log('redirect: logout to sample.');
					}
				);
			}
		});
	}
	
	this.signup = function(req, res, next) {
		var view_parameters = {};
		
		if(req.method == 'POST' && req.body) {
			// Check sign up
			var params = req.body;
			view_parameters = params;
			
			Ni.library('UserHandler').signup(
				params,
				function(err, signed_up, error_message) {
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
	
	this.register = function(req, res, next) {
		var view_parameters = {};
		
		if(req.method == 'POST' && req.body) {
			// Check sign up
			var params = req.body, param_error=false;
			view_parameters = params;
		
			if (params.username == null || params.username == "") {
				view_parameters.error_message = "Please enter a username."; param_error=true;
			}
			else if (params.invite_code == null || params.invite_code == "") {
				view_parameters.error_message = "Please enter your Invite Code."; param_error=true;
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

			if(param_error) {
				var html = Ni.library('Templater').getRegistrationPage(
					view_parameters
				);
				res.ok(html);
			} else {
				Step(
					function checkCode()
					{
						Ni.model('Invites').exists(
							params.invite_code,
							this
						);
					},
					function addUser(err, is_valid)
					{
						if(err) throw err;
						if(!is_valid) {
							dbg.log('invalid code');
							throw new Error('Invalid Invite Code.');
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
						if(err != null) {
							throw err;
						} else {
							return true;
						}
					},
					function finish(err, completed)
					{
						if(err) {
							if( err.message == "Database match exists" ) {
								view_parameters.error_message = 'That username is already taken!';
							} else if( err.message == "Invalid Invite Code.") {
								view_parameters.error_message = err.message;
							} else {
								view_parameters.error_message = "Uh oh, something went wrong. Please try again.";
							}
							var html = Ni.library('Templater').getRegistrationPage(
								view_parameters
							);
							res.ok(html);
							return;
						} else {
							
							// first, remove the invite code.
							Ni.model('Invites').remove(
								params.invite_code,
								function(err){}
							);
							
							// add default feeds for the user.
							var new_feeds = [
								[
									{
										url: 'http://feeds.feedburner.com/quotationspage/qotd',
										num_feed_items: 9,
										body_selection: 'item',
										title_selection: 'item'
									}
								],
								[
									{
										url: 'http://feeds.reuters.com/reuters/companyNews?format=xml',
										num_feed_items: 2,
										body_selection: 'webpage',
										title_selection: 'webpage'
									},
									{
										url: 'http://feeds.reuters.com/reuters/entertainment',
										num_feed_items: 2,
										body_selection: 'item',
										title_selection: 'webpage'
									},
								],
								[
									{
										url: 'http://feeds.feedburner.com/FutilityCloset',
										num_feed_items: 3,
										body_selection: 'webpage',
										title_selection: 'item'
									}
								]
							];

							Ni.model('User').updateFeeds(
								params.username,
								new_feeds,
								function(err)
								{
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
			var html = Ni.library('Templater').getRegistrationPage(
				view_parameters
			);
			res.ok(html);
		}
	}
};

/*
 *  Exports the home controller
 */

module.exports = new HomeController();
