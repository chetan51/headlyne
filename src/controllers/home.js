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
				self._loadHomePage(
					false,
					null,
					function(err, html) {
						if (err) throw err;

						res.ok(html);
					}
				);
			} else {
				logged_in = true;
				
				Ni.model('User').get(
					cookie.data.user,
					function(err, user) {
						if (err) throw err;
						else {
							name = user.first_name + " " + user.last_name;
							console.log(user.feeds);
							
							self._loadHomePage(
								true,
								name,
								function(err, html) {
									if (err) throw err;

									res.ok(html);
								}
							);
						}
					}
				);
			}
		});
	}
	
	this._loadHomePage = function(logged_in, name, callback)
	{
		Step(
			function getFeeds() {
				Ni.library('FeedServer').getFeedTeaser(
					'http://feeds.feedburner.com/quotationspage/qotd',
					9,
					function() {},
					this.parallel()
				);
				
				Ni.library('FeedServer').getFeedTeaser(
					'http://feeds.reuters.com/reuters/companyNews?format=xml',
					4,
					function() {},
					this.parallel()
				);
				
				Ni.library('FeedServer').getFeedTeaser(
					'http://feeds.reuters.com/reuters/entertainment',
					//'http://xkcd.com/rss.xml',
					4,
					function() {},
					this.parallel()
				);
				
				Ni.library('FeedServer').getFeedTeaser(
					'http://feeds.feedburner.com/FutilityCloset',
					2,
					function() {},
					this.parallel()
				);
			},

			function displayFeeds(err, feed1, feed2, feed3, feed4) {
				if (err) {
					callback(err);
				}
				else {
					feed1.num_feed_items = 9;
					feed1.title_selection = "item";
					feed1.body_selection = "item";
					
					feed2.num_feed_items = 4;
					feed2.title_selection = "item";
					feed2.body_selection = "webpage";

					feed3.num_feed_items = 4;
					feed3.title_selection = "item";
					feed3.body_selection = "item";
					
					feed4.num_feed_items = 2;
					feed4.title_selection = "item";
					feed4.body_selection = "webpage";
					
					var teaser1 = jade.render(
						Ni.view('feed').template,
						{locals: feed1}
					);
					
					var teaser2 = jade.render(
						Ni.view('feed').template,
						{locals: feed2}
					);
					
					var teaser3 = jade.render(
						Ni.view('feed').template,
						{locals: feed3}
					);
					
					var teaser4 = jade.render(
						Ni.view('feed').template,
						{locals: feed4}
					);
					
					var columns = [];
					columns[0] = {};
					columns[0].feeds = [];
					columns[0].feeds[0] = teaser1;
					
					columns[1] = {};
					columns[1].feeds = [];
					columns[1].feeds[0] = teaser2;
					
					columns[2] = {};
					columns[2].feeds = [];
					columns[2].feeds[0] = teaser4;
					columns[2].feeds[1] = teaser3;
					
					var view_parameters = {};
					view_parameters.feed_map = columns;
					view_parameters.name = name;

					var home = Ni.library('Templater').getHomePage(
						view_parameters,
						logged_in
					);
					
					callback(null, home);
				}
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
				dbg.log('redirect: logout to home.');
				dbg.log(err.message);
				
				res.clearCookie('cookie');
				res.moved('/');
			} else {
				dbg.log(cookie.data);
				Ni.library('UserAuth').invalidate(
					cookie.data.user,
					function(err)
					{
						// no errors -- attach a null cookie, direct to
						// login page, and get moving.
						res.clearCookie('cookie');
						res.moved('/');
						dbg.log('redirect: logout to home.');
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
