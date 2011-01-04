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
