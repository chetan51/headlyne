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
		var dom_text = self.domify(fulltext);

		// iterate through DOM elements until 'length' = 250.
		// one image permissible.

		var done=false, length=0;
		
		while(!done)
		{
			// get next element.
			// call helper to get children within remaining limit.
			// 	subsnip(element, max_length) -- returns element, true if whole element returned.
			// 
			// *snip iterates only over top level elements.
			// *subsnip calls itself recursively for all children.

			if( length > 250 ) {
				done=true;
				// remove the excess item (function trailSnip?)
			}
		}

		return fulltext;
	}
};

module.exports = new ContentGrabber();
