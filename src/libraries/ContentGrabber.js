/* Dependencies */
var jsdom       = require('jsdom');
var path        = require('path');
var Worker      = require('webworker').Worker;

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
		var w = new Worker(path.join(__dirname, 'ReadabilityWorker.js'));

		w.onmessage = function(message)
		{
			if (message.data.title && message.data.content) {
				callback(null, message.data.title, message.data.content);
			}
			else if (message.data.error) {
				callback(new Error("Unable to grab content from document. Error: " + message.data.error));
			}
			else {
				callback(new Error("Something went horribly wrong."));
			}
			
			w.terminate();
		};

		w.postMessage({
			command : 'grabContent',
			html    : html
		});
	};

	this.snip = function(fulltext)
	{
		return fulltext;
	}
};

module.exports = new ContentGrabber();
