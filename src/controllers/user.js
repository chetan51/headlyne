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

/*
 *  The user controller
 */
var UserController = function()
{
	this.index = function(req, res, next)
	{
		res.error("No operation selected.");
	}
	
	// temporary location for functions -- should be globally usable!!
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

	function checkCookie(req, res, callback)
	{
		// if no cookies are passed, redirect to login.
		if( typeof(req.headers.cookie) == 'undefined' )
		{
			res.writeHead(302, [
				['Location', '/login']
			]);
			res.end();
			callback(new Error('No cookie passed'));
		}
		// check if the cookie is a JSON object. otherwise, say cookie error.
		var cookie;
		try {
			cookie = JSON.parse(req.headers.cookie);
			console.log(cookie);
		} catch (e) {
			res.error('Your cookie is broken. Please clear cookies '+
				'for this site and try again');
			callback(new Error('Broken Cookie'));
		}

		// check if the cookie is valid.
		Ni.library('UserAuth').checkAuth(
			cookie,
			function(err, is_valid)
			{
				if(err) {
					res.writeHead(302, [
						['Location', '/logout'],
					]);
					res.end();
					callback(err);
				} else if( !is_valid ) {
					res.writeHead(302, [
						['Location', '/login']
					]); // redirect to login page.
					res.end();
					callback(new Error('Cookie not valid'));
				} else	callback(null, cookie);
			}
		);
	}
	
	this.edit = function(req, res, next)
	{
		var res_obj = {
			'error': null,
			'success': false;
		};

		checkCookie(req, res,
			function(err, cookie)
			{
				if(err) {
					console.log(err.message);
					res_obj.error = err;
					res.ok(res_obj);
					return;
				}
				
				// if valid, get POST variable
				getPOST(req, function(err, POST)
				{
					if(err) {
						console.log(err.message);
						res_obj.error = err;
						res.ok(res_obj);
						return;
					}
					if(	typeof(POST.feed_url)        == 'undefined' ||
						typeof(POST.num_feed_items)  == 'undefined' ||
						typeof(POST.title_selection)  == 'undefined' ||
						typeof(POST.body_selection)  == 'undefined' ) {

						res_obj.error = new Error('POST variables not found.');
						res.ok(res_obj);
						return;
					}
					
					Ni.model('User').addFeed(
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
								res.ok(res_obj);
								return;
							}
							
							// return success = true
							res_obj.success = true;
							res.ok(res_obj);
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
			'success': false;
		};

		checkCookie(req, res,
			function(err, cookie)
			{
				if(err) {
					console.log(err.message);
					res_obj.error = err;
					res.ok(res_obj);
					return;
				}
				
				// if valid, get POST variable
				getPOST(req, function(err, POST)
				{
					if(err) {
						console.log(err.message);
						res_obj.error = err;
						res.ok(res_obj);
						return;
					}
					if( typeof(POST.feed_url) == 'undefined' ) {
						res_obj.error = new Error('POST variables not found.');
						res.ok(res_obj);
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
								res.ok(res_obj);
								return;
							}
							
							// return success = true
							res_obj.success = true;
							res.ok(res_obj);
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
