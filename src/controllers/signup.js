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
		var params = url.parse(req.url, true).query;
		if(params.username == null || params.password == null) {
			res.error('You must provide both a Username and Password');
		} else {
			Ni.model('User').save(
				params.username,
				params.password,
				'fname',
				'lname',
				'eid',
				function(err, user)
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

						res.writeHead( 302, [
							['Location', '/login'],
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

module.exports = new SignupController();
