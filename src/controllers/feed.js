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
	this.index = function index(req, res, next)
	{
		dbg.called();
		
		res.error("No feed selected.");
	}

	this.preview = function preview(req, res, next)
	{
		dbg.called();
		
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
				function renderPreviewView(err, teaser)
				{
					dbg.called();
		
					if (err) {
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
				}
			);
		}
	}
	
	this.teaser_body = function teaser_body(req, res, next)
	{
		dbg.called();
		
		// object to be filled and returned.
		var res_obj = {
			'error': null,
			'feed_title': '',
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
				function renderTeaserView(err, feed)
				{
					dbg.called();
		
					if (err) {
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

					res_obj.feed_title  = feed.title;
					res_obj.teaser_body = teaser_body;
					res.json(res_obj);
				}
			);
		}
	}
	
	this.webpage = function webpage(req, res, next)
	{
		dbg.called();
		
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
			Ni.library('FeedServer').getFullContent(
				req.body.webpage_url,
				function renderFullPageView(err, webpage)
				{
					dbg.called();
		
					if(err || !webpage) {
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
