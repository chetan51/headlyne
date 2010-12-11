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
	this.init = function(
		name,
		address,
		port,
		username,
		password,
		errback,
		callback    )
	{
		this.database.name     = name;
		this.database.address  = address;
		this.database.port     = port;
		this.database.username = username;
		this.database.password = password;

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
				if(err != null)
					errback(new Error('Database Connection Error'));
				else {
					this.database.db = db2;
					callback();
				}
			}
		);
	}
	
	/**
	 *	Gets a specified collection from the database.
	 **/
	this.getCollection = function(collection_name, errback, callback)
	{
		this.database.db.collection(
			collection_name,
			function(err, collection)
			{
				if(err != null) {
					errback(new Error('Database Access Error'+err.message));
				} else {
					callback(collection);
				}
			}
		);
	}
	
	/**
	 *	Checks if an object exists in the collection for a given
	 *	key. If it doesn't exist, it inserts the given object at
	 *	the given key location. Otherwise, it returns an error.
	 **/
	this.ensureInsert = function(collection, key, obj, errback, callback)
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
						errback(new Error('Database match exists'));
					}
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

	/**
	 * 	Updates all objects matching the key with the given obj_part
	 **/
	this.update = function(collection, key, obj_part, errback, callback)
	{
		collection.update(
			key,
			obj_part,
			function(err, doc)
			{
				if(err != null)
					errback(new Error('Database Update Error:'+ err.message));
				else {
					callback(doc);
				}
			}
		);
	}

	/**
	 * 	Terminates the database connection.
	 **/
	this.close = function()
	{
		this.database.db.close();
	}
};

module.exports = new DatabaseDriver();
