var xml = require('./node-xml')

var FeedParser = function() {
	
	this.parse = function(rss, callback)
	{
		var items=[];		//the items returned via the callback.
		var cur_item=0;		//the number of the current item.
		var type='';		//Type of feed: rss or atom.0.91, rss 0.92, rss 2.0, feed xmlns="http://www.w3.org/2005/Atom"
		var version='';		//Version: 0.91, 0.92, 2.0, or 1.0. Undefined: 0.
		
		var tagstack=[];	//A stack of tags the current tag is in.
		var chtitle='';
		var chlink='';
		var chdesc='';

		var content='';
		var rellink;		//set to true ONLY if link is rel=alternate, for atom.
		var pureswitch;		//With atom, if type = 'html' or 'xhtml' for an element, it can contain markup.
					//If pureswitch=x, then until the matching close tag (at depth x), add everything to content.

		var parser = new xml.SaxParser(function(cb) {
			cb.onStartDocument(function(){
				tagstack.push('root');
				pureswitch=0;
				rellink=false;
				items[0] = ['','',''];
			});

			cb.onEndDocument(function() { items.pop(); callback(items);});

			cb.onStartElementNS(function(elem, attrs, prefix, uri, namespaces) {
				if(pureswitch) //add the tag as the content, NOT xml.
				{
					content+="<"+prefix+":"+elem+" ";
					for(i in attrs)
						content+=attrs[i][0]+"="+attrs[i][1]+" ";
					content+=">";
				}
				else
				{
					for(i in attrs)
					{
						if(attrs[i][0] == 'type'){
							if(attrs[i][1] == 'html' || attrs[i][1] == 'xhtml'){
								pureswitch = tagstack.length;
							}
						}
					}
					switch(elem.toLowerCase())
					{
						case 'feed':			//IF i have opened a feed tag, get the xmlns to confirm as Atom
							type='atom'; version=0;
							for(i in attrs)
							{
								if(attrs[i][0] == 'xmlns'){
									if(attrs[i][1] == 'http://www.w3.org/2005/Atom'){
										version=1;
										break;
									}
								}
							}
							break;
						case 'rss':			//If i have opened a rss tag, get the version.
							type='rss'; version=0;
							for(i in attrs)
							{
								if(attrs[i][0] == 'version'){
									version=attrs[i][1];
									break;
								}
							}
							break;
						case 'link':
							for(i in attrs)
							{
								if(attrs[i][0] == 'rel'){
									if(attrs[i][1] == 'alternate'){
										rellink=true;
										break;
									}
								}
							}
							break;
					}
				}
				tagstack.push(elem.toLowerCase());
				
			});
			cb.onEndElementNS(function(elem, prefix, uri) {
				if(pureswitch)
				{
					content+="</"+prefix+":"+elem+">";
				}
				else{
					if(tagstack[tagstack.length-2] == 'channel' || tagstack[tagstack.length-2] == 'feed')
					{
						switch(elem.toLowerCase())
						{
							case 'title':
								chtitle=content;
								break;
							case 'link':
								if(type=='atom'){
									if(rellink==true){
										chlink=content;
										rellink=false;
									}
								}else	chlink=content;
								
								break;
							case 'description':
							case 'subtitle':
								chdesc=content;
								break;
						}
					}
					else if(tagstack[tagstack.length -2] == 'item' || tagstack[tagstack.length -2] == 'entry')
					{
						switch(elem.toLowerCase())
						{
							case 'title':
								items[cur_item][0] = content;
								break;
							case 'link':
								if(type=='atom'){
									if(rellink==true){
										items[cur_item][1]=content;
										rellink=false;
									}
								}else	items[cur_item][1]=content;
								break;
							case 'content':
							case 'description':
								items[cur_item][2]=content;
						}
					}
					else{ //its parent isn't the channel or an item, so we don't care.
					}
					if(elem.toLowerCase() == 'item' || elem.toLowerCase() == 'entry')
					{
						cur_item++; items[cur_item]=['','',''];
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
			});
		});

		parser.parseString(rss);
	}
	
	this.stripURLs = function(str)
	{
		return str;
	}
	
};

module.exports = new FeedParser();
