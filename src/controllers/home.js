/*
 *  HomeController - handling display of the home page.
 *
 *  When the root URL, /, is loaded, the index function below is called.
 */

/*
 *  Module dependencies
 */

var Ni   = require('ni');
var Step = require('step');
var dbg  = require('../../src/libraries/Debugger.js');

/*
 *  The home controller
 */
var HomeController = function()
{
	var self = this;

	this.index = function(req, res, next)
	{
		Ni.helper('cookies').checkCookie(req, res, function(err, cookie)
		{
			if( err ) {
				dbg.log('redirect: home to logout');
				res.moved('/account/logout');
			} else {
				// User logged in, serve user's home page
				dbg.log('geting user home page for ' + cookie.data.user);
				
				Ni.model('User').get(
					cookie.data.user,
					function(err, user) {
						self._generateColumns(
							user.feeds,
							function(err, columns) {
								if (err) {
									dbg.log("there was an error in generating one of the teasers");
								}

								var home = Ni.library('Templater').getHomePage(
									{
										columns : columns,
								    		name    : user.first_name + " " + user.last_name
									},
									true
								);
								
								res.ok(home);
							}
						);
					}
				);
			}
		});
	}

	this.sample = function(req, res, next)
	{
		self._generateColumns(
			Ni.config('default_feeds'),
			function(err, columns) {
				if (err) throw err;
				
				var home = Ni.library('Templater').getHomePage(
					{columns: columns},
					false
				);
				
				res.ok(home);
			}
		);
	}
	
	/*
	 *	Helper that creates teaser according to given user's specifications.
	 *	
	 *		Arguments: user
	 *		           feed URL
	 *		
	 *		Returns (via callback): error
	 *		                        teaser in JSON format
	 */
	this._createTeaser = function(user, feed_url, callback)
	{
		var global_feed;
		Step(
			function findFeed()
			{
				dbg.log('find feed'); 
				Ni.model('User').getFeed(
					user.username,
					feed_url,
					this
				);
			},
			function generateTeaser(err, feed)
			{
				global_feed = feed;
				if(err) throw err; // rethrows error

				dbg.log('gen teaser'); 
				Ni.library('FeedServer').getFeedTeaser(
					feed_url,
					feed.num_feed_items,
					function(){},
					this
				);
			},
			function updateTeaser(err, teaser)
			{
				dbg.log('Err: '+err+'. update teaser...');
				if(err) throw err;
				for( keys in global_feed ) {
					dbg.log('key '+keys);
					teaser[keys] = global_feed[keys];
				}
				return teaser;
			},
			function genPage(err, feed)
			{
				dbg.log('Err: '+err+'. genpage...');
				if(err) throw err;
				var teaser = Ni.library('Templater').getFeedTeaser(
					{feed: feed}
				);
				return teaser;
			},
			function fireCallback(err, teaser)
			{
				dbg.log('returning teaser. Err: '+err);
				callback(err, teaser);
			}
		);
	}
	
	/*
	 *	Helper that generates columns of feeds according to given feed map.
	 *	
	 *		Arguments: feed map
	 *		
	 *		Returns (via callback): error
	 *		                        columns for page view
	 */
	this._generateColumns = function(feed_map, callback)
	{
		dbg.log('generating columns');
		
		var columns = [];
		var total_count = 0, count = 0;
		var global_err = null;
		
		// Set up return object and count the number of feeds to process
		for (i in feed_map) {
			for (j in feed_map[i]) {
				columns[i] = {};
				columns[i].feeds = [];
				total_count++;
			}
		}
		
		if (total_count == 0)
		{
			 callback(new Error('No feeds to generate columns.'));
			 return;
		}
		
		// Process feed map
		feed_map.forEach(function(column, i) {
			column.forEach(function(feed, j) {
				Ni.library('FeedServer').getFeedTeaser(
					feed.url,
					feed.num_feed_items,
					function(){},
					function(err, teaser)
					{
						if (err)  {
							global_err = err;
						}
						else {
							// Add view parameters
							for (key in feed_map[i][j])
							{
								teaser[key] = feed_map[i][j][key];
							}

							var teaser_html = Ni.library('Templater').getFeedTeaser(
								{feed: teaser}
							);
							
							columns[i].feeds[j] = teaser_html;
						}

						count++;
						if (count == total_count) {
							callback(global_err, columns);
						}
					}
				);
			});
		});
	}
};

/*
 *  Exports the home controller
 */

module.exports = new HomeController();
