/*
 *  LoginController - a controller to be used with Ni that is called by
 *  the router when a user visits the login page /login
 */

/*
 *  Module dependencies
 */
var Ni = require('ni');
var url = require('url'),
	querystring = require('querystring');

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
		
		console.log(params);

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
							return;
						} else {
							res.error('Uh oh, something went wrong. '+
								'Please try again later');
						}
					} else {
						// no errors -- attach the cookie, direct to
						// home page, and get moving.
						var expiry_date = new Date(cookie.expires);

						res.writeHead( 302, [
							['Location', '/'],
							['Set-Cookie', 
								JSON.stringify(cookie)+';'+
								'path=/;'+
								'expires='+expiry_date.toUTCString()+';'
							]
						]);
						res.end();

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
