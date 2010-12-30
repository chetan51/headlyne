/*
 *  FeedController - a controller that handles all feed-related requests.
 */

/*
 *  Module dependencies
 */

var Ni = require('ni');
var sys = require('sys');
var jade = require('jade');
var Step = require('step');
var qs = require('querystring');

/*
 *  The home controller
 */

var FeedController = function() {

	this.index = function(req, res, next) {
		res.error("No feed selected.");
	}
	
	this.preview = function(req, res, next) {
		feed_url = "http://feeds.reuters.com/reuters/companyNews?format=xml";
		if (typeof(feed_url) == "undefined") {
			res.error("No feed URL provided.");
		}
		else {
			Ni.library('FeedServer').getFeedTeaser(
				feed_url,
				1,
				function() {},
				function(err, teaser) {
					if (err) throw err;
					
					var preview = jade.render(
						Ni.view('preview').template,
						{locals: teaser}
					);

					res.ok(preview);
				}
			);
		}
	}

	this.add = function(req, res, next, row, column, feed_url) {
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
				if(err) {
					console.log(err.message);
					res.writeHead(302, [
						['Location', '/logout'],
					]);
					res.end();
					return;
				}
				if(!is_valid) {
					res.writeHead(302, [
						['Location', '/login']
					]); // redirect to login page.
					res.end();
				} else {
					// if valid, serve the page requested.
					
					Ni.model('User').addFeed(
						cookie.data.user,
						feed_url,
						row,
						column,
						function(err, feeds)
						{
							if(err) {
								res.ok({'Error': 'Cannot add feed'});
								console.log('cannot add feed: '+err.message);
							} else {
								res.ok(feeds);
								console.log(feeds);
							}
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

module.exports = new FeedController();
