/**
 * Module for operating on cookies.
 **/

/**
 *  Module dependencies
 **/
var sys = require('sys');
var cookie_node = require('cookie');
var querystring = require('querystring');

/*
 *  The cookies helper
 */
var CookiesHelper = function()
{
	// takes request object, returns cookie if it found one that is valid.
	this.checkCookie = function(req, res, callback)
	{
		// if no cookies are passed...
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
module.exports = new CookiesHelper();
