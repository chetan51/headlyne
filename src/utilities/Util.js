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
};

/*
 *  Exports the module
 */
module.exports = new Util();
