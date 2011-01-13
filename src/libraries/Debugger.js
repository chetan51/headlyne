/**
 *	Module dependencies
 **/
var Ni = require('ni');

/**
 *	Debugger library
 **/
var Debugger = function()
{
	var self = this;
	
	this.called = function called() {
		if (Ni.config('log_enabled')) {
			console.log("Called: " + arguments.callee.caller.name);
		}
	}
	
	this.log = function log(message)
	{
		if (Ni.config('log_enabled')) {
			console.log("[" + arguments.callee.caller.name + "]" + " " + message);
		}
	}
	
	this.error = function log(err)
	{
		if (Ni.config('log_enabled')) {
			console.log("[" + arguments.callee.caller.name + "]" + " ERROR: " + message);
		}
	}
};

module.exports = new Debugger();
