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
		Step(
			function getColumns() {
				var step = this;
				
				Ni.helper('cookies').checkCookie(req, res, function(err, cookie)
				{
					if( err ) {
						// Return default feeds
						step(null, Ni.config('default_feeds'));
					} else {
						// User logged in, get user's feeds
						dbg.log('geting feeds for user ' + cookie.data.user);
						
						Ni.model('User').get(
							cookie.data.user,
							function(err, user) {
								if (err) {
									step(err);
								}
								else {
									step(null, user.feeds, user);
								}
							}
						);
					}
				});
			},
			function generateHomePage(err, feeds, user) {
				self._generateColumns(
					feeds,
					function(err, columns) {
						if (err) {
							dbg.log("there was an error in generating one of the teasers");
						}

						var home;
						if (user) {
							home = Ni.library('Templater').getHomePage(
								{
									columns : columns,
									name    : user.first_name + " " + user.last_name
								},
								true
							);
						}
						else {
							home = Ni.library('Templater').getHomePage(
								{
									columns : columns,
								},
								false
							);
						}
						
						res.ok(home);
					}
				);
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
			columns[i] = {};
			for (j in feed_map[i]) {
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
