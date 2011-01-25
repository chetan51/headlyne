/**
 * 
 **/

/**
 *  Module dependencies
 **/
var Connect = require('connect'),
    Quip    = require('quip'),
    Ni      = require('ni');
    dbg     = require('./libraries/Debugger.js');

var resque = require('coffee-resque').connect({
	host: "localhost",
	port: 6379
});

/**
 * Constants
 **/
var db_name = 'headlyne',
    db_addr = '127.0.0.1',
    db_port = 27017,
    db_user = 'username',
    db_pass = 'password';

/**
 *  Load Ni and start the server.
 **/
Ni.config('root', __dirname);

/**
 *  App configuration
 **/

Ni.config('base_url',            "/");
Ni.config('http_timeout',        30000);
Ni.config('feedparse_timeout',   5000);
Ni.config('feed_expiry_length',  30 * 60 * 1000);
Ni.config('max_redirect',        5);
Ni.config('session_lifetime',    14 * 24 * 60 * 60 * 1000);
Ni.config('snippet_image_limit', 2);
Ni.config('snippet_text_limit',  300);
Ni.config('log_enabled',         true);

Ni.config('default_feeds',
	[
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
	]
);		

Ni.boot(function initializeDatabase() {
	dbg.called();
	
	Ni.library('DatabaseDriver').init(
		db_name,
		db_addr,
		db_port,
		db_user,
		db_pass,
		function startServer(err) {
			dbg.called();
			
			/*
			Ni.library('DatabaseDriver').getCollection(
				'feeds',
				function(err, collection)
				{
					if (err) {
						throw err;
					}
					else {
						collection.remove(
							function(err, doc)
							{
								if(err != null)
									throw err;
								else {
								}
							}
						);
					}
				}
			);
			
			Ni.library('DatabaseDriver').getCollection(
				'webpages',
				function(err, collection)
				{
					if (err) {
						throw err;
					}
					else {
						collection.remove(
							function(err, doc)
							{
								if(err != null)
									throw err;
								else {
								}
							}
						);
					}
				}
			);
			*/
			
			if (err) throw err;
			
			/*
			Ni.model('Invite').add(
				'admin',
				function(err, invite_code) {
					if (err) throw err;

					console.log(invite_code);
				}
			);
			*/
			
			// Connect workers
			var worker = resque.worker('ContentGrabber', Ni.library('ContentGrabber').worker);
			worker.start();
		}
	);
});
