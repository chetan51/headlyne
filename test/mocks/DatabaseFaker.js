/*  
 *	This allows database initialization and destruction for testing
 *	Headlyne modules.
 */

/*
 * Module dependencies
 */
var DatabaseDriver = require('../../src/libraries/DatabaseDriver.js'),
    Step           = require('step');

/**
 * Constants
 **/
var db_name = 'headlyne_test',
    db_addr = '127.0.0.1',
    db_port = 27017,
    db_user = 'username',
    db_pass = 'password';

/*
 * The database faker class
 */
var DatabaseFaker = function()
{
	var self = this;

	this.setUp = function(clear_collections, callback)
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
					callback(err);
				}
				else {
					Step(
						function clearCollections() {
							var step = this;
							
							clear_collections.forEach(
								function (collection) {
									self.clear(
										collection,
										step.parallel()
									);
								}
							);
						},
						function done(err) {
							callback(err);
						}
					);
				}
			}
		);
	}
	
	this.clear = function(collection, callback)
	{
		DatabaseDriver.getCollection(
			collection,
			function(err, collection)
			{
				if (err) {
					callback(err);
				}
				else {
					collection.remove(
						function(err, doc)
						{
							if(err != null)
								callback(err);
							else {
								callback(null);
							}
						}
					);
				}
			}
		);
	}
	
	this.tearDown = function(clear_collections, callback)
	{
		Step(
			function clearCollections() {
				var step = this;
				
				clear_collections.forEach(
					function (collection) {
						self.clear(
							collection,
							step.parallel()
						);
					}
				);
			},
			function done(err) {
				DatabaseDriver.close();
				callback(err);
			}
		);
	}
};

module.exports = new DatabaseFaker();
