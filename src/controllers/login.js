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
		var params = url.parse(req.url, true).query;
		
		dbg.log(params);

		if(params.username == null || params.password == null) {
			res.error('You must provide both a Username and Password');
		} else {
			Ni.library('UserAuth').authenticate(
				params.username,
				params.password,
				function(err, is_new, cookie)
				{
					if(err != null) {
						if( err.message == 'No such User' ||
						    err.message == 'Invalid Password' )
						{
							res.error('Invalid Username or Password');
						} else {
							res.error('Uh oh, something went wrong. '+
								'Please try again later');
						}
					} else {
						// no errors -- attach the cookie, direct to
						// home page, and get moving.
						
						res.setCookie(
							'cookie',
							JSON.stringify(cookie),
							{
								path    : '/',
								expires : cookie.expires
							}
						);
						res.writeHead(302, {
							Location: '/'
						});
						res.end();
						dbg.log('redirect: login to home, logged in');
					}
				}
			);
		}
	}
};

/*
 *  Exports the login controller
 */

module.exports = new LoginController();
