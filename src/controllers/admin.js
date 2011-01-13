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

	this.index = function index(req, res, next)
	{
		dbg.called();
		
		res.error('Nothing to do.');
	}
	
	this.invite = function invite(req, res, next)
	{
		dbg.called();
		
		self._authenticate(
			req,
			function checkIfAdmin(err, is_admin) {
				dbg.called();
		
				if (err) {
					res.error("Error: " + err.message);
				}
				else {
					if (is_admin) {
						self._invite(
							req,
							function showInviteCode(err, invite_code) {
								dbg.called();
		
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
	
	this._invite = function _invite(req, callback) {
		dbg.called();
		
		Ni.model('Invite').add(
			"admin",
			function finishInvite(err, invite_code) {
				dbg.called();
		
				if (err) {
					callback(err);
				}
				else {
					callback(null, invite_code);
				}
			}
		);
	}
	
	this._authenticate = function _authenticate(req, callback)
	{
		dbg.called();
		
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
