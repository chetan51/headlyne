/*
 *  AdminController - all admin functinos
 */

/*
 *  Module dependencies
 */

var Ni   = require('ni'),
    url  = require('url'),
    dbg  = require('../../src/libraries/Debugger.js');

/*
 *  The admin controller
 */
var AdminController = function()
{
	var self = this;

	this.index = function(req, res, next)
	{
		res.error('Nothing to do.');
	}
	
	this.invite = function(req, res, next)
	{
		self._authenticate(
			req,
			function(err, is_admin) {
				if (err) {
					res.error("Error: " + err.message);
				}
				else {
					if (is_admin) {
						self._invite(
							req,
							function(err, invite_code) {
								if (err) {
									res.error("Error: " + err.message);
								}
								else {
									res.ok("Invite code: " + invite_code);
								}
							}
						);
					}
					else {
						res.error('Invalid credentials.');
					}
				}
			}
		);
	}
	
	this._invite = function(req, callback) {
		Ni.model('Invite').add(
			"admin",
			function(err, invite_code) {
				if (err) {
					callback(err);
				}
				else {
					callback(null, invite_code);
				}
			}
		);
	}
	
	this._authenticate = function(req, callback)
	{
		var parameters = url.parse(req.url, true).query;
		
		if (!parameters) {
			callback(null, false);
		}
		else {
			if (parameters.pw == "megamidies1337") {
				callback(null, true);
			}
			else {
				callback(null, false);
			}
		}
	}
};

/*
 *  Exports the admin controller
 */

module.exports = new AdminController();
