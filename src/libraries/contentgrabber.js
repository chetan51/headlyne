
/* Dependencies */
var Readability = require('./external/readability.js');
var jsdom       = require('jsdom');

/*
 * ContentGrabber: given a URL, fetch *only* the text
 * content from that page.
 */

var ContentGrabber = function() {

	thisContentGrabber = this;
	
	this.domify = function(html)
	{
		return jsdom.jsdom(html);
	};
};

module.exports = new ContentGrabber();
