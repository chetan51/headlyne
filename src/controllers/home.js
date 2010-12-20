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
		'http://www.feedforall.com/sample.xml',
		3,
		function(err, feed) {
			var output = "";
			
			output += "<h1>" + feed.title + "</h1>";
		
			for (var i in feed.items) {
				var item = feed.items[i];
				
				output += "<h2>" + item.title + "</h2>";
				if (item.webpage) {
					output += "<h3>" + item.webpage.title + "</h3>";
					output += "<div>" + item.webpage.body + "</div>";
				}
			}
			
			res.ok(output);
		}
	);
    }

};

/*
 *  Exports the home controller
 */

module.exports = new HomeController();