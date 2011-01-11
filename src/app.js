/**
 *  This is an example of how to use Ni to organize your code into a nice,
 *  neat MVC project.
 *
 *  You can place your controllers, models, views, libraries and helpers into
 *  respective folders /controllers, /models, /views, /libraries, /helpers, and
 *  they will be loaded when you call Ni.boot into the Ni object.
 *
 *  Take a look at the example controllers and views for how to structure that
 *  code to make it integrate with Ni.
 **/

/**
 *  Module dependencies
 **/
var Connect = require('connect'),
    Quip    = require('quip'),
    Ni      = require('ni');

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

Ni.config('base_url',            "/");
Ni.config('http_timeout',        30000);
Ni.config('feedparse_timeout',   5000);
Ni.config('feed_expiry_length',  30 * 60 * 1000);
Ni.config('max_redirect',        5);
Ni.config('session_lifetime',    14 * 24 * 60 * 60 * 1000);
Ni.config('snippet_image_limit', 2);
Ni.config('snippet_text_limit',  300);
Ni.config('log_enabled',         true);

Ni.boot(function() {
	Ni.library('DatabaseDriver').init(
		db_name,
		db_addr,
		db_port,
		db_user,
		db_pass,
		function(err) {

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
			Ni.model('Invites').add(
				'admin',
				function(err, invite_code) {
					if (err) throw err;

					console.log(invite_code);
				}
			);
			*/
			
			var app = Connect.createServer(
				Quip(),               
				Connect.bodyDecoder(),
				Ni.router,
				Connect.staticProvider({
					root: __dirname + '/public',
					cache: true
				})
			);

			app.listen(3000);
			console.log('Application server started on port 3000');
		}
	);
});
