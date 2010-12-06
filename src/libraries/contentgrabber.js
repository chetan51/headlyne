/* Dependencies */
var Readability = require('node-readability');
var jsdom       = require('jsdom');

/**
 * ContentGrabber: given a URL, fetch *only* the text
 * content from that page.
 **/

var ContentGrabber = function()
{
	thisContentGrabber = this;
	
	this.domify = function(html)
	{
		return jsdom.jsdom(html);
	};

	this.readable = function(html)
	{
		Readability.init( thisContentGrabber.domify(html) );
		var article_element = Readability.grabArticle();
		return article_element.innerHTML;
	};
};

module.exports = new ContentGrabber();
