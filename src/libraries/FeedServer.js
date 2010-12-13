/**
 *	FeedServer
 * 
 *		Provides methods for retrieval of feeds and their content,
 *		integrating the downloader, content grabber and the database.
 **/

/**
 *	Module dependencies
 **/
var Downloader     = require('./Downloader.js'),
    ContentGrabber = require('./ContentGrabber.js'),
    FeedModel      = require('../models/Feed.js');

/**
 *	The FeedServer library
 **/
var FeedServer = function()
{    
	var thisFeedServer = this;
	
};

/**
 *	Exports the FeedServer library
 **/
module.exports = new FeedServer();
