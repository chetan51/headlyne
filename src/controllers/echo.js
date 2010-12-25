/*
 *  EchoController - a controller that sends a dummy response to let monit
 *  know that the server is still alive.
 */

/*
 *  The echo controller
 */

var EchoController = function() {

	this.index = function(req, res, next) {
		res.ok("hello");
	}
};

/*
 *  Exports the echo controller
 */

module.exports = new EchoController();
