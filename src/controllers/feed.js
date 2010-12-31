/*
 *  FeedController - a controller that handles all feed-related requests.
 */

/*
 *  Module dependencies
 */
var Ni = require('ni');
var sys = require('sys');
var jade = require('jade');
var qs = require('querystring');

/*
 *  The feed controller
 */
var FeedController = function()
{
	this.index = function(req, res, next)
	{
		res.error("No feed selected.");
	}
	
	this.preview = function(req, res, next)
	{
		feed_url = "http://feeds.reuters.com/reuters/companyNews?format=xml";
		if (typeof(feed_url) == "undefined") {
			res.error("No feed URL provided.");
		} else {
			Ni.library('FeedServer').getFeedTeaser(
				feed_url,
				1,
				function() {},
				function(err, teaser)
				{
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
};

/*
 *  Exports the feed controller
 */
module.exports = new FeedController();
