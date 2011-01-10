/**
 * Dependencies
 **/
var crypto  = require('crypto'),
    jade    = require('jade'),
    Step    = require('step'),
    User    = require('../models/User'),
    dbg     = require('./Debugger.js'),
    Ni      = require('ni');


/**
 *	Provides functions for handling users and generating their pages.
 **/
var UserHandler = function()
{
	/**
	 *	Class variables
	 */
	var self = this;
	
	this.createTeaser = function(user, feed_url, callback)
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
};

module.exports = new UserHandler();
