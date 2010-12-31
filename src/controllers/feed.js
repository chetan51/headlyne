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

	// temporary location for function -- should be globally usable!!
	function getPOST(req, callback)
	{
		var returned = false;
		if( req.method == 'POST') {
			req.addListener('data', function(chunk)
			{
				try{
					POST = querystring.parse(chunk);
				} catch(e) {
					returned = true;
					callback(e);
				}
			});
			req.addListener('end', function()
			{
				if(!returned)
					callback(null, POST);
			});
		} else callback(new Error('No POST data'));
	}

	this.preview = function(req, res, next)
	{
		// object to be filled and returned.
		var res_obj = {
			'error': null,
			'preview': ''
		};

		// get POST variables, then proceed.
		getPOST(req, function(err, POST)
		{
			// check if there are any errors...
			if(err) {
				res_obj.error = err;
				res.ok(res_obj);
				return;
			}
			
			if(typeof(POST.feed_url) == 'undefined') {
				res_obj.error = new Error('No feed provided');
				res.ok(res_obj);
				return;
			}
		
			// STUBBED
			POST.feed_url = "http://feeds.reuters.com/reuters/companyNews?format=xml";

			// now get the feed teaser
			Ni.library('FeedServer').getFeedTeaser(
				POST.feed_url,
				1,
				function() {},
				function(err, teaser)
				{
					if (err) {
						res_obj.error = err;
						res.ok(res_obj);
						return;
					}
					
					// render the preview and return it.
					var preview = jade.render(
						Ni.view('preview').template,
						{locals: teaser}
					);

					res_obj.preview = preview;
					res.ok(res_obj);
				}
			);
		});
	}
};

/*
 *  Exports the feed controller
 */
module.exports = new FeedController();
