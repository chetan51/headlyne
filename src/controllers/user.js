/*
 *  UserController - a controller that handles all user-related requests.
 */

/*
 *  Module dependencies
 */
var Ni   = require('ni');
var sys  = require('sys');
var jade = require('jade');
var Step = require('step');
var qs   = require('querystring');
var Util = require('../utilities/Util');

/*
 *  The user controller
 */
var UserController = function()
{
	this.index = function(req, res, next)
	{
		res.error("No operation selected.");
	}
	
	this.edit = function(req, res, next)
	{
		var res_obj = {
			'error': null,
			'success': false
		};

		// get POST variable
		Util.getPOST(req, function(err, POST)
		{
			if(err) {
				console.log(err.message);
				res_obj.error = err;
				res.json(res_obj);
				return;
			}
			if(	typeof(POST.feed_url)        == 'undefined' ||
				typeof(POST.num_feed_items)  == 'undefined' ||
				typeof(POST.title_selection)  == 'undefined' ||
				typeof(POST.body_selection)  == 'undefined' ) {
					res_obj.error = new Error('POST variables not found.');
				res.json(res_obj);
				return;
			}

			// now, check if the cookie is valid.
//			var cookie={}; cookie.data={}; cookie.data.user = 'username';
			Util.checkCookie(req, res,
				function(err, cookie)
				{
					if(err) {
						console.log(err.message);
						res_obj.error = err;
						res.json(res_obj);
						return;
					}
					
					// do the actual editing!
					Ni.model('User').editFeed(
						cookie.data.user,
						POST.feed_url,
						POST.num_feed_items,
						POST.title_selection,
						POST.body_selection,
						function(err, feeds)
						{
							if(err) {
								console.log(err.message);
								res_obj.error = err;
								res.json(res_obj);
								return;
							}
							
							// return success = true
							res_obj.success = true;
							res.json(res_obj);
						}
					);
				}
			);
		});
	}
	
	this.sort = function(req, res, next)
	{
		var res_obj = {
			'error': null,
			'success': false
		};

		// get POST variable
		Util.getPOST(req, function(err, POST)
		{
			if(err) {
				console.log(err.message);
				res_obj.error = err;
				res.json(res_obj);
				return;
			}
			if( typeof(POST.feed_array) == 'undefined' ) {
				res_obj.error = new Error('POST variables not found.');
				res.json(res_obj);
				return;
			}

			// now check cookie
			Util.checkCookie(req, res,
				function(err, cookie)
				{
					if(err) {
						console.log(err.message);
						res_obj.error = err;
						res.json(res_obj);
						return;
					}
					
					Ni.model('User').updateFeeds(
						cookie.data.user,
						POST.feed_array,
						function(err, feeds)
						{
							if(err) {
								console.log(err.message);
								res_obj.error = err;
								res.json(res_obj);
								return;
							}
							
							// return success = true
							res_obj.success = true;
							res.json(res_obj);
						}
					);
				});
			}
		);
	}

	this.remove = function(req, res, next)
	{
		var res_obj = {
			'error': null,
			'success': false
		};

		// get POST variable
		Util.getPOST(req, function(err, POST)
		{
			if(err) {
				console.log(err.message);
				res_obj.error = err;
				res.json(res_obj);
				return;
			}
			if( typeof(POST.feed_url) == 'undefined' ) {
				res_obj.error = new Error('POST variables not found.');
				res.json(res_obj);
				return;
			}

			// now get cookie
			Util.checkCookie(req, res,
				function(err, cookie)
				{
					if(err) {
						console.log(err.message);
						res_obj.error = err;
						res.json(res_obj);
						return;
					}
					
					Ni.model('User').removeFeed(
						cookie.data.user,
						POST.feed_url,
						function(err, feeds)
						{
							if(err) {
								console.log(err.message);
								res_obj.error = err;
								res.json(res_obj);
								return;
							}
							
							// return success = true
							res_obj.success = true;
							res.json(res_obj);
						}
					);
				});
			}
		);
	}

	this.teaser = function(req, res, next)
	{
		var res_obj = {
			'error': null,
			'teaser': ''
		};

		// get POST variable
		Util.getPOST(req, function(err, POST)
		{
			if(err) {
				console.log(err.message);
				res_obj.error = err;
				res.json(res_obj);
				return;
			}
			if( typeof(POST.feed_url) == 'undefined' ) {
				res_obj.error = new Error('POST variables not found.');
				res.json(res_obj);
				return;
			}

			// now check cookie
			Util.checkCookie(req, res,
				function(err, cookie)
				{
					if(err) {
						console.log(err.message);
						res_obj.error = err;
						res.json(res_obj);
						return;
					}
					var global_feed;

					Step(
						function getUser()
						{
							console.log('get user'); 
							Ni.model('User').get(
								cookie.data.user,
								this
							);
						},
						function findFeed(err, user)
						{
							console.log('find feed'); 
							if(err) throw err; // rethrows error.
							var row=-1, col=-1;
							for( i in user.feeds )
							{
								for( j in user.feeds[i] )
								{
									if(
										'url' in user.feeds[i][j] &&
										user.feeds[i][j].url == POST.feed_url
									) {	
										col = i;
										row = j;
									}
								}
							}

							if( col == -1 ) { // row == -1 also then.
								throw new Error('Cannot find feed');
							} else {
								return user.feeds[col][row];
							}
						},
						function generateTeaser(err, feed)
						{
							global_feed = feed;
							if(err) throw err; // rethrows error

							console.log('gen teaser'); 
							Ni.library('FeedServer').getFeedTeaser(
								POST.feed_url,
								feed.num_feed_items,
								function(){},
								this
							);
						},
						function updateTeaser(err, teaser)
						{
							console.log('gen teaser: '+err);
							if(err) throw err;
							for( keys in global_feed ) {
								console.log('key '+keys);
								teaser[keys] = global_feed[keys];
							}
							return teaser;
						},
						function genPage(err, feed)
						{
							console.log('genpage '+err);
							if(err) throw err;
							var teaser = jade.render(
								Ni.view('feed').template,
								{locals: feed}
							);
							return teaser;
						},
						function response(err, teaser)
						{
							console.log('returning obj '+err);
							if(err) {
								res_obj.error = err;
								res.json(res_obj);
								return;
							}

							// return teaser
							res_obj.teaser = escape(teaser);
							res.json(res_obj);
						}
					);
				}
			);
		});
	}
};

/*
 *  Exports the user controller
 */
module.exports = new UserController();
