/*
 *  HomeController - a controller to be used with Ni that is called by
 *  the router when a user visits the root URL, /.
 *
 *  When the root URL, /, is loaded, the index function below is called.
 */

/*
 *  Module dependencies
 */

var Ni = require('ni');

/*
 *  The home controller
 */

var HomeController = function() {

    this.index = function(req, res, next) {
	Ni.library('FeedServer').getFeedTeaser(
		'http://feeds.gawker.com/lifehacker/full',
		function(err, feed) {
			console.log(err);
			console.log(feed);
		}
	);
	res.ok("Hello world!");
    }

};

/*
 *  Exports the home controller
 */

module.exports = new HomeController();