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
				// if valid, serve the page requested.
				var global_user, global_feed_array=[];
				Step(
					function getUser()
					{
						dbg.log('getUser '+cookie.data.user);
						Ni.model('User').get(
							cookie.data.user,
							this
						);
					},
					function STUBuser(err, user)
					{
						global_user = user;
						dbg.log(global_user.feeds);
					/*
						var new_feeds = [
							[
								{
									url: 'http://feeds.feedburner.com/quotationspage/qotd',
									num_feed_items: 9,
									body_selection: 'item',
									title_selection: 'item'
								}
							],
							[
								{
									url: 'http://feeds.reuters.com/reuters/companyNews?format=xml',
									num_feed_items: 2,
									body_selection: 'webpage',
									title_selection: 'webpage'
								},
								{
									url: 'http://feeds.reuters.com/reuters/entertainment',
									num_feed_items: 2,
									body_selection: 'item',
									title_selection: 'webpage'
								},
							],
							[
								{
									url: 'http://feeds.feedburner.com/FutilityCloset',
									num_feed_items: 3,
									body_selection: 'webpage',
									title_selection: 'item'
								}
							]
						];
						global_user.feeds = new_feeds;
						Ni.model('User').updateFeeds(
							cookie.data.user,
							new_feeds,
							this
						);
					},
					function getTeasers(err, feed_array)
					{*/
						dbg.log('get teasers for '+JSON.stringify(global_user));
						if (err) throw err;
						
						var count=0, done_count=0;
						for(i in global_user.feeds) {
							for(j in global_user.feeds[i]) {
								global_feed_array[i] = [];
								count = count + 1;
							}
						}

						var _this = this;
						global_user.feeds.forEach(function(feeds_i, i) {
							feeds_i.forEach(function(feeds_j, j) {
								self._createTeaser(
									global_user,
									feeds_j.url,
									function(err, teaser)
									{
										done_count = done_count + 1;
										global_feed_array[i][j] = teaser;
										
										if( done_count == count ) {
											_this();
										}
									}
								);
							});
						});
						
						if(!count)
						{
							throw new Error('No feeds saved!');
						}
					},
					function(err, teasers)
					{
						dbg.log('got all teasers. Err: '+err);
						var columns = [];
						columns[0] = {};

						if(!err) {
							// fill columns variable
							for( i in global_feed_array) {
								columns[i] = {};
								columns[i].feeds = global_feed_array[i];
							}
						}

						// return teasers
						var home = Ni.library('Templater').getHomePage(
							{
								feed_map: columns,
								name    : cookie.data.user,
							},
							true
						);
						
						res.ok(home);
					}
				);
			}
		}); // close checkCookie
	}

	this.sample = function(req, res, next)
	{
		var feeds = [
			[
				{
					url: 'http://feeds.feedburner.com/quotationspage/qotd',
					num_feed_items: 9,
					body_selection: 'item',
					title_selection: 'item'
				}
			],
			[
				{
					url: 'http://feeds.reuters.com/reuters/companyNews?format=xml',
					num_feed_items: 2,
					body_selection: 'webpage',
					title_selection: 'webpage'
				},
				{
					url: 'http://feeds.reuters.com/reuters/entertainment',
					num_feed_items: 2,
					body_selection: 'item',
					title_selection: 'webpage'
				},
			],
			[
				{
					url: 'http://feeds.feedburner.com/FutilityCloset',
					num_feed_items: 3,
					body_selection: 'webpage',
					title_selection: 'item'
				}
			]
		];
		
		self._createFeedMap(
			feeds,
			function(err, feed_map) {
				if (err) throw err;
				
				// return teasers
				var home = Ni.library('Templater').getHomePage(
					{feed_map: feed_map},
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
	 *	Helper that creates a feed map for the given user's feeds.
	 *	
	 *		Arguments: user's feeds
	 *		
	 *		Returns (via callback): error
	 *		                        feed map in JSON format
	 */
	this._createFeedMap = function(feeds, callback)
	{
		dbg.log('creating feed map');
		
		var global_feed_array=[];
		var count=0, done_count=0;
		for(i in feeds) {
			for(j in feeds[i]) {
				global_feed_array[i] = [];
				count = count + 1;
			}
		}
		
		feeds.forEach(function(feeds_i, i) {
			feeds_i.forEach(function(feeds_j, j) {
				Ni.library('FeedServer').getFeedTeaser(
					feeds_j.url,
					feeds_j.num_feed_items,
					function(){},
					function(err, teaser)
					{
						if (err)  {
							callback(err);
							return;
						}

						for( keys in feeds[i][j] )
						{
							teaser[keys] = feeds[i][j][keys];
						}
						
						var teaser_html = Ni.library('Templater').getFeedTeaser(
							{feed: teaser}
						);

						done_count = done_count + 1;
						global_feed_array[i][j] = teaser_html;

						if( done_count == count ) {
							callback(null, global_feed_array);
							return;
						}
					}
				);
			});
		});
		
		if(!count)
		{
			 callback(new Error('No feeds to create feed map.'));
		}
	}
};

/*
 *  Exports the home controller
 */

module.exports = new HomeController();
