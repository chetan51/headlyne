/*
 *  FeedController - a controller that handles all feed-related requests.
 */

/*
 *  Module dependencies
 */
var Ni = require('ni');
var http = require('http');
var sys = require('sys');
var jade = require('jade');
var Step = require('step');
var url = require('url');
var Util = require('../utilities/Util');
var dbg = require('../libraries/Debugger');

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
		// object to be filled and returned.
		var res_obj = {
			'error': null,
			'preview': ''
		};

		// get POST variables, then proceed.
		Util.getPOST(req, function(err, POST)
		{
			// check if there are any errors...
			if(err) {
				res_obj.error = err;
				res.json(res_obj);
				return;
			}
			
			if(typeof(POST.feed_url) == 'undefined') {
				res_obj.error = new Error('No feed URL provided.');
				res.json(res_obj);
				return;
			}
		
			// STUBBED
			//POST.feed_url = "http://feeds.reuters.com/reuters/companyNews?format=xml";

			// now get the feed teaser
			Ni.library('FeedServer').getFeedTeaser(
				POST.feed_url,
				1,
				function() {},
				function(err, teaser)
				{
					if (err) {
						dbg.log('preview error: '+err.message);
						res_obj.error = err;
						res.json(res_obj);
						return;
					}
					
					// render the preview and return it.
					var preview = jade.render(
						Ni.view('preview').template,
						{locals: teaser}
					);

					res_obj.preview = preview;
					res.json(res_obj);
					dbg.log('preview sent');
				}
			);
		});
	}
	
	this.getWebPage = function(req, res, next)
	{
		// object to be filled and returned.
		var res_obj = {
			'error': null,
			'page': ''
		};

		// get POST variables, then proceed.
		Util.getPOST(req, function(err, POST)
		{
			// check if there are any errors...
			if(err) {
				res_obj.error = err;
				res.json(res_obj);
				return;
			}
			
			if(typeof(POST.webpage_url) == 'undefined') {
				res_obj.error = new Error('No feed provided');
				res.json(res_obj);
				return;
			}
		
			// STUBBED
			//POST.webpage_url = "http://www.futilitycloset.com/2010/12/31/mail-snail/";

			// now get the full page
			dbg.log('accessing library for full page...');
			Ni.library('FeedServer').getFullContent(
				POST.webpage_url,
				function(err, webpage)
				{
					if(err) {
						dbg.log('Error occured: '+err.message);
						res_obj.error = err;
						res.json(res_obj);
						return;
					}

					// render the preview and return it.
					var page = jade.render(
						Ni.view('webpage').template,
						{locals: webpage}
					);

					res_obj.page = page;
					dbg.log('Page served'+res_obj);
					res.json(res_obj);
				}
			);
		});
	}
};

/*
 *  Exports the feed controller
 */
module.exports = new FeedController();
