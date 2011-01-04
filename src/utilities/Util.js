/**
 * Util -- a module for utility functions.
 **/

/**
 *  Module dependencies
 **/
var sys = require('sys');
var cookie_node = require('cookie');
var querystring = require('querystring');

/*
 *  The utility module
 */
var Util = function()
{
	// returns POST variables as a JSON object.
	this.getPOST = function(req, callback)
	{
		var POST = '';
		var returned = false;
		if( req.method == 'POST') {
			req.addListener('data', function(chunk)
			{
				POST += chunk;
			});
			req.addListener('end', function()
			{
				try{
					console.log(POST);
					// POST = querystring.parse(POST);
					POST = JSON.parse(POST);
					console.log(POST);
					if(!returned)
						callback(null, POST);
				} catch(e) {
					returned = true;
					callback(e);
				}
			});
		} else callback(new Error('No POST data'));
	}
	
	// takes request object, returns cookie if it found one that is valid.
	this.checkCookie = function(req, res, callback)
	{
		// if no cookies are passed, redirect to login.
		var cookie = req.getCookie('cookie');
		if( !cookie )
		{
			callback(new Error('No cookie passed'));
		}

		// check if the cookie is a JSON object. otherwise, say cookie error.
		var cookie_obj;
		try {
			cookie_obj = JSON.parse(cookie);
			console.log(cookie_obj);
		} catch (e) {
			callback(new Error('Cookie is broken.'));
		}

		// check if the cookie is valid.
		Ni.library('UserAuth').checkAuth(
			cookie_obj,
			function(err, is_valid)
			{
				if(err) {
					callback(err);
				} else if( !is_valid ) {
					callback(new Error('Cookie not valid'));
				} else	callback(null, cookie_obj);
			}
		);
	}
};

/*
 *  Exports the module
 */
module.exports = new Util();
