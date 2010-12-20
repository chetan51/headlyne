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
var Mu = require('mu');
var haml = require('hamljs');
var Connect = require('connect');

/*
 *  The home controller
 */

var HomeController = function()
{
	this.index = function(req, res, next)
	{
		var cookie = JSON.parse(req.headers.cookie).cookie;
		console.log(cookie);
		Ni.library('UserAuth').checkAuth(
			cookie,
			function(err, is_valid)
			{
				if(err) throw err;
				if(!is_valid) {
					res.writeHeader(); // redirect to login page.
					res.end();
				} else {


		Ni.library('FeedServer').getFeedTeaser(
			'http://www.feedforall.com/sample.xml',
			3,
			function(err, feed)
			{
				if (err) throw err;
				var html = haml.render(
					Ni.view('feed_teaser').template,
					{locals: feed}
				);
				
				res.ok(html);
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
