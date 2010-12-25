/* Dependencies */
var jsdom       = require('jsdom');
var path        = require('path');
var Readability = require('readability');

/**
 * ContentGrabber: given a URL, fetch *only* the text
 * content from that page.
 **/

var ContentGrabber = function()
{
	var self = this;
	
	this.domify = function(html)
	{
		return jsdom.jsdom(html);
	};

	this.readable = function(html, callback)
	{
		Readability.parse(
			html,
			"",
			function (result) {
				if (result.err) {
					callback(result.err);
				}
				else {
					callback(null, result.title, result.content);
				}
			}
		);
	};

	this.snip = function(fulltext)
	{
		return fulltext;
	}
};

module.exports = new ContentGrabber();
