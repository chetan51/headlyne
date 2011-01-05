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
var Templater = require('../../src/libraries/Templater.js');
var sys  = require('sys');
var jade = require('jade');
var Step = require('step');
var dbg  = require('../../src/libraries/Debugger.js');
var Util = require('../../src/utilities/Util.js');
var cookie_node = require('cookie');

/*
 *  The home controller
 */
var HomeController = function()
{
	this.index = function(req, res, next)
	{
		Util.checkCookie(req, res, function(err, cookie)
		{
			if( err ) {
				dbg.log('redirect: home to logout: '+err.message);
				res.writeHead(302, [
					['Location', '/home/logout']
				]); // redirect to login page.
				res.end();
			} else {
				// if valid, serve the page requested.
		
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
					2,
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
				feed1.title_selection = "item";
				feed1.body_selection = "item";
				
				feed2.title_selection = "webpage";
				feed2.body_selection = "webpage";

				feed3.title_selection = "item";
				feed3.body_selection = "item";
				
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
				columns[2].feeds[0] = teaser3;
				columns[2].feeds[1] = teaser4;
				
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
		); // close Step

			}
		}); // close checkCookie
	}
	
	this.login = function(req, res, next) {
		var login_view_parameters = {};
		
		if(req.method == 'POST' && req.body) {
			// Check login
			var params = req.body;
			
			if(params.username == null || params.username == "") {
				login_view_parameters.error_message = "Please enter your username.";
				
				Templater.getLoginPage(
					login_view_parameters,
					function(err, html) {
						if (err) throw err;
						res.ok(html);
					}
				);
			}
			else if (params.password == null || params.password == "") {
				login_view_parameters.username = params.username;
				login_view_parameters.error_message = "Please enter your password.";
				
				Templater.getLoginPage(
					login_view_parameters,
					function(err, html) {
						if (err) throw err;
						res.ok(html);
					}
				);
			} else {
				Ni.library('UserAuth').authenticate(
					params.username,
					params.password,
					function(err, is_new, cookie)
					{
						if(err != null) {
							login_view_parameters.username = params.username;
							
							if( err.message == 'No such User' ||
							    err.message == 'Invalid Password' )
							{
								login_view_parameters.error_message = "Invalid username or password.";
							} else {
								login_view_parameters.error_message = "Uh oh, something went wrong. Please try again.";
							}
		
							Templater.getLoginPage(
								login_view_parameters,
								function(err, html) {
									if (err) throw err;
									res.ok(html);
								}
							);
						} else {
							// no errors -- attach the cookie, direct to
							// home page, and get moving.
							
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
				);
			}
		}
		else {
			Templater.getLoginPage(
				login_view_parameters,
				function(err, html) {
					if (err) throw err;
					res.ok(html);
				}
			);
		}		
	}
	
	this.logout = function(req, res, next) {
		Util.checkCookie(req, res, function(err, cookie)
		{
			if( err ) {
				dbg.log('redirect: logout to login:');
				dbg.log(err.message);
				
				res.clearCookie('cookie');
				res.moved('/home/login');
			} else {
				dbg.log(cookie.data);
				Ni.library('UserAuth').invalidate(
						cookie.data.user,
						function(err)
						{
							// no errors -- attach a null cookie, direct to
							// login page, and get moving.
							res.clearCookie('cookie');
							res.moved('/home/login');
							dbg.log('redirect: logout to login.');
						}
				);
			}
		});
	}
	
	this.signup = function(req, res, next) {
		var signup = jade.render(
			Ni.view('signup').template,
			{locals:
				{
					base_url : "/",
				}
			}
		);
		
		var html = jade.render(
			Ni.view('base').template,
			{locals:
				{
					base_url : "/",
					title    : "Sign Up",
					content  : signup
				}
			}
		);

		res.ok(html);
	}

};

/*
 *  Exports the home controller
 */

module.exports = new HomeController();
