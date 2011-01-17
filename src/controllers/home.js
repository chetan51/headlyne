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

	this.index = function index(req, res, next)
	{
		dbg.called();
		
		Step(
			function getColumns() {
				dbg.called();
		
				var step = this;
				
				Ni.helper('cookies').checkCookie(
					req,
					res,
					function returnFeeds(err, cookie)
					{
						dbg.called();
		
						if( err ) {
							// Return default feeds
							step(null, Ni.config('default_feeds'));
						} else {
							// User logged in, get user's feeds
							Ni.model('User').get(
								cookie.data.user,
								function returnUserFeeds(err, user) {
									dbg.called();
		
									if (err) {
										step(err);
									}
									else {
										step(null, user.feeds, user);
									}
								}
							);
						}
					}
				);
			},
			function generateHomePage(err, feeds, user) {
				dbg.called();
		
				self._generateColumns(
					feeds,
					function renderHomePageView(err, columns) {
						dbg.called();
		
						if (err) {
							dbg.error("there was an error in generating one of the teasers");
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
	this._generateColumns = function _generateColumns(feed_map, callback)
	{
		dbg.called();
		
		var columns = [];
		var total_count = 0, count = 0;
		var global_err = null;
		
		// Set up return object and count the number of feeds to process
		for (i in feed_map) {
			columns[i] = {};
			columns[i].feeds = [];
			for (j in feed_map[i]) {
				total_count++;
			}
		}
		
		if (total_count == 0)
		{
			 callback(new Error('No feeds to generate columns.'));
			 return;
		}
		
		// Process feed map
		feed_map.forEach(function eachColumn(column, i) {
			dbg.called();
		
			column.forEach(function eachFeed(feed, j) {
				dbg.called();
		
				Ni.library('FeedServer').getFeedTeaser(
					feed.url,
					feed.num_feed_items,
					function(){},
					function renderTeaserView(err, teaser)
					{
						dbg.called();
		
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
