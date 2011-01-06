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

		if (req.method != 'POST') {
				res_obj.error = new Error('Not POST request.');
				res.json(res_obj);
				return;
		}
		else if (req.body == null) {
				res_obj.error = new Error('No POST data.');
				res.json(res_obj);
				return;
		}
		else if (req.body.feed_url == null) {
				res_obj.error = new Error('No feed URL provided.');
				res.json(res_obj);
				return;
		}
		else {
			// STUBBED
			//POST.feed_url = "http://feeds.reuters.com/reuters/companyNews?format=xml";

			// now get the feed teaser
			Ni.library('FeedServer').getFeedTeaser(
				req.body.feed_url,
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
		}
	}
	
	this.teaser_body = function(req, res, next)
	{
		// object to be filled and returned.
		var res_obj = {
			'error': null,
			'teaser_body': ''
		};

		if (req.method != 'POST') {
				res_obj.error = new Error('Not POST request.');
				res.json(res_obj);
				return;
		}
		else if (req.body == null) {
				res_obj.error = new Error('No POST data.');
				res.json(res_obj);
				return;
		}
		else if (req.body.feed_url == null) {
				res_obj.error = new Error('No feed URL provided.');
				res.json(res_obj);
				return;
		}
		else if (req.body.num_feed_items == null) {
				res_obj.error = new Error('No num feed items provided.');
				res.json(res_obj);
				return;
		}
		else if (req.body.title_selection == null) {
				res_obj.error = new Error('No title selection provided.');
				res.json(res_obj);
				return;
		}
		else if (req.body.body_selection == null) {
				res_obj.error = new Error('No body selection provided.');
				res.json(res_obj);
				return;
		}
		else {
			Ni.library('FeedServer').getFeedTeaser(
				req.body.feed_url,
				req.body.num_feed_items,
				function() {},
				function(err, feed)
				{
					if (err) {
						dbg.log('preview error: '+err.message);
						res_obj.error = err;
						res.json(res_obj);
						return;
					}
					
					feed.num_feed_items  = req.body.num_feed_items;
					feed.title_selection = req.body.title_selection;
					feed.body_selection  = req.body.body_selection;
					
					var teaser_body = Ni.library('Templater').getFeedTeaserBody(
						{feed: feed}
					);

					res_obj.teaser_body = teaser_body;
					res.json(res_obj);
					dbg.log('teaser sent');
				}
			);
		}
	}
	
	this.webpage = function(req, res, next)
	{
		// object to be filled and returned.
		var res_obj = {
			'error': null,
			'page': ''
		};

		if (req.method != 'POST') {
				res_obj.error = new Error('Not POST request.');
				res.json(res_obj);
				return;
		}
		else if (req.body == null) {
				res_obj.error = new Error('No POST data.');
				res.json(res_obj);
				return;
		}
		else if (req.body.webpage_url == null) {
				res_obj.error = new Error('No webpage URL provided.');
				res.json(res_obj);
				return;
		}
		else {
			// STUBBED
			//POST.webpage_url = "http://www.futilitycloset.com/2010/12/31/mail-snail/";

			// now get the full page
			dbg.log('accessing library for full page...');
			Ni.library('FeedServer').getFullContent(
				req.body.webpage_url,
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
		}
	}
};

/*
 *  Exports the feed controller
 */
module.exports = new FeedController();
