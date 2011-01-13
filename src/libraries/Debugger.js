/**
 *	Module dependencies
 **/
var Ni = require('ni');

/**
 *	Debugger library
 **/
var Debugger = function() {
	
	var self = this;
	
	this.called = function called(owner_class) {
		if (Ni.config('log_enabled')) {
			var owner_label = "";
			if (owner_class) {
				owner_label = owner_class + ".";
			}

			console.log("Called: " + owner_label + arguments.callee.caller.name);
		}
	}
	
	this.log = function log(message)
	{
		if (Ni.config('log_enabled')) {
			console.log(message + "[" + arguments.callee.caller.name + "]");
		}
	}
};

module.exports = new Debugger();
