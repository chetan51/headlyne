
/* Dependencies */
var Readability = require('node-readability');
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

	this.readable = function(html)
	{
		Readability.init(thisContentGrabber.domify(html), true);
		var article_element = Readability.grabArticle();

		return Readability.getInnerText(article_element, false);
	};
};

module.exports = new ContentGrabber();
