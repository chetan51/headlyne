var http = require('http')
var nodeunit = require('nodeunit');
var WebPageModel = require('../../src/models/WebPage.js');
var DatabaseDriver = require('../../src/libraries/DatabaseDriver.js');
var Mongo      = require('mongodb'),
    Db         = Mongo.Db,
    Connection = Mongo.Connection,
    Server     = Mongo.Server,
    BSON       = Mongo.BSONPure;


exports['save'] = nodeunit.testCase(
{
	setUp: function (callback) {
		/**
		 * DB Access Parameters
		 **/
		var db_name = 'headlyne',
		    db_addr = '127.0.0.1',
		    db_port = 27017,
		    db_user = 'username',
		    db_pass = 'password';

		DatabaseDriver.init(
		    db_name,
		    db_addr,
		    db_port,
		    db_user,
		    db_pass,
		    function(err)
		    {
			    console.log('Suite-setup: '+err.message);
		    },
		    function()
		    {
			    callback();
		    }
		);
	},
	 
	tearDown: function (callback) {
		DatabaseDriver.getCollection(
			'webpages',
			function(err)
			{
				console.log('Suite-teardown: '+err.message);
			},
			function(collection)
			{
				collection.remove(
					function(err, doc)
					{
						if(err != null)
							console.log('Test-suite cannot terminate.');
						else {
							DatabaseDriver.close();
							callback();
						}
					}
				);
			}
		);
	},

	'basic': function(test)
	{
		test.expect(1);
		WebPageModel.save(
			'url',
			'titles',
			'readable content',
			function(err)
			{
				console.log(err.message);
			},
			function(webpage)
			{
				console.log(webpage.url_hash);
			}
		);
		test.ok(1);
		test.done();
	},

	'double save': function(test)
	{
		test.expect(2);
		WebPageModel.save(
			'doubled_url',
			'title',
			'Readable page',
			function(err)
			{
				console.log(err.message);
				test.done();
			},
			function(webpage)
			{
				WebPageModel.save(
					'doubled_url',
					'diff_title',
					'Page already seen.',
					function(err)
					{
						console.log(err.message);
						test.done();
					},
					function(page2)
					{
						test.equal(webpage.url_hash, page2.url_hash);
						test.equal(page2.body, 'Readable page');
						test.done();
					}
				);
			}
		);
	}
});

exports['get'] = nodeunit.testCase(
{
	setUp: function (callback) {
		/**
		 * DB Access Parameters
		 **/
		var db_name = 'headlyne',
		    db_addr = '127.0.0.1',
		    db_port = 27017,
		    db_user = 'username',
		    db_pass = 'password';

		DatabaseDriver.init(
		    db_name,
		    db_addr,
		    db_port,
		    db_user,
		    db_pass,
		    function(err)
		    {
			    console.log('Suite-setup: '+err.message);
		    },
		    function()
		    {
			    callback();
		    }
		);
	},
	 
	tearDown: function (callback) {
		DatabaseDriver.getCollection(
			'webpages',
			function(err)
			{
				console.log('Suite-teardown: '+err.message);
			},
			function(collection)
			{
				collection.remove(
					function(err, doc)
					{
						if(err != null)
							console.log('Test-suite cannot terminate.');
						else {
							DatabaseDriver.close();
							callback();
						}
					}
				);
			}
		);
	},

	'save & retrieve': function(test)
	{
		test.expect(2);
		WebPageModel.save(
			'to_get_url',
			'some_title',
			'<markup></markup>',
			function(err)
			{
				console.log(err.message);
				test.done();
			},
			function(webpage)
			{
				WebPageModel.get(
					'to_get_url',
					function(err){
						console.log(err.message);
						test.done();
					},
					function(recv_page)
					{
						test.equal(recv_page.title, 'some_title');
						test.equal(recv_page.body, '<markup></markup>');
						test.done();
					}
				);
			}
		);
	},

	'invalid': function(test)
	{
		test.expect(1);
		WebPageModel.get(
			'invalid url',
			function(err)
			{
				test.equal(err.message, 'No such WebPage');
				test.done();
			},
			function(webpage)
			{
				test.done();
			}
		);
	}
});
