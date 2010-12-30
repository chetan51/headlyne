/*
 *  LogoutController - a controller to be used with Ni that is called by
 *  the router when a user visits the logout page /logout
 */

/*
 *  Module dependencies
 */
var Ni = require('ni');
var url = require('url');

/*
 *  The logout controller
 */

var LogoutController = function()
{
	this.index = function(req, res, next)
	{
		// if no cookies are passed, simply redirect to login.
		if( typeof(req.headers.cookie) == 'undefined' )
		{
			res.writeHead(302, [
				['Location', '/login']
			]);
			res.end();
			return;
		}
		// check if the cookie is a JSON object. otherwise just redirect.
		var cookie;
		try {
			cookie = JSON.parse(req.headers.cookie);
			console.log(cookie);
			
			if( !Ni.library('UserAuth').validate_cookie(cookie) )
				throw new Error('invalid cookie');

		} catch (e) {
			res.writeHead( 302, [
				['Location', '/login'],
				['Set-Cookie', 
					';'+
					'path=/;'
				]
			]);
			res.end();
			return;
		}
		
		Ni.library('UserAuth').invalidate(
				cookie.data.user,
				function(err)
				{
					// no errors -- attach a null cookie, direct to
					// login page, and get moving.
					res.writeHead( 302, [
						['Location', '/login'],
						['Set-Cookie', 
							';'+
							'path=/;'
						]
					]);
					res.end();
				}
		);
	}
};

/*
 *  Exports the logout controller
 */

module.exports = new LogoutController();
