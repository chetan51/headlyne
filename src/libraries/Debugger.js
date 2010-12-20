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
		if (Ni.config('log_enabled')) {
			console.log(message);
		}
	}
};

module.exports = new Debugger();
