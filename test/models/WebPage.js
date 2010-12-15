var http = require('http')
var nodeunit = require('nodeunit');
var WebPageModel = require('../../src/models/WebPage.js');
var DatabaseDriver = require('../../src/libraries/DatabaseDriver.js');
var DatabaseFaker = require('../mocks/DatabaseFaker.js');
var Mongo      = require('mongodb'),
    Db         = Mongo.Db,
    Connection = Mongo.Connection,
    Server     = Mongo.Server,
    BSON       = Mongo.BSONPure;


exports['save'] = nodeunit.testCase(
{

	setUp: function (callback) {
		DatabaseFaker.setUp(
			['webpages'],
			function(err) {
				if (err) {
					throw err;
				}
				else {
					callback();
				}
			}
		);
	},
	 
	tearDown: function (callback) {
		DatabaseFaker.tearDown(
			['webpages'],
			function(err) {
				if (err) {
					throw err;
				}
				else {
					callback();
				}
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
			function(err, webpage)
			{
				if (err) {
					console.log(err.message);
				}
				else {
					console.log(webpage.url_hash);
				}
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
			function(err, webpage)
			{
				if (err) {
					console.log(err.message);
					test.done();
				}
				else {
					WebPageModel.save(
						'doubled_url',
						'diff_title',
						'Page already seen.',
						function(err, page2)
						{
							if (err) {
								console.log(err.message);
								test.done();
							}
							else {
								test.equal(webpage.url_hash, page2.url_hash);
								test.equal(page2.body, 'Readable page');
								test.done();
							}
						}
					);
				}
			}
		);
	}
});

exports['get'] = nodeunit.testCase(
{

	setUp: function (callback) {
		DatabaseFaker.setUp(
			['webpages'],
			function(err) {
				if (err) {
					throw err;
				}
				else {
					callback();
				}
			}
		);
	},
	 
	tearDown: function (callback) {
		DatabaseFaker.tearDown(
			['webpages'],
			function(err) {
				if (err) {
					throw err;
				}
				else {
					callback();
				}
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
			function(err, webpage)
			{
				if (err) {
					console.log(err.message);
					test.done();
				}
				else {
					WebPageModel.get(
						'to_get_url',
						function(err, recv_page)
						{
							if (err) {
								console.log(err.message);
								test.done();
							}
							else {
								test.equal(recv_page.title, 'some_title');
								test.equal(recv_page.body, '<markup></markup>');
								test.done();
							}
						}
					);
				}
			}
		);
	},

	'invalid': function(test)
	{
		test.expect(1);
		WebPageModel.get(
			'invalid url',
			function(err, webpage)
			{
				if (err) {
					if (err) {
						test.equal(err.message, 'No such WebPage');
					}
					test.done();
				}
			}
		);
	}
});
