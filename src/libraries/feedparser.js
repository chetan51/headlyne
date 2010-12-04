var xml = require('node-xml');

var FeedParser = function() {
	
	/* parse(rss, callback):
	 * Parses a string in 'rss' into a set of objects.
	 * Callback = function(channelinfo, items, type, version):
	 * channelinfo: array of [key, value] pairs.
	 * keys: title, link, and description.
	 *
	 * items: array of the items from the feed.
	 *         Each item has an array of [key, value] pairs.
	 *         keys: title, link, and description.
	 *
	 * Parse supports Atom's 'html' and 'xhtml' types,
	 * adding the internal XML as a string content.
	 *
	 * Type: type of the feed. ('atom' or 'rss')
	 * Version: 0 if the version cannot be detected. Otherwise the version number.
	 */
	
	
	/* Example Usage:
	 * FeedParser.parse(string,
	 *      function(channelinfo, items, type, version)
	 *      {
	 *      	for(i in channelinfo)
	 *      		console.log(channelinfo[i][0] + channelinfo[i][1]);
	 *      	for(i in items)
	 *      	{
	 *      		for(j in items[i])
	 *      			console.log(items[i][j][0] + items[i][j][1]);
	 *      	}
	 *      }
	 * );
	 */

	this.parse = function(rss, callback, errback, timeout)
	{
		var items=[];		// The items returned via the callback.
		var channelinfo=[];	// The channel information returned via the callback.
		
		var cur_item=0;		// The number of the current item.
		var type='';		// Type of feed: rss or atom.0.91, rss 0.92, rss 2.0, feed xmlns="http://www.w3.org/2005/Atom"
		var version='';		// Version: 0.91, 0.92, 2.0, or 1.0. Undefined: 0.
		
		var tagstack=[];	// A stack of tags the current tag is in.
		
		var content='';
		var rellink;		// Set to true ONLY if link is rel=alternate, for atom.
		var pureswitch;		// With atom, if type = 'html' or 'xhtml' for an element, it can contain markup.
					// If pureswitch=x, then until the matching close tag (at depth x), add everything to content.
		var result=false;	// set to true on end document/error. If no result after time out, return error.


		var parser = new xml.SaxParser(function(cb) {
			cb.onStartDocument(function() {
				tagstack.push('root');
				pureswitch=0;
				rellink=false;
				items[0] = [];
			});

			cb.onEndDocument(function() {
				if(!result) {
					items.pop();
					result=true;
					callback(channelinfo, items, type, version);
				}
			});
			
			cb.onStartElementNS(function(elem, attrs, prefix, uri, namespaces) {
				if(pureswitch) // add the tag as the content, NOT xml.
				{
					content+="<"+prefix+":"+elem+" ";
					for(i in attrs)
						content+=attrs[i][0]+"="+attrs[i][1]+" ";
					content+=">";
					
				} else {
					for(i in attrs) {
						if(attrs[i][0] == 'type')
						{
							if(attrs[i][1] == 'html' || attrs[i][1] == 'xhtml')
							{
								pureswitch = tagstack.length;
							}
						}
					}
					
					switch(elem.toLowerCase())
					{
						case 'feed':                    // If I have opened a feed tag, get the xmlns to confirm as Atom
							type='atom'; version=0;
							for(i in attrs) {
								if(attrs[i][0] == 'xmlns'){
									if(attrs[i][1] == 'http://www.w3.org/2005/Atom'){
										version=1;
										break;
									}
								}
							}
							break;
						case 'rss':                     // If I have opened a rss tag, get the version.
							type='rss'; version=0;
							for(i in attrs) {
								if(attrs[i][0] == 'version') {
									version=attrs[i][1];
									break;
								}
							}
							break;
						case 'link':
							for(i in attrs) {
								if(attrs[i][0] == 'rel') {
									if(attrs[i][1] == 'alternate') {
										rellink=true;
										break;
									}
								}
							}
							break;
					}
					content='';
				}
				tagstack.push(elem.toLowerCase());
			}); // End cb.onStartElementNS
			
			cb.onEndElementNS(function(elem, prefix, uri) {
				if(pureswitch) {
					content+="</"+prefix+":"+elem+">";
				} else {
					if(tagstack[tagstack.length-2] == 'channel' ||
					        tagstack[tagstack.length-2] == 'feed') {
						
						switch(elem.toLowerCase())
						{
							case 'title':
								channelinfo.push(['title', content]);
								break;
							case 'link':
								if(type=='atom') {
									if(rellink==true) {
										channelinfo.push(['link',content]);
										rellink=false;
									}
								} else	channelinfo.push(['link',content]);
								
								break;
							case 'description':
							case 'subtitle':
								channelinfo.push(['description',content]);
								break;
						}
					} else if(tagstack[tagstack.length -2] == 'item' ||
					        tagstack[tagstack.length -2] == 'entry') {
						
						switch(elem.toLowerCase())
						{
							case 'title':
								items[cur_item].push(['title',content]);
								break;
							case 'link':
								if(type=='atom') {
									if(rellink==true) {
										items[cur_item].push(['link',content]);
										rellink=false;
									}
								} else	items[cur_item].push(['link',content]);
								break;
							case 'content':
							case 'description':
								items[cur_item].push(['description',content]);
								break;
						}
					} else { }  //its parent isn't the channel or an item, so we don't care.
					
					if(elem.toLowerCase() == 'item' || elem.toLowerCase() == 'entry') {
						cur_item++; items[cur_item]=[];
					}
					
					content='';
				}
				tagstack.pop();
				if(tagstack.length == pureswitch) pureswitch = 0;
			});
			
			cb.onCharacters(function(str) {
				content+=str;
			});
			
			cb.onCdata(function(cmt) {
			});
			cb.onComment(function(cmt) {
			});
			cb.onWarning(function(warn) {
			});
			
			cb.onError(function(err) {
				if(!result) {
					result=true;
					errback(new Error(err));
				}
			});
		}); // End xml.SAXParser creation.
		
		if(timeout == null || typeof(timeout) == 'undefined')
			timeout=2000;
		
		setTimeout(function() {
			if(!result) {
				errback(new Error('Parser timed out.'));
				result=true;
			}
		}, timeout);

		parser.parseString(rss);
		
	}   // End parse(url, callback, errback)

	/* stripURLs(string): 
	 * Takes a string and returns an array of the URLs it contains.
	 * 
	 * Supports http/https protocols ONLY.
	 *
	 */
	this.stripURLs = function(str)
	{
		geturl = new RegExp("(^|[ \t\r\n])((http|https):(([A-Za-z0-9$_.+!*(),;/?:@&~=-])|%[A-Fa-f0-9]{2}){2,}(#([a-zA-Z0-9][a-zA-Z0-9$_.+!*(),;/?:@&~=%-]*))?([A-Za-z0-9$_+!*();/?:~-]))"
		        ,"g"
		);
		
		var urls = str.match(geturl);
		
		// Now, strip the leading ' ', tab, return or newline, if it exists
		for(i in urls) {
			if( urls[i][0] == ' ' || urls[i][0] == '\t' ||
				urls[i][0] == '\r' || urls[i][0] == '\n')
			{
				urls[i] = urls[i].slice(1);
			}
		}
		return urls;
	}
};

module.exports = new FeedParser();

