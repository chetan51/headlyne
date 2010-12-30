/* Dependencies */
var jsdom       = require('jsdom');
var path        = require('path');
var Readability = require('readability');
var Ni          = require('ni');

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
	
	/**
	 * snip -- takes full (readable) text as an argument,
	 * 	and returns snippet text in its place.
	 *
	 * 	Arguments: fulltext
	 *
	 * 	Returns: snippet text.
	 **/
	this.snip = function(fulltext)
	{
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
									console.log(image_count);
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
		var dom_temp = jsdom.jsdom(snip_text);
		return dom_temp.innerHTML;
	}
};

module.exports = new ContentGrabber();
