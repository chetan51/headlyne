
/* Dependencies */
var jsdom       = require('jsdom');
var path        = require('path');
var Worker      = require('webworker').Worker;

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

	this.readable = function(html, callback, errback)
	{
		var w = new Worker(path.join(__dirname, 'ReadabilityWorker.js'));

		w.onmessage = function(message)
		{
			if (message.data.article != null) {
				callback(message.data.article);
			}
			else if (message.data.error) {
				errback(new Error("Unable to grab content from document. Error: " + message.data.error));
			}
			else {
				errback(new Error("Something went horribly wrong."));
			}
			
			w.terminate();
		};

		w.postMessage({
			command : 'grabContent',
			html    : html
		});

	};
};

module.exports = new ContentGrabber();
