/**
 * Dependencies
 **/
var xml = require('node-xml'),
    dbg = require('../../src/libraries/Debugger.js'),
    Ni  = require('ni');


/**
 * FeedParser: object that handles everything from
 * taking a string representing a feed and providing
 * access to all necessary parts of it.
 **/

var FeedParser = function()
{
	
	/**
	 * parse(rss, callback):
	 * Parses a string in 'rss' into a set of objects.
	 * Callback = function(err, feed):
	 * feed: {
	 * 	title,
	 * 	link,
	 * 	description,
	 * 	items: [
	 * 		{
	 * 			title,
	 * 			link,
	 * 			description
	 * 		}
	 * 	]
	 * 	
	 * Parse supports Atom's 'html' and 'xhtml' types,
	 * adding the internal XML as a string content.
	 *
	 * Type: type of the feed. ('atom' or 'rss')
	 * Version: 0 if the version cannot be detected. Otherwise the version number.
	 **/
	
	this.parse = function parse(rss, callback)
	{
		dbg.called();
		
		var feed = {};          // the feed item to be returned via the callback.
		var items=[];           // the items returned via the callback.
		
		var cur_item=0;         // the number of the current item.
		var type='';            // type of feed: rss or atom.
		var version='';         // version: 0.91, 0.92, 2.0, or 1.0. Undefined: 0.
		
		var tagstack=[];        // a stack of tags the current tag is in.
		
		var content='';
		var rellink;            // set to true ONLY if atom link is rel=alternate

		var pureswitch;         // with atom, if type = 'html' or 'xhtml' for an
		                        // element, it can contain markup. if pureswitch=x,
		                        // then until the matching close tag (at depth x)
		                        // add everything to content.

		var result=false;       // set to true on end document/error.
		                        // if no result after time out, return error.

		var timeout = setTimeout(function parsingTimeOut() {
			dbg.called();
		
			if(!result) {
				callback(new Error('Parser timed out.'));
				result=true;
			}
		}, Ni.config('feedparse_timeout'));

		/**
		 * This is the xml parser from node-xml.
		 * We define callback functions that are triggered
		 * when the corresponding event occurs.
		 **/
		var parser = new xml.SaxParser(function initializeParser(cb)
		{
			dbg.called();
		
			/**
			 * Initialize parser
			 **/
			cb.onStartDocument(
				function startDocument() {
					dbg.called();
		
					tagstack.push('root');
					pureswitch=0;
					rellink=false;
				}
			);

			cb.onEndDocument(
				function endDocument() {
					dbg.called();
		
					if(!result) {
						result=true;
						feed.items = items;
						callback(null, feed);
						
						clearTimeout(timeout);
					}
				}
			);
			
			cb.onError(
				function processError(err) {
					dbg.called();
		
					if(!result) {
						result=true;
						callback(new Error(err));
						
						clearTimeout(timeout);
					}
				}
			);

			/**
			 * textifyOpenTag(elem, prefix, attrs)
			 * 
			 * Add <prefix:elem attr[i][0]=attr[i][1] ...>
			 * to the content block.
			 **/
			function textifyOpenTag(elem, prefix, attrs)
			{
				content +=
					"<"     +
					prefix  +
					":"     +
					elem    +
					" ";
				
				for(i in attrs)
				{
					content +=
						attrs[i][0] +
						"="         +
						attrs[i][1] +
						" ";
				}
				content += ">";
			}

			/**
			 * textifyCloseTag(elem, prefix)
			 * 
			 * Add </prefix:elem> to the content block.
			 **/
			function textifyCloseTag(elem, prefix)
			{
				content+="</"+prefix+":"+elem+">";
			}

			/**
			 * switchPure(attrs)
			 * 
			 * If a tag has type='html' or 'xhtml' as an attribute,
			 * set pureswitch to the tree-depth of that tag.
			 **/
			function switchPure(attrs)
			{
				for(i in attrs)
				{
					if(attrs[i][0] == 'type') {
						if(attrs[i][1] == 'html' ||
						   attrs[i][1] == 'xhtml') {
							pureswitch = tagstack.length;
						}
					}
				}
			}

			/**
			 * getAtomVersion(attrs)
			 * 
			 * Simply checks an Atom open tag for its xmlns -- if it is
			 * correct, sets the version to 1. Otherwise, defaults
			 * to atom, version 0.
			 **/
			function getAtomVersion(attrs)
			{
				type='atom'; version=0;
				for(i in attrs)
				{
					if(attrs[i][0] == 'xmlns') {
						if(attrs[i][1] == 'http://www.w3.org/2005/Atom') {
							version=1;
							break;
						}
					}
				}
			}
			
			/**
			 * getRSSVersion(attrs)
			 * 
			 * Simply checks an RSS open tag for its version.
			 * If it doesn't exist, it defaults to 0.
			 **/
			function getRSSVersion(attrs)
			{
				type='rss';
				version=0;
				for(i in attrs)
				{
					if(attrs[i][0] == 'version') {
						version=attrs[i][1];
						break;
					}
				}
			}
			
			/**
			 * checkRelAlternate(attrs)
			 * 
			 * Checks for a rel attribute. If it exists and
			 * is set to 'alternate', enables rellink=true.
			 **/
			function checkRelAlternate(attrs)
			{
				for(i in attrs)
				{
					if(attrs[i][0] == 'rel') {
						if(attrs[i][1] == 'alternate') {
							rellink=true;
							break;
						}
					}
				}
			}
			
			/**
			 * saveChannelInfo(elem)
			 * 
			 * Triggered when a close tag is encountered inside a
			 * channel, save the content of this tag in channel_info.
			 **/
			function saveChannelInfo(elem)
			{
				switch(elem.toLowerCase())
				{
					case 'title':
						feed.title = content;
						break;
					case 'link':
						if(type=='atom') {
							if(rellink==true) {
								feed.link = content;
								rellink=false;
							}
						} else {
							feed.link = content;
						}
						break;
					case 'description':
						feed.description = content;
						break;
				}
			}
			
			/**
			 * saveItemInfo(elem)
			 * 
			 * Triggered when a close tag is encountered inside an
			 * item, save the content of this tag in the current item.
			 **/
			function saveItemInfo(elem)
			{
				if (!items[cur_item]) {
					items[cur_item] = {};
				}
				
				switch(elem.toLowerCase())
				{
					case 'title':
						items[cur_item].title = content;
						break;
					case 'link':
						if(type=='atom') {
							if(rellink==true) {
								items[cur_item].link = content;
								rellink=false;
							}
						} else	{
							items[cur_item].link = content;
						}
						break;
					case 'description':
						items[cur_item].description = content;
						break;
				}
			}

			cb.onStartElementNS(
				function processStartOfElement(elem, attrs, prefix, uri, namespaces)
				{
					if(pureswitch) {
						textifyOpenTag(elem, prefix, attrs);
					} else {
						// check if pureswitch should be enabled
						switchPure(attrs);

						// processing for some open tags
						switch(elem.toLowerCase())
						{
							// If I have opened a feed tag, get the xmlns to confirm as Atom
							case 'feed':
								getAtomVersion(attrs);
								break;

							// If I have opened a rss tag, get the version.
							case 'rss':
								getRSSVersion(attrs);
								break;
							
							// If I have opened a link, check if it has a rel=alternate.
							case 'link':
								checkRelAlternate(attrs);
								break;
						}
						content='';
					}
					tagstack.push(elem.toLowerCase());
				}
			);

			cb.onEndElementNS(
				function processEndOfElement(elem, prefix, uri)
				{
					if(pureswitch) {
						textifyCloseTag(elem, prefix);
					} else {
						if(  tagstack[tagstack.length-2] == 'channel' ||
						     tagstack[tagstack.length-2] == 'feed') {
							saveChannelInfo(elem);
						} else if(  tagstack[tagstack.length -2] == 'item' ||
						            tagstack[tagstack.length -2] == 'entry') {
							saveItemInfo(elem);
						}

						// if we are closing an item/entry, increment counter.
						if(  elem.toLowerCase() == 'item' ||
						     elem.toLowerCase() == 'entry') {
							cur_item++;
						}
						content='';
					}
					tagstack.pop();

					// if we are out of the pure block,
					// reset the switch.
					if(tagstack.length == pureswitch)
						pureswitch = 0;
				}
			);
			
			cb.onCharacters(function processCharacter(str) {
				content+=str;
			});
			
			cb.onCdata(function(cmt) {
			});
			cb.onComment(function(cmt) {
			});
			cb.onWarning(function(warn) {
			});
			
		}); // End xml.SAXParser creation.
		
		parser.parseString(rss);
		
	}   // End parse(url, callback, callback)

	/**
	 * stripURLs(string): 
	 * Takes a string and returns an array of the URLs it contains.
	 * 
	 * Supports http/https protocols ONLY.
	 **/
	this.stripURLs = function stripURLs(str)
	{
		dbg.called();
		
		geturl = new RegExp("(^|[ \t\r\n])((http|https):(([A-Za-z0-9$_.+!*(),;/?:@&~=-])|%[A-Fa-f0-9]{2}){2,}(#([a-zA-Z0-9][a-zA-Z0-9$_.+!*(),;/?:@&~=%-]*))?([A-Za-z0-9$_+!*();/?:~-]))"
		        ,"g"
		);
		
		var urls = str.match(geturl);
		
		// Now, strip the leading ' ', tab, return or newline, if it exists
		for(i in urls) {
			if(  urls[i][0] == ' ' || urls[i][0] == '\t' ||
			     urls[i][0] == '\r' || urls[i][0] == '\n') {
				urls[i] = urls[i].slice(1);
			}
		}
		return urls;
	}
};

module.exports = new FeedParser();

