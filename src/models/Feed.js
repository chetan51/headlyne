/**
 * Feed.js is the data model for a feed.
 **/

/**
 * Model dependencies
 **/
var Mongo      = require('mongodb'),
    Db         = Mongo.Db,
    Connection = Mongo.Connection,
    Server     = Mongo.Server,
    BSON       = Mongo.BSONPure;
var crypto     = require('crypto');

/**
 * DB Access Parameters
 **/
var db_name = 'headlyne',
    db_addr = '127.0.0.1',
    db_port = 27017,
    db_user = 'username',
    db_pass = 'password';

var Feed = function()
{
	function getCollection(collection_name, errback, callback)
	{
		var db = new Db(db_name, new Server(db_addr, db_port, {}));
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
	
	function ensureExists(collection, key, obj, errback, callback)
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
									callback(inserted_docs[0].url_hash);
							}
						);
					} else {
						callback(doc.url_hash);
					}
				}
			}
		);
	}
	
	/**
	 * Saves a feed to the database.
	 * 	
	 * 	Arguments:    url
	 * 	              title
	 * 	              author
	 * 	              description
	 * 	              
	 * 	Returns:      the feed_id of the item that was saved
	 * 	              false on error
	 **/
	this.save = function(url, title, author, description, errback, callback)
	{
		getCollection(
			'feeds',
			function(err)
			{
				errback(err);
			},
			function(collection)
			{
				var hasher = crypto.createHash('sha512');
				hasher.update(url);
				var url_hash = hasher.digest('hex');
				
				ensureExists(
					collection,
					{'url_hash': url_hash},
					{'url': url,
					 'url_hash': url_hash,
					 'update_lock': false,
					 'title': title,
					 'author': author,
					 'description': description,
					 'time_modified': new Date().getTime()
					},
					function(err)
					{
						errback(err);
						collection.db.close();
					},
					function(feed_id)
					{
						callback(feed_id);
						collection.db.close();
					}
				);
			}
		);
	}
	
	/**
	 * Gets a feed from the database.
	 * 
	 * 	Arguments:    feed_id
	 * 	              
	 * 	Returns:      JSON object {
	 * 	                  feed_id
	 * 	                  url
	 * 	                  title
	 * 	                  author
	 * 	                  description
	 * 	                  time_modified
	 * 	              }
	 **/
	this.get = function(feed_id, errback, callback)
	{
		getCollection(
			'feeds',
			function(err)
			{
				errback(err);
			},
			function(collection)
			{
				collection.findOne(
					{'url_hash': feed_id},
					function(err, doc)
					{
						if(err != null)
							errback(new Error('Database Search Error'));
						else {
							if(typeof(doc) == 'undefined') {
								errback(new Error('No such feed'));
							} else {
								callback(doc);
							}
						}
					}
				);
			}
		);
	}

	/**
	 * Checks if a feed is up to date, relative to a given
	 * expiry length.
	 * 
	 * 	Arguments:    feed_id
	 * 	              expiry_length (in minutes)
	 * 	              
	 * 	Returns:      true if feed.time_modified
	 * 	                  < now - expiry_length
	 * 	              false otherwise
	 **/
	this.isUpToDate = function(feed_id, expiry_length)
	{
		
	}

/*// Randomly assorted mongodb code, for get, put:
	var db = new Db('headlyne', new Server("127.0.0.1", 27017, {}));
	db.open(
		function(err, db2)
		{
			db2.collection(
				'feeds',
				function(err, collection)
				{

					collection.update(
						{'feed_id': 123},
						{$set:{'time_modified':12days}},
						function(err, updated_doc)
						{
						}
					);
					collection.remove(
						{'feed_id': 124},
						function(err, removed)
						{
						}
					);

					db.close();
					db2.close();
				}
			);
		}
	);*/
};

module.exports = new Feed();
