/*
 *  UserController - a controller that handles all user-related requests.
 */

/*
 *  Module dependencies
 */
var Ni = require('ni');
var sys = require('sys');
var jade = require('jade');
var qs = require('querystring');
var Util = require('../utilities/Util');

/*
 *  The user controller
 */
var UserController = function()
{
	this.index = function(req, res, next)
	{
		res.error("No operation selected.");
	}
	
	this.edit = function(req, res, next)
	{
		var res_obj = {
			'error': null,
			'success': false
		};

		// get POST variable
		Util.getPOST(req, function(err, POST)
		{
			if(err) {
				console.log(err.message);
				res_obj.error = err;
				res.ok(JSON.stringify(res_obj));
				return;
			}
			if(	typeof(POST.feed_url)        == 'undefined' ||
				typeof(POST.num_feed_items)  == 'undefined' ||
				typeof(POST.title_selection)  == 'undefined' ||
				typeof(POST.body_selection)  == 'undefined' ) {
					res_obj.error = new Error('POST variables not found.');
				res.ok(JSON.stringify(res_obj));
				return;
			}

			// now, check if the cookie is valid.
//			var cookie={}; cookie.data={}; cookie.data.user = 'username';
			Util.checkCookie(req, res,
				function(err, cookie)
				{
					if(err) {
						console.log(err.message);
						res_obj.error = err;
						res.ok(JSON.stringify(res_obj));
						return;
					}
					
					// do the actual editing!
					Ni.model('User').editFeed(
						cookie.data.user,
						POST.feed_url,
						POST.num_feed_items,
						POST.title_selection,
						POST.body_selection,
						function(err, feeds)
						{
							if(err) {
								console.log(err.message);
								res_obj.error = err;
								res.ok(JSON.stringify(res_obj));
								return;
							}
							
							// return success = true
							res_obj.success = true;
							res.ok(JSON.stringify(res_obj));
						}
					);
				}
			);
		});
	}
	
	this.sort = function(req, res, next)
	{
		var res_obj = {
			'error': null,
			'success': false
		};

		// get POST variable
		Util.getPOST(req, function(err, POST)
		{
			if(err) {
				console.log(err.message);
				res_obj.error = err;
				res.ok(JSON.stringify(res_obj));
				return;
			}
			if( typeof(POST.feed_array) == 'undefined' ) {
				res_obj.error = new Error('POST variables not found.');
				res.ok(JSON.stringify(res_obj));
				return;
			}

			// now check cookie
			Util.checkCookie(req, res,
				function(err, cookie)
				{
					if(err) {
						console.log(err.message);
						res_obj.error = err;
						res.ok(JSON.stringify(res_obj));
						return;
					}
					
					Ni.model('User').updateFeeds(
						cookie.data.user,
						POST.feed_array,
						function(err, feeds)
						{
							if(err) {
								console.log(err.message);
								res_obj.error = err;
								res.ok(JSON.stringify(res_obj));
								return;
							}
							
							// return success = true
							res_obj.success = true;
							res.ok(JSON.stringify(res_obj));
						}
					);
				});
			}
		);
	}

	this.remove = function(req, res, next)
	{
		var res_obj = {
			'error': null,
			'success': false
		};

		// get POST variable
		Util.getPOST(req, function(err, POST)
		{
			if(err) {
				console.log(err.message);
				res_obj.error = err;
				res.ok(JSON.stringify(res_obj));
				return;
			}
			if( typeof(POST.feed_url) == 'undefined' ) {
				res_obj.error = new Error('POST variables not found.');
				res.ok(JSON.stringify(res_obj));
				return;
			}

			// now get cookie
			Util.checkCookie(req, res,
				function(err, cookie)
				{
					if(err) {
						console.log(err.message);
						res_obj.error = err;
						res.ok(JSON.stringify(res_obj));
						return;
					}
					
					Ni.model('User').removeFeed(
						cookie.data.user,
						POST.feed_url,
						function(err, feeds)
						{
							if(err) {
								console.log(err.message);
								res_obj.error = err;
								res.ok(JSON.stringify(res_obj));
								return;
							}
							
							// return success = true
							res_obj.success = true;
							res.ok(JSON.stringify(res_obj));
						}
					);
				});
			}
		);
	}
};

/*
 *  Exports the user controller
 */
module.exports = new UserController();
