# Headlyne

## An RSS Feed 'Viewer'.

## Project Dependencies:
	- Node.js
	- Ni
	- Connect
	- Nodeunit
	- node-xml
	- jsdom
	- node-htmlparser
	- node-readability
	- [node-webworker v0.8.2](https://github.com/pgriess/node-webworker)

## Infrastructure:
	- app.js                : The driver for the webserver.
	- test                  : Unit tests for all the nodes.
	- src
		- views         : Each view is saved as viewname.\*, and can be used as a template.
		- controllers   : Based on the requests, retrieve the right
		                  data and the right views to serve.
		- libraries     : Library of nodes used.
