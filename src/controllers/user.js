/*
 *  UserController - a controller that handles all user-related requests.
 */

/*
 *  Module dependencies
 */
var Ni   = require('ni');
var sys  = require('sys');
var jade = require('jade');
var Step = require('step');
var qs   = require('querystring');

/*
 *  The user controller
 */
var UserController = function()
{
	this.index = function index(req, res, next)
	{
		dbg.called();
		
		res.error("No operation selected.");
	}
	
	this.edit = function edit(req, res, next)
	{
		dbg.called();
		
		var res_obj = {
			'error': null,
			'success': false
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
		else if ( req.body.feed_url          == null ||
		          req.body.num_feed_items    == null ||
			    req.body.title_selection == null ||
			    req.body.body_selection  == null ||
			    req.body.item_state      == null ) {
				res_obj.error = new Error('POST variables not found.');
				res.json(res_obj);
				return;
		}
		else {
			// now, check if the cookie is valid.
//			var cookie={}; cookie.data={}; cookie.data.user = 'username';
			Ni.helper('cookies').checkCookie(req, res,
				function editUserFeed(err, cookie)
				{
					dbg.called();
		
					if(err) {
						res_obj.error = err;
						res.json(res_obj);
						return;
					}

					//convert item_state from string to json.

					var item_state = [];
					try{
						item_state = JSON.parse(req.body.item_state);
					} catch(e) {
						res_obj.error = new Error('Item state invalid');
						res.json(res_obj);
						return;
					}
					
					// do the actual editing!
					Ni.model('User').editFeed(
						cookie.data.user,
						req.body.feed_url,
						req.body.num_feed_items,
						req.body.title_selection,
						req.body.body_selection,
						item_state,
						function sendResponse(err, feeds)
						{
							dbg.called();
		
							if(err) {
								res_obj.error = err;
								res.json(res_obj);
								return;
							}
							
							// return success = true
							res_obj.success = true;
							res.json(res_obj);
						}
					);
				}
			);
		}
	}
	
	this.update = function update(req, res, next)
	{
		dbg.called();
		
		var res_obj = {
			'error': null,
			'success': false
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
		else if (req.body.feed_array == null) {
				res_obj.error = new Error('No feed array provided.');
				res.json(res_obj);
				return;
		}
		else {
			// now check cookie
			Ni.helper('cookies').checkCookie(req, res,
				function updateUserFeed(err, cookie)
				{
					dbg.called();
		
					if(err) {
						res_obj.error = err;
						res.json(res_obj);
						return;
					}
					var feed_array = [];
					try{
						feed_array = JSON.parse(req.body.feed_array);
					} catch(e) {
						res_obj.error = new Error('Feed Array invalid');
						res.json(res_obj);
						return;
					}
					
					Ni.model('User').updateFeeds(
						cookie.data.user,
						feed_array,
						function sendResponse(err, feeds)
						{
							dbg.called();
		
							if(err) {
								res_obj.error = err;
								res.json(res_obj);
								return;
							}
							
							// return success = true
							res_obj.success = true;
							res.json(res_obj);
						}
					);
				}
			);
		}
	}

	this.remove = function remove(req, res, next)
	{
		dbg.called();
		
		var res_obj = {
			'error': null,
			'success': false
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
			// now get cookie
			Ni.helper('cookies').checkCookie(req, res,
				function removeUserFeed(err, cookie)
				{
					dbg.called();
		
					if(err) {
						res_obj.error = err;
						res.json(res_obj);
						return;
					}
					
					Ni.model('User').removeFeed(
						cookie.data.user,
						req.body.feed_url,
						function returnResponse(err, feeds)
						{
							dbg.called();
		
							if(err) {
								res_obj.error = err;
								res.json(res_obj);
								return;
							}
							
							// return success = true
							res_obj.success = true;
							res.json(res_obj);
						}
					);
				}
			);
		}
	}

	this.teaser = function teaser(req, res, next)
	{
		dbg.called();
		
		var res_obj = {
			'error': null,
			'teaser': ''
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
			// now check cookie
			Ni.helper('cookies').checkCookie(req, res,
				function getTeaserForUser(err, cookie)
				{
					dbg.called();
		
					if(err) {
						res_obj.error = err;
						res.json(res_obj);
						return;
					}
					
					Ni.library('UserHandler').createTeaser(
						cookie,
						res.body.feed_url,
						function sendResponse(err, teaser)
						{
							dbg.called();
		
							if(err) {
								res_obj.error = err;
								res.json(res_obj);
								return;
							}

							// return teaser
							res_obj.teaser = escape(teaser);
							res.json(res_obj);
						}
					);
				}
			);
		}
	}
};

/*
 *  Exports the user controller
 */
module.exports = new UserController();
