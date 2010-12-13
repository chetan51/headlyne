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
 * The database mocker class
 */
var DatabaseMocker = function() {

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
			    errback(err);
		    },
		    function()
		    {
			callback();
		    }
		);
	}
	
	this.tearDown = function(collection, callback, errback)
	{
		DatabaseDriver.getCollection(
			collection,
			function(err)
			{
				errback(err);
			},
			function(collection)
			{
				collection.remove(
					function(err, doc)
					{
						if(err != null)
							errback(err);
						else {
							DatabaseDriver.close();
							callback();
						}
					}
				);
			}
		);
	}
};

module.exports = new DatabaseMocker();
