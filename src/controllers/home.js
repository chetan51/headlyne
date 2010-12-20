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
		'http://feeds.gawker.com/lifehacker/full',
		3,
		function(err, feed) {
			var output = "";
			
			for (var i in feed.items) {
				var item = feed.items[i];
				
				if (item.webpage) {
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