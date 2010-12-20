/**
 *	Module dependencies
 **/
var Ni = require('ni');

/**
 *	Debugger library
 **/
var Debugger = function() {
	
	var self = this;
	
	this.log = function log(message)
	{
		console.log(message);
	}
};

module.exports = new Debugger();
