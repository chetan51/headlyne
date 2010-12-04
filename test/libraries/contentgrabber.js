/*
 *  Module dependencies
 */

var nodeunit = require('nodeunit');
var ContentGrabber = require('../../src/libraries/contentgrabber.js');

/*
 *  Sample data
 */

/*
 *  Tests
 */

exports['grab content from page'] = nodeunit.testCase({

/*    setUp: function () {
    },
 
    tearDown: function () {
    },
 */

    'basic': function(test) {
        
        test.expect(1);
        test.equal(1, 1);
        test.done();

    }

});
