/*  
 *	This allows database initialization and destruction for testing
 *	Headlyne modules.
 */

/*
 * Module dependencies
 */
var DatabaseDriver = require('../../src/libraries/DatabaseDriver.js');

/**
 * Constants
 **/
var db_name = 'headlyne',
    db_addr = '127.0.0.1',
    db_port = 27017,
    db_user = 'username',
    db_pass = 'password';

/*
 * The database faker class
 */
var DatabaseFaker = function() {

	this.setUp = function(callback, errback)
	{
		DatabaseDriver.init(
			db_name,
			db_addr,
			db_port,
			db_user,
			db_pass,
			function(err)
			{
				if (err) {
					errback(err);
				}
				else {
					callback();
				}
			}
		);
	}
	
	this.clear = function(collection, callback, errback)
	{
		DatabaseDriver.getCollection(
			collection,
			function(err, collection)
			{
				if (err) {
					errback(err);
				}
				else {
					collection.remove(
						function(err, doc)
						{
							if(err != null)
								errback(err);
							else {
								callback();
							}
						}
					);
				}
			}
		);
	}
	
	this.tearDown = function()
	{
		DatabaseDriver.close();
	}
};

module.exports = new DatabaseFaker();
