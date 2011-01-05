/**
 *	Templater
 * 
 *		Provides methods generating views.
 **/

/**
 *	Module dependencies
 **/
var Ni   = require('ni'),
    jade = require('jade');

/**
 *	The Templater library
 **/
var Templater = function()
{    
	var self = this;

	/**
	 *	Generates an HTML view of the login page.
	 *
	 * 	Arguments:
	 * 		parameters for view {
	 * 			username
	 * 			error message
	 * 		}
	 *
	 * 	Returns (via callback):
	 * 		HTML view
	 **/
	this.getLoginPage = function(view_parameters, callback)
	{
		view_parameters.base_url = "/";
		
		if (view_parameters.username == null) {
			view_parameters.username = "";
		}
		
		var login = jade.render(
			Ni.view('login').template,
			{locals: view_parameters}
		);
		
		var html = jade.render(
			Ni.view('base').template,
			{locals:
				{
					base_url : "/",
					title    : "Login",
					content  : login
				}
			}
		);
		
		callback(null, html);
	}
};

/**
 *	Exports the Templater library
 **/
module.exports = new Templater();
