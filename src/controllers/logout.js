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
		Util.checkCookie(req, res, function(err, cookie)
		{
			if( err ) {
				dbg.log('redirect: logout to login:');
				dbg.log(err.message);
				
				res.clearCookie('cookie');
				res.writeHead( 302, {
					Location: '/login'
				});
				res.end();
							/*res.writeHead( 200 );
							res.write('logged out');
							res.end();*/
			} else {
				dbg.log(cookie.data);
				Ni.library('UserAuth').invalidate(
						cookie.data.user,
						function(err)
						{
							// no errors -- attach a null cookie, direct to
							// login page, and get moving.
							res.clearCookie('cookie');
							res.writeHead( 302, {
								Location: '/login'
							});
							dbg.log('redirect: logout to login.');
							res.end();
						}
				);
			}
		});
	}
};

/*
 *  Exports the logout controller
 */

module.exports = new LogoutController();
