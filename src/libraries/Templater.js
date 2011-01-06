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
	 *	Generates an HTML view of the home page.
	 *
	 * 	Arguments:
	 * 		parameters for view {
	 *              feed_map
	 * 		},
	 * 		user logged in?
	 *
	 * 	Returns (via callback):
	 * 		HTML view
	 **/
	this.getHomePage = function(view_parameters, logged_in, callback)
	{
		view_parameters.base_url = Ni.config('base_url');
		
		if (view_parameters.feed_map == null) {
			view_parameters.feed_map = [];
		}
		
		var page = jade.render(
			Ni.view('page').template,
			{locals: view_parameters}
		);
		
		var view_parameters = {};
		
		var account_navigation = null;
		
		if (logged_in) {
			notifications = "";
			
			account_navigation = jade.render(
				Ni.view('account_navigation_logged_in').template
			);
		}
		else {
			var notifications = jade.render(
				Ni.view('welcome_notification').template
			);
			
			account_navigation = jade.render(
				Ni.view('account_navigation_not_logged_in').template
			);
		}
		
		view_parameters.account_navigation = account_navigation;
		
		self.getBase(
			view_parameters,
			logged_in,
			function(err, html) {
				if (err) callback(err);
				else {
					callback(null, html);
				}
			}
		);
	}
	
	this.getPageNavigation(view_parameters, callback)
	{
		var page_navigation = null;
		page_navigation = jade.render(
			Ni.view('page_navigation').template
		);
		
		callback(null, page_navigation);
	}

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
		view_parameters.base_url = Ni.config('base_url');
		
		if (view_parameters.username == null) {
			view_parameters.username = "";
		}
		
		var login = jade.render(
			Ni.view('login').template,
			{locals: view_parameters}
		);
		
		self.getBase(
			{
				title : "Login",
				page  : login
			},
			false,
			function(err, html) {
				if (err) callback(err);
				else {
					callback(null, html);
				}
			}
		);
	}
	
	/**
	 *	Generates an HTML view of the sign up page.
	 *
	 * 	Arguments:
	 * 		parameters for view {
	 * 			username
	 * 			email address
	 * 			error message
	 * 		}
	 *
	 * 	Returns (via callback):
	 * 		HTML view
	 **/
	this.getSignupPage = function(view_parameters, callback)
	{
		view_parameters.base_url = Ni.config('base_url');
		
		if (view_parameters.username == null) {
			view_parameters.username = "";
		}
		if (view_parameters.email == null) {
			view_parameters.email = "";
		}

		var signup = jade.render(
			Ni.view('signup').template,
			{locals : view_parameters}
		);
		
		self.getBase(
			{
				title : "Sign Up",
				page  : signup
			},
			false,
			function(err, html) {
				if (err) callback(err);
				else {
					callback(null, html);
				}
			}
		);
	}
	
	/**
	 *	Generates an HTML view of base, with given content.
	 *
	 * 	Arguments:
	 * 		parameters for view {
	 *              title,
	 *              page,
	 *              page-navigation,
	 *              account-navigation,
	 *              notifications
	 * 		},
	 * 		user logged in?
	 *
	 * 	Returns (via callback):
	 * 		HTML view
	 **/
	this.getBase = function(view_parameters, logged_in, callback) {
		view_parameters.base_url = Ni.config('base_url');
		
		if (view_parameters.title == null) {
			view_parameters.title = "Headlyne";
		}
		if (view_parameters.page == null) {
			view_parameters.page = "";
		}
		if (view_parameters.page-navigation == null) {
			view_parameters.page-navigation = "";
		}
		if (view_parameters.account-navigation == null) {
			view_parameters.account-navigation = "";
		}
		if (view_parameters.notifications == null) {
			view_parameters.notifications = "";
		}
		
		var html = jade.render(
			Ni.view('base').template,
			{locals:view_parameters}
		);
		
		callback(null, html);
	}
};

/**
 *	Exports the Templater library
 **/
module.exports = new Templater();
