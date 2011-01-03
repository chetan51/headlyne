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

		Util.checkCookie(req, res,
			function(err, cookie)
			{
				if(err) {
					console.log(err.message);
					res_obj.error = err;
					res.json(res_obj);
					return;
				}
				
				// if valid, get POST variable
				Util.getPOST(req, function(err, POST)
				{
					if(err) {
						console.log(err.message);
						res_obj.error = err;
						res.json(res_obj);
						return;
					}
					if(	typeof(POST.feed_url)        == 'undefined' ||
						typeof(POST.num_feed_items)  == 'undefined' ||
						typeof(POST.title_selection)  == 'undefined' ||
						typeof(POST.body_selection)  == 'undefined' ) {

						res_obj.error = new Error('POST variables not found.');
						res.json(res_obj);
						return;
					}
					
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
								res.json(res_obj);
								return;
							}
							
							// return success = true
							res_obj.success = true;
							res.json(res_obj);
						}
					);
				});
			}
		);
	}
	
	this.sort = function(req, res, next)
	{
		var res_obj = {
			'error': null,
			'success': false
		};

		Util.checkCookie(req, res,
			function(err, cookie)
			{
				if(err) {
					console.log(err.message);
					res_obj.error = err;
					res.json(res_obj);
					return;
				}
				
				// if valid, get POST variable
				Util.getPOST(req, function(err, POST)
				{
					if(err) {
						console.log(err.message);
						res_obj.error = err;
						res.json(res_obj);
						return;
					}
					if( typeof(POST.feed_array) == 'undefined' ) {
						res_obj.error = new Error('POST variables not found.');
						res.json(res_obj);
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
								res.json(res_obj);
								return;
							}
							
							// return success = true
							res_obj.success = true;
							res.json(res_obj);
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

		Util.checkCookie(req, res,
			function(err, cookie)
			{
				if(err) {
					console.log(err.message);
					res_obj.error = err;
					res.json(res_obj);
					return;
				}
				
				// if valid, get POST variable
				Util.getPOST(req, function(err, POST)
				{
					if(err) {
						console.log(err.message);
						res_obj.error = err;
						res.json(res_obj);
						return;
					}
					if( typeof(POST.feed_url) == 'undefined' ) {
						res_obj.error = new Error('POST variables not found.');
						res.json(res_obj);
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
								res.json(res_obj);
								return;
							}
							
							// return success = true
							res_obj.success = true;
							res.json(res_obj);
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
