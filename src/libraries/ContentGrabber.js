/* Dependencies */
var jsdom       = require('jsdom');
var path        = require('path');
var Worker      = require('webworker').Worker;
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
		var length = 0, var snip_text = '';
		var tag_stack=[];
		var done = false;

		while( !done )
		{
			// main body
			// use node-xml to skip tags, count only content towards length,
			// and add the tag text + the content to snip_text.
			//
			// maintain tag stack so at 250, close all open tags manually.

			if( length > 250 )
				done = true;

		}
		return fulltext;
	}
};

module.exports = new ContentGrabber();
