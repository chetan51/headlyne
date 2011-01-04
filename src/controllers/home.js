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

/*
 *  The home controller
 */
var HomeController = function()
{
	this.index = function(req, res, next)
	{
		// if no cookies are passed, redirect to login.
		if( typeof(req.headers.cookie) == 'undefined' )
		{
			dbg.log('redirect: home to login, no cookie');
			res.writeHead(302, [
				['Location', '/login']
			]);
			res.end();
			return;
		}
		// check if the cookie is a JSON object. otherwise, say cookie error.
		var cookie;
		try {
			cookie = JSON.parse(req.headers.cookie);
			dbg.log(cookie);
		} catch (e) {
			res.error('Your cookie is broken. Please clear cookies '+
				'for this site and try again');
			return;
		}

		// check if the cookie is valid.
		Ni.library('UserAuth').checkAuth(
			cookie,
			function(err, is_valid)
			{
				if(err) {
					dbg.log(err.message);
					res.writeHead(302, [
						['Location', '/logout'],
					]);
					res.end();
					return;
				}
				if(!is_valid) {
					dbg.log('redirect: home to logout, non-valid cookie');
					res.writeHead(302, [
						['Location', '/logout']
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
		);
				}
			}
		);
	}
	
	this.login = function(req, res, next) {
		var login = jade.render(
			Ni.view('login').template,
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
					title    : "Login",
					content  : login
				}
			}
		);

		res.ok(html);
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
