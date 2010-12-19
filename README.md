# Headlyne

## An RSS Feed 'Viewer'.

## Project Dependencies:
*	Node.js
*	Ni v0.1.0
*	Connect
*	Nodeunit
*	node-xml v1.0.0
*	jsdom v0.1.20
*	node-htmlparser
*	node-readability v1.0.0
*	[node-webworker v0.8.2](https://github.com/pgriess/node-webworker)
*	[step v0.0.3](https://github.com/creationix/step)
*	conductor v0.2.0
*	mongodb v0.8.0
*	restler v1.0.0
*	webworker v0.8.2

## Infrastructure:
*	app.js                : The driver for the webserver.
*	test                  : Unit tests for all the nodes.
*	src
	*	views         : Each view is saved as viewname.\*, and can be used as a template.
	*	controllers   : Based on the requests, retrieve the right data and the right views to serve.
	*	libraries     : Library of nodes used.
