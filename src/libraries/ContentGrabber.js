/* Dependencies */
var jsdom       = require('jsdom');
var path        = require('path');
var Readability = require('readability');
var Ni          = require('ni');
var dbg         = require('./Debugger.js');

var resque = require('coffee-resque').connect({
	host: "localhost",
	port: 6379
});

/**
 * ContentGrabber: given a URL, fetch *only* the text
 * content from that page.
 **/

var ContentGrabber = function()
{
	var self = this;
	
	this.domify = function domify(html)
	{
		dbg.called();
		
		return jsdom.jsdom(html);
	};

	this.readable = function readable(html, callback)
	{
		dbg.called();
		
		resque.enqueue(
			'ContentGrabber',
			'readable',
			[html],
			callback
		);
		
		/*
		Readability.parse(
			html,
			"",
			function returnResult(result) {
				dbg.called();
		
				if (result.err) {
					callback(result.err);
				}
				else {
					callback(null, result.title, result.content);
				}
			}
		);
		*/
	};
	
	/**
	 * snip -- takes full (readable) text as an argument,
	 * 	and returns snippet text in its place.
	 *
	 * 	Arguments: fulltext
	 *
	 * 	Returns: snippet text.
	 **/
	this.snip = function snip(fulltext)
	{
		dbg.called();
		
		var text_length = 0, snip_text = '';
		var image_count = 0;

		var in_tag     = false,
		    got_name   = false,
		    in_squotes = false, 
		    in_dquotes = false, 
		    is_escaped = false;
		var tag_name   = '';

		var pos = 0;
		var done = false;

		// Skip all html tags, count only content towards length,
		// and add the tag text + the content to snip_text.
		while( !done )
		{
			// if we are inside an opened tag, do some different stuff
			if( in_tag ) {
				
				if( !got_name) {
					// first, try to get the tag name.
					if( fulltext[pos] != '>' &&
					    fulltext[pos] != ' ' )
					{
						tag_name += fulltext[pos];
					}
				}

				switch( fulltext[pos] )
				{
					case "'":
						// if we were already in quotes
						if( in_squotes )
						{
							// if this is escaped, just add.
							// otherwise, turn of in quotes
							if( !is_escaped ) {
								in_squotes = false;
							}
						} else { // turn quotes on.
							in_squotes = true;
						}
						break;
					case '"':
						// if we were already in quotes
						if( in_dquotes )
						{
							// if this is escaped, just add.
							// otherwise, turn of in quotes
							if( !is_escaped ) {
								in_dquotes = false;
							}
						} else { // turn quotes on.
							in_dquotes = true;
						}
						break;
					case '>':
						// exit the tag
						if( !in_dquotes && !in_squotes ) {
							in_tag = false;
						
							// handle all special tags here.
							switch(tag_name)
							{
								case 'img':
									image_count = image_count + 1;
									if ( image_count == Ni.config('snippet_image_limit') )
										done = true;
							}
						}

						// if '>' or ' ', end the tag name.
					case ' ':
						got_name = true;

						break;
				}
			} else {
				// if it is not in a tag, add the character
				// to the count unless it is an open '<'
				if( fulltext[pos] == '<' ) {
					in_tag = true;
					tag_name = '';
					got_name = false;
				}
				else text_length += 1;
			}

			// add character to snip_text
			snip_text += fulltext[pos];
			pos ++;
			// check end conditions
			if( text_length > Ni.config('snippet_text_limit') ) done = true;
			if( fulltext.length == pos ) done = true;
		}
		// add ellipses
		if( fulltext.length != pos )
			snip_text += "...";

		// finish processing DOM
		var dom_temp = jsdom.jsdom(snip_text);
		return dom_temp.innerHTML;
	}
	
	this.worker = new function()
	{
		var self = this;
		
		this.readable = function readable(html, callback) {
			dbg.called();
			
			Readability.parse(
				html,
				"",
				function returnResult(result) {
					dbg.called();
			
					if (result.err) {
						callback(result.err);
					}
					else {
						callback(null, result.title, result.content);
					}
				}
			);
		}
	}
};

module.exports = new ContentGrabber();
