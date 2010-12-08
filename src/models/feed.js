/**
 * Feed.js is the data model for a feed.
 **/

/**
 * Model dependencies
 **/
var Mongo      = require('../lib/mongodb'),
    Db         = Mongo.Db,
    Connection = Mongo.Connection,
    Server     = Mongo.Server,
    BSON       = Mongo.BSONPure;


var Feed = function()
{
	
	/*
	 * 	Saves a feed to the database.
	 * 	
	 * 		Arguments:    url
	 * 		              title
	 * 		              author
	 * 		              description
	 * 		              
	 *		Returns:      the feed_id of the item that was saved
	 *		              false on error
	 */
	this.save = function(url, title, author, description)
	{
		
	}
	
	/*
	 * 	Gets a feed from the database.
	 * 	
	 * 		Arguments:    feed_id
	 * 		              
	 *		Returns:      JSON object {
	 *		                  feed_id
	 *		                  url
	 *		                  title
	 *		                  author
	 *		                  description
	 *		                  time_modified
	 *		              } if feed exists
	 *		              false if feed doesn't exist
	 */
	this.get = function(feed_id)
	{
		
	}

	/*
	 * 	Checks if a feed is up to date, relative to a given
	 * 	expiry length.
	 * 	
	 * 		Arguments:    feed_id
	 * 		              expiry_length (in minutes)
	 * 		              
	 *		Returns:      true if feed.time_modified
	 *		                  < now - expiry_length
	 *		              false otherwise
	 */
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
					collection.insert(
						[ {'feed_id': 1,
						   'url': str,
						   'url_hash': str,
						   'update_lock': false,
						   'title': str,
						   'author': str,
						   'description': str,
						   'time_modified': t
						} ],
						function(err, inserted_docs)
						{

						}
					);

					collection.findOne(
						{'url_hash': str},
						function(err, match_doc)
						{

						}
					);

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
