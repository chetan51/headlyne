/*
 *  LoginController - a controller to be used with Ni that is called by
 *  the router when a user visits the login page /login
 */

/*
 *  Module dependencies
 */
var Ni          = require('ni'),
    url         = require('url'),
    cookie_node = require('cookie'),
    querystring = require('querystring'),
    dbg         = require('../../src/libraries/Debugger.js');

/*
 *  The login controller
 */

var LoginController = function()
{
	this.index = function(req, res, next)
	{
		var page = Ni.view('login').template;
		res.ok(page);
	};

	this.verify = function(req, res, next)
	{
	}
};

/*
 *  Exports the login controller
 */

module.exports = new LoginController();
