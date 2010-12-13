/**
 * This is the setup_script, to set up the database,
 * with keys, usernames, etc.
 **/

/**
 * Database Driver
 **/
var Mongo      = require('mongodb'),
    Db         = Mongo.Db,
    Connection = Mongo.Connection,
    Server     = Mongo.Server,
    BSON       = Mongo.BSONPure;

/**
 * DB Access Parameters
 **/
var db_name = 'headlyne',
    db_addr = '127.0.0.1',
    db_port = 27017,
    db_user = 'username',
    db_pass = 'password';

var db = new Db(db_name, new Server(db_addr, db_port, {}));
db.open(
	function(err, db2)
	{
		console.log(err);
		db2.collection(
			'feeds',
			function(err, clect)
			{
				if(clect == null)
					console.log('null');

				clect.ensureIndex(
					{'url_hash': 1},
					true,
					function(err, inserted_docs)
					{
						console.log(err);
					}
				);
				db.close();
				db2.close();
			}
		);
	}
);
