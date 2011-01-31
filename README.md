# Headlyne

## An RSS Feed 'Viewer'.

## Project Dependencies:
*	Node.js v0.2.5
*	MongoDB v1.6.5
*	[Ni](https://github.com/chetan51/ni) v0.1.0
*	[Connect](https://github.com/senchalabs/connect) v0.5.0
*	[Nodeunit](https://github.com/caolan/nodeunit) v0.5.0
*	[chetan51/node-xml](https://github.com/chetan51/node-xml) v1.0.0
*	[jsdom](https://github.com/tmpvar/jsdom) v0.1.20
*	[chetan51/node-readability](https://github.com/chetan51/node-readability) v0.0.1
*	[step v0.0.3](https://github.com/creationix/step)
*	[node-mongodb-native](https://github.com/christkv/node-mongodb-native) v0.8.0
*	[chetan51/restler](https://github.com/chetan51/restler) v1.0.0
*	[node-htmlparser](https://github.com/tautologistics/node-htmlparser) v1.7.3
*	[jade](https://github.com/visionmedia/jade) v0.6.0
*	[cookie-node](https://github.com/jed/cookie-node) v0.1.4
*	[chetan51/coffee-resque](https://github.com/chetan51/coffee-resque) v0.0.1
*	[quip](https://github.com/caolan/quip) v0.0.1

## Infrastructure:
*	app.js                : The driver for the webserver.
*	test                  : Unit tests for all the nodes.
*	src
	*	views         : Each view is saved as viewname.\*, and can be used as a template.
	*	controllers   : Based on the requests, retrieve the right data and the right views to serve.
	*	libraries     : Library of nodes used.
