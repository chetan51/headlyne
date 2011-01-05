/*
 *  LoginController - a controller to be used with Ni that is called by
 *  the router when a user visits the login page /login
 */

/*
 *  Module dependencies
 */
var Ni = require('ni');
var url = require('url');
var Quip = require('quip');

/*
 *  The login controller
 */

var SignupController = function()
{
	this.index = function(req, res, next)
	{
	}
};

/*
 *  Exports the login controller
 */

module.exports = new SignupController();
