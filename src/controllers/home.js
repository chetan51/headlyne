/*
 *  HomeController - a controller to be used with Ni that is called by
 *  the router when a user visits the root URL, /.
 *
 *  When the root URL, /, is loaded, the index function below is called.
 */

/*
 *  Module dependencies
 */

var Ni = require('ni');
var sys = require('sys');
var Mu = require('Mu');
var jade = require('jade');

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
			console.log(cookie);
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
				if(err) throw err;
				if(!is_valid) {
					res.writeHead(302, [
						['Location', '/login']
					]); // redirect to login page.
					res.end();
				} else {
					// if valid, serve the page requested.
		Ni.library('FeedServer').getFeedTeaser(
			'http://feeds.reuters.com/reuters/worldNews?format=xml',
			3,
			function(err, f) {},
			function(err, feed1) {
				if (err) throw err;
				
				Ni.library('FeedServer').getFeedTeaser(
					'http://feeds.reuters.com/reuters/companyNews?format=xml',
					3,
					function(err, f) {},
					function(err, feed2) {
						feed1.title_selection = "item";
						feed1.body_selection = "item";
						
						feed2.title_selection = "webpage";
						feed2.body_selection = "webpage";

						var teaser1 = jade.render(
							Ni.view('feed').template,
							{locals: feed1}
						);
						
						var teaser2 = jade.render(
							Ni.view('feed').template,
							{locals: feed2}
						);
						
						var columns = [];
						columns[0] = {};
						columns[0].feeds = [];
						columns[0].feeds[0] = teaser1;
						
						columns[1] = {};
						columns[1].feeds = [];
						columns[1].feeds[0] = teaser2;
						
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
								title    : "Welcome to Headlyne",
								content  : page
								}
							}
						);

						res.ok(html);
					}
				);
			}
		);
				}
			}
		);
	}

};

/*
 *  Exports the home controller
 */

module.exports = new HomeController();
