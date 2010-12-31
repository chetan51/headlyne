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
var url = require('url');

/*
 *  The home controller
 */

var FeedController = function() {

	this.index = function(req, res, next) {
		res.error("No feed selected.");
	}
	
	this.preview = function(req, res, next) {
		var query = url.parse(req.url, true).query;
		if (typeof(query) == "undefined") {
			res.error("No feed URL provided.");
		}
		else {
			var feed_url = query.url;
			if (typeof(feed_url) == "undefined") {
				res.error("No feed URL provided.");
			}
			else {
				Ni.library('FeedServer').getFeedTeaser(
					feed_url,
					1,
					function() {},
					function(err, teaser) {
						if (err) {
							res.error("Unable to retrieve feed preview.");
						}
						else {
							var preview = jade.render(
								Ni.view('preview').template,
								{locals: teaser}
							);

							res.ok(preview);
						}
					}
				);
			}
		}
	}

};

/*
 *  Exports the home controller
 */

module.exports = new FeedController();
