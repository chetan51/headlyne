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
		if(	typeof(params) == 'undefined' ||
			params['username'] == 'undefined' ||
			params['password'] == 'undefined' ) {
			
			var signup_form = Ni.view('signup').template;
			res.ok(signup_form);
		} else {
			var	username = params.username,
				password = params.password,
				fname    = 'anonymous',
				lname    = 'entity',
				email_id = 'addressless';

			if( params['first_name'] != 'undefined') fname = params.first_name;
			if( params['last_name' ] != 'undefined') lname = params.last_name;
			if( params['email_id'  ] != 'undefined') email_id = params.email_id;

			Ni.model('User').save(
				username,
				password,
				fname,
				lname,
				email_id,
				function(err, user)
				{
					if(err != null) {
						res.error('Uh oh, something went wrong: '+err.message);
					} else {
						// new user created. redirect to login.

						res.writeHead( 302, [
							['Location', 
								'/login?'+
								'username='+username+
								'password='+password
							],
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
