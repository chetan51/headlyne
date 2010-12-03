var FeedParser = function() {

this.parse = function(rss)
{
	var xmlobject= (new DOMParser()).parseFromString(rss, "text/xml");
	return xmlobject;
}

this.stripURLs = function(str)
{
	return str;
}

};

module.exports = new FeedParser();
