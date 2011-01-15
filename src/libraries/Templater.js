/**
 *	Templater
 * 
 *		Provides methods generating views.
 **/

/**
 *	Module dependencies
 **/
var Ni   = require('ni'),
    jade = require('jade'),
    dbg  = require('../../src/libraries/Debugger.js');

/**
 *	The Templater library
 **/
var Templater = function()
{    
	var self = this;
	
	/**
	 *    Pages
	 **/
	
	/**
	 *	Generates an HTML view of the home page.
	 *
	 * 	Arguments:
	 * 		parameters for view {
	 *              columns,
	 *              user's name
	 * 		},
	 * 		user logged in?
	 *
	 * 	Returns:
	 * 		HTML view
	 **/
	this.getHomePage = function getHomePage(view_parameters, logged_in)
	{
		dbg.called();
		
		view_parameters.base_url = Ni.config('base_url');
		
		if (view_parameters.columns == null) {
			view_parameters.columns = [];
		}
		
		var columns_html = [];
		for (i in view_parameters.columns) {
			var column = view_parameters.columns[i];

			var column_html = jade.render(
				Ni.view('column').template,
				{locals: column}
			);
			
			columns_html[i] = column_html;
		}
		
		var column_mold_html = jade.render(
			Ni.view('column').template,
			{locals: {feeds: []}}
		);
		
		var feed_mold_html = jade.render(
			Ni.view('feed').template,
			{locals:
				{
					title           : "",
		    			url             : "",
		    			num_feed_items  : "",
		    			title_selection : "",
		    			body_selection  : "",
		    			body            : ""
				}
			}
		);
		
		var page = jade.render(
			Ni.view('page').template,
			{locals: 
				{
					columns     : columns_html,
					column_mold : column_mold_html,
					feed_mold   : feed_mold_html
				}
			}
		);
		
		var name = view_parameters.name;
		
		var view_parameters = {};
		view_parameters.content = page;
		view_parameters.name = name;
		
		var page_navigation = self.getPageNavigation(
			view_parameters
		);
		view_parameters.page_navigation = page_navigation;
		
		var account_navigation = self.getAccountNavigation(
			view_parameters,
			logged_in
		);
		view_parameters.account_navigation = account_navigation;
		
		if (logged_in) {
			notifications = "";
		}
		else {
			var notifications = jade.render(
				Ni.view('welcome_notification').template
			);
		}
		view_parameters.notifications = notifications;
		
		return self.getBase(view_parameters, logged_in);
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
	 * 	Returns:
	 * 		HTML view
	 **/
	this.getLoginPage = function getLoginPage(view_parameters)
	{
		dbg.called();
		
		view_parameters.base_url = Ni.config('base_url');
		
		if (view_parameters.username == null) {
			view_parameters.username = "";
		}
		
		var login = jade.render(
			Ni.view('login').template,
			{locals: view_parameters}
		);
		
		var view_parameters = {};
		
		var account_navigation = self.getAccountNavigation(
			view_parameters,
			false
		);
		view_parameters.account_navigation = account_navigation;
		
		view_parameters.title = "Login";
		view_parameters.folio_title = "Login";
		view_parameters.content = login;
		
		return self.getBase(view_parameters, false);
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
	 * 	Returns:
	 * 		HTML view
	 **/
	this.getSignupPage = function getSignupPage(view_parameters)
	{
		dbg.called();
		
		view_parameters.base_url = Ni.config('base_url');
		
		if (view_parameters.username == null) {
			view_parameters.username = "";
		}
		if (view_parameters.email == null) {
			view_parameters.email = "";
		}
		if (view_parameters.first_name == null) {
			view_parameters.first_name = "";
		}
		if (view_parameters.last_name == null) {
			view_parameters.last_name = "";
		}

		var signup = jade.render(
			Ni.view('signup').template,
			{locals : view_parameters}
		);
		
		var view_parameters = {};
		
		var account_navigation = self.getAccountNavigation(
			view_parameters,
			false
		);
		view_parameters.account_navigation = account_navigation;
		
		view_parameters.title = "Sign Up";
		view_parameters.folio_title = "Sign Up";
		view_parameters.content = signup;
		
		return self.getBase(view_parameters, false);
	}
	
	/**
	 *	Generates an HTML view of the sign up page with invite.
	 *
	 * 	Arguments:
	 * 		parameters for view {
	 * 			username
	 * 			email address
	 * 			error message
	 * 		}
	 *
	 * 	Returns:
	 * 		HTML view
	 **/
	this.getSignupPageWithInvite = function getSignupPageWithInvite(view_parameters)
	{
		dbg.called();
		
		view_parameters.base_url = Ni.config('base_url');
		
		if (view_parameters.username == null) {
			view_parameters.username = "";
		}
		if (view_parameters.invite_code == null) {
			view_parameters.invite_code = "";
		}
		if (view_parameters.email == null) {
			view_parameters.email = "";
		}
		if (view_parameters.first_name == null) {
			view_parameters.first_name = "";
		}
		if (view_parameters.last_name == null) {
			view_parameters.last_name = "";
		}

		var signup = jade.render(
			Ni.view('signup_with_invite').template,
			{locals : view_parameters}
		);
		
		var view_parameters = {};
		
		var notifications = jade.render(
			Ni.view('signup_invite_notification').template
		);
			
		view_parameters.notifications = notifications;
		
		var account_navigation = self.getAccountNavigation(
			view_parameters,
			false
		);
		view_parameters.account_navigation = account_navigation;
		
		view_parameters.title = "Sign Up";
		view_parameters.folio_title = "Sign Up";
		view_parameters.content = signup;
		
		return self.getBase(view_parameters, false);
	}
	
	/**
	 *	Generates an HTML view of the page to request invites
	 *
	 * 	Arguments:
	 * 		parameters for view {
	 * 			email
	 * 			first_name
	 *			last_name
	 * 			error message
	 * 		}
	 *
	 * 	Returns:
	 * 		HTML view
	 **/
	this.getRequestInvites = function getRequestInvites(view_parameters)
	{
		dbg.called();
		
		view_parameters.base_url = Ni.config('base_url');
		
		if (view_parameters.email == null) {
			view_parameters.email = "";
		}
		if (view_parameters.first_name == null) {
			view_parameters.first_name = "";
		}
		if (view_parameters.last_name == null) {
			view_parameters.last_name = "";
		}

		var req_invite_body = jade.render(
			Ni.view('request_invite').template,
			{locals : view_parameters}
		);
		
		var view_parameters = {};
		
		view_parameters.notifications = "";
		
		var account_navigation = self.getAccountNavigation(
			view_parameters,
			false
		);
		view_parameters.account_navigation = account_navigation;
		
		view_parameters.title = "Request an Invite";
		view_parameters.folio_title = "Request an Invite";
		view_parameters.content = req_invite_body;
		
		return self.getBase(view_parameters, false);
	}

	/**
	 *	Generates an HTML view of the interim page after an 
	 *	invite is requested.
	 *
	 * 	Arguments:
	 * 		parameters for view {
	 * 		}
	 *
	 * 	Returns:
	 * 		HTML view
	 **/
	this.getInviteRequested = function getInviteRequested(view_parameters)
	{
		dbg.called();
		
		view_parameters.base_url = Ni.config('base_url');
		
		var body = jade.render(
			Ni.view('invite_requested').template,
			{locals : view_parameters}
		);
		
		var view_parameters = {};
		
		view_parameters.notifications = body;
		
		var account_navigation = self.getAccountNavigation(
			view_parameters,
			false
		);
		view_parameters.account_navigation = account_navigation;
		
		view_parameters.title = "Invite Requested";
		view_parameters.folio_title = "Invite Requsted";
		view_parameters.content = "";
		
		return self.getBase(view_parameters, false);
	}

	/**
	 *    Partials
	 **/
	
	/**
	 *	Generates an HTML view of base, with given content.
	 *
	 * 	Arguments:
	 * 		parameters for view {
	 *              title,
	 *              page content,
	 *              page navigation,
	 *              account navigation,
	 *              notifications
	 * 		},
	 * 		user logged in?
	 *
	 * 	Returns:
	 * 		HTML view
	 **/
	this.getBase = function getBase(view_parameters, logged_in) {
		dbg.called();
		
		view_parameters.base_url = Ni.config('base_url');
		
		if (view_parameters.title == null) {
			view_parameters.title = "Headlyne";
		}
		if (view_parameters.folio_title == null) {
			view_parameters.folio_title = "Headlyne";
		}
		if (view_parameters.folio_subtitle == null) {
			var now = new Date();
			view_parameters.folio_subtitle = now.format("dddd, mmmm dS, yyyy");
		}
		if (view_parameters.page == null) {
			view_parameters.page = "";
		}
		if (view_parameters.page_navigation == null) {
			view_parameters.page_navigation = "";
		}
		if (view_parameters.account_navigation == null) {
			view_parameters.account_navigation = "";
		}
		if (view_parameters.notifications == null) {
			view_parameters.notifications = "";
		}
		
		var html = jade.render(
			Ni.view('base').template,
			{locals:view_parameters}
		);
		
		return html;
	}
	
	/**
	 *	Generates an HTML view of the page navigation.
	 *
	 * 	Arguments:
	 * 		parameters for view {
	 * 		}
	 *
	 * 	Returns:
	 * 		HTML view
	 **/
	this.getPageNavigation = function getPageNavigation(view_parameters)
	{
		dbg.called();
		
		view_parameters.base_url = Ni.config('base_url');
		
		var page_navigation = jade.render(
			Ni.view('page_navigation').template,
			{locals: view_parameters}
		);
		
		return page_navigation;
	}
	
	/**
	 *	Generates an HTML view of the account navigation.
	 *
	 * 	Arguments:
	 * 		parameters for view {
	 * 		    username
	 * 		    user logged in?
	 * 		}
	 *
	 * 	Returns:
	 * 		HTML view
	 **/
	this.getAccountNavigation = function getAccountNavigation(view_parameters, logged_in)
	{
		dbg.called();
		
		view_parameters.base_url = Ni.config('base_url');
		
		if (view_parameters.name == null) {
			view_parameters.name = "Anonymous";
		}
		
		var account_navigation = null;
		
		if (logged_in) {
			account_navigation = jade.render(
				Ni.view('account_navigation_logged_in').template,
				{locals: view_parameters}
			);
		}
		else {
			account_navigation = jade.render(
				Ni.view('account_navigation_not_logged_in').template,
				{locals: view_parameters}
			);
		}
		
		return account_navigation;
	}
	
	/**
	 *	Generates an HTML view of a feed teaser.
	 *
	 * 	Arguments:
	 * 		parameters for view {
	 * 		    feed
	 * 		}
	 *
	 * 	Returns:
	 * 		HTML view
	 **/
	this.getFeedTeaser = function getFeedTeaser(view_parameters)
	{
		dbg.called();
		
		var feed = view_parameters.feed;
		
		var teaser_body = self.getFeedTeaserBody(
			{feed: feed}
		);
		
		feed.body = teaser_body;
		
		var teaser = jade.render(
			Ni.view('feed').template,
			{locals: feed}
		);
		
		return teaser;
	}
	
	/**
	 *	Generates an HTML view of a feed teaser's body.
	 *
	 * 	Arguments:
	 * 		parameters for view {
	 * 		    feed
	 * 		}
	 *
	 * 	Returns:
	 * 		HTML view
	 **/
	this.getFeedTeaserBody = function getFeedTeaserBody(view_parameters)
	{
		dbg.called();
		
		var feed = view_parameters.feed;
		
		var teaser_body = jade.render(
			Ni.view('feed_body').template,
			{locals: feed}
		);
		
		return teaser_body;
	}
};

/**
 *	Exports the Templater library
 **/
module.exports = new Templater();
