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
var sys = require('sys');

/*
 *  The home controller
 */

var HomeController = function() {

    this.index = function(req, res, next) {
	Ni.library('FeedServer').getFeedTeaser(
		'http://lifehacker.com/index.xml',
		3,
		function(err, feed) {
			res.ok("Feed:\n\n" + sys.inspect(feed));
		}
	);
    }

};

/*
 *  Exports the home controller
 */

module.exports = new HomeController();