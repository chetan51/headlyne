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
				
				// if valid, add that feed.
				Ni.model('User').addFeed(
					cookie.data.user,
					feed_url,
					row,
					column,
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
			}
		);
	}
};

/*
 *  Exports the user controller
 */
module.exports = new UserController();
