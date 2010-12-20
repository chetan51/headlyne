# Headlyne

## An RSS Feed 'Viewer'.

## Project Dependencies:
*	Node.js
*	Ni v0.1.0
*	Connect
*	Nodeunit
*	[chetan51/node-xml](https://github.com/chetan51/node-xml) v1.0.0
*	jsdom v0.1.20
*	[chetan51/node-readability](https://github.com/chetan51/node-readability) v0.0.1
*	[step v0.0.3](https://github.com/creationix/step)
*	conductor v0.2.0
*	mongodb v0.8.0
*	[chetan51/restler](https://github.com/chetan51/restler) v1.0.0
*	[node-htmlparser](https://github.com/tautologistics/node-htmlparser) v1.7.3

## Infrastructure:
*	app.js                : The driver for the webserver.
*	test                  : Unit tests for all the nodes.
*	src
	*	views         : Each view is saved as viewname.\*, and can be used as a template.
	*	controllers   : Based on the requests, retrieve the right data and the right views to serve.
	*	libraries     : Library of nodes used.
