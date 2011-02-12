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
			self.console_log("Called: " + arguments.callee.caller.name);
		}
	}
	
	this.log = function log(message)
	{
		if (Ni.config('log_enabled')) {
			self.console_log("[" + arguments.callee.caller.name + "]" + " " + message);
		}
	}
	
	this.error = function log(err)
	{
		if (Ni.config('log_enabled')) {
			self.console_log("[" + arguments.callee.caller.name + "]" + " ERROR: " + err.message);
		}
	}

	this.exited = function exited() {
		if (Ni.config('log_enabled')) {
			self.console_log("Exited: " + arguments.callee.caller.name);
		}
	}
	
	this.console_log = function console_log(message) {
		var time = new Date().getTime();
		console.log("(" + time + ") " + message);
	}
};

module.exports = new Debugger();
