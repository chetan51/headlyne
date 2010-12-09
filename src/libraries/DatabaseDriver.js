/**
 * Dependencies
 **/
var Mongo      = require('mongodb'),
    Db         = Mongo.Db,
    Connection = Mongo.Connection,
    Server     = Mongo.Server,
    BSON       = Mongo.BSONPure;


/**
 *	Provides functions for interfacing with the database.
 **/
var DatabaseDriver = function()
{
	/**
	 *	Class variables
	 */
	this.database = {};    // database connection information
	
	/**
	 *	Initializes the Database Driver with what database
	 *	connection to use.
	 **/
	this.init = function(name, address, port, username, password)
	{
		this.database.name     = name;
		this.database.address  = address;
		this.database.port     = port;
		this.database.username = username;
		this.database.password = password;
	}
	
	/**
	 *	Gets a specified collection from the database.
	 **/
	this.getCollection = function(collection_name, errback, callback)
	{
		var db = new Db(
				this.database.name,
		                new Server(
		                    this.database.address,
		                    this.database.port,
		                    {}
		                )
		);
		//db.authenticate(db_user, db_port))
		db.open(
			function(err, db2)
			{
			if(err != null) {
				errback(new Error('Database Connection Error'));
			} else {
				db2.collection(
					collection_name,
					function(err, collection)
					{
						if(err != null) {
							errback(new Error('Database Access Error'));
						} else {
							callback(collection);
						}
					}
				);
			}
			}
		);
	}
	
	/**
	 *	Checks if an object exists in the collection for a given
	 *	key. If it doesn't exist, it inserts the given object at
	 *	the given key location.
	 **/
	this.ensureExists = function(collection, key, obj, errback, callback)
	{
		collection.findOne(
			key,
			function(err, doc)
			{
				if(err != null)
					errback(new Error('Database Search Error'));
				else {
					if(typeof(doc) == 'undefined') {
						collection.insert(
							obj,
							function(err, inserted_docs)
							{
								if(err != null)
									errback(new Error('Database Insertion Error'));
								else
									callback(inserted_docs[0]);
							}
						);
					} else {
						callback(doc);
					}
				}
			}
		);
	}
};

module.exports = new DatabaseDriver();
