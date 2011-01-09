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
var cookie_node = require('cookie');

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
						var page = jade.render(
							Ni.view('page').template,
							{locals:
								{
								columns: columns
								}
							}
						);
						
						var html = jade.render(
							Ni.view('base').template,
							{locals:
								{
									base_url : "/",
									title    : cookie.data.user,
									content  : page
								}
							}
						);
						res.ok(html);
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
								
								var teaser_html = jade.render(
									Ni.view('feed').template,
									{locals:teaser}
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
				var page = jade.render(
					Ni.view('page').template,
					{locals:
						{
						columns: columns
						}
					}
				);
				
				var html = jade.render(
					Ni.view('base').template,
					{locals:
						{
							base_url : "/",
							title    : "Headlyne",
							content  : page
						}
					}
				);
				res.ok(html);
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

};

/*
 *  Exports the home controller
 */

module.exports = new HomeController();
