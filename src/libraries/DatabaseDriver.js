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
	var self = this;
	
	/**
	 *	Initializes the Database Driver with what database
	 *	connection to use.
	 **/
	this.init = function(name, address, port, username, password, callback)
	{
		self.database.name     = name;
		self.database.address  = address;
		self.database.port     = port;
		self.database.username = username;
		self.database.password = password;
		
		self.database.db = new Db(
				self.database.name,
		                new Server(
		                    self.database.address,
		                    self.database.port,
		                    {}
		                )
		);
		//db.authenticate(db_user, db_port))
		self.database.db.open(
			function(err, db2)
			{
				if(err != null)
					callback(new Error('Database Connection Error: '+err.message));
				else {
					self.database.db = db2;
					callback(null);
				}
			}
		);
	}

	/**
	 * 	Terminates the database connection.
	 **/
	this.close = function()
	{
		self.database.db.close();
	}
	
	/**
	 *	Gets a specified collection from the database.
	 **/
	this.getCollection = function(collection_name, callback)
	{
		self.database.db.collection(
			collection_name,
			function(err, collection)
			{
				if(err != null) {
					callback(new Error('Database Access Error: '+err.message));
				} else {
					callback(null, collection);
				}
			}
		);
	}
	
	/**
	 *	Checks if an object exists in the collection for a given
	 *	key. If it doesn't exist, it inserts the given object at
	 *	the given key location. Otherwise, it returns an error.
	 **/
	this.ensureInsert = function(collection, key, obj, callback)
	{
		collection.findOne(
			key,
			function(err, doc)
			{
				if(err != null)
					callback(new Error('Database Search Error'));
				else {
					if(typeof(doc) == 'undefined') {
						collection.insert(
							obj,
							function(err, inserted_docs)
							{
								//console.log(inserted_docs);
								callback(err, inserted_docs[0]);
								/*if(err != null)
									callback(new Error('Database Insertion Error'));
								else
									callback(null, inserted_docs[0]);*/
							}
						);
					} else {
						callback(new Error('Database match exists'));
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
	this.ensureExists = function(collection, key, obj, callback)
	{
		collection.findOne(
			key,
			function(err, doc)
			{
				if(err != null)
					callback(new Error('Database Search Error'));
				else {
					if(typeof(doc) == 'undefined') {
						collection.insert(
							obj,
							function(err, inserted_docs)
							{
								if(err != null)
									callback(new Error('Database Insertion Error'));
								else
									callback(null, inserted_docs[0]);
							}
						);
					} else {
						callback(null, doc);
					}
				}
			}
		);
	}
	
	/**
	 *	Checks if an object exists in the collection for a given
	 *	key. If it doesn't exist, it inserts the given object at
	 *	the given key location. If it does exist, it overwrites
	 *	it with the given object.
	 **/
	this.overwrite = function(collection, key, obj, callback)
	{
		collection.remove(
			key,
			function(err)
			{
				if(err != null)
					callback(new Error('Database Delete Error'));
				else {
					collection.insert(
						obj,
						function(err, inserted_docs)
						{
							if(err != null)
								callback(new Error('Database Insertion Error'));
							else
								callback(null, inserted_docs[0]);
						}
					);
				}
			}
		);
	}

	/**
	 * 	Updates all objects matching the key with the given obj_part
	 **/
	this.update = function(collection, key, obj_part, callback)
	{
		collection.update(
			key,
			obj_part,
			function(err, doc)
			{
				if(err != null)
					callback(new Error('Database Update Error:'+ err.message));
				else {
					callback(null, doc);
				}
			}
		);
	}
};

module.exports = new DatabaseDriver();
