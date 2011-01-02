/**
 * Util -- a module for utility functions.
 **/

/**
 *  Module dependencies
 **/
var sys = require('sys');
var querystring = require('querystring');

/*
 *  The utility module
 */
var Util = function()
{
	// returns POST variables as a JSON object.
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
	
	// takes request object, returns cookie if it found one that is valid.
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
};

/*
 *  Exports the module
 */
module.exports = new Util();
