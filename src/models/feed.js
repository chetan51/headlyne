/**
 * Feed.js is the data model for a feed.
 **/

/**
 * Dependencies
 **/
var Mongo = require('../lib/mongodb');

var	Db = Mongo.Db,
	Connection = Mongo.Connection,
	Server = Mongo.Server,
	BSON = Mongo.BSONPure;


var Feed = function()
{
// Randomly assorted mongodb code, for get, put:
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
	);
};

module.exports = new Feed();
