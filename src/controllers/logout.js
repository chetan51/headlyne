/*
 *  LogoutController - a controller to be used with Ni that is called by
 *  the router when a user visits the logout page /logout
 */

/*
 *  Module dependencies
 */
var Ni  = require('ni');
var url = require('url');
var dbg = require('../../src/libraries/Debugger.js');
var Util= require('../../src/utilities/Util.js');
var cookie_node = require('cookie');

/*
 *  The logout controller
 */
var LogoutController = function()
{
	this.index = function(req, res, next)
	{
	}
};

/*
 *  Exports the logout controller
 */

module.exports = new LogoutController();
