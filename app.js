/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var fs = require('fs');
var crawler = require('./crawler/vehicle-crawler.js');
var timers = require("timers");
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

// Crawwwwl.
var vehicles = [];
var crawl_vehicles = function() {
	crawler.crawl(function(new_vehicles) {
		vehicles = new_vehicles;
	}); 	
};

timers.setInterval(crawl_vehicles, 5 * 60000);
crawl_vehicles();


// API

app.get('/vehicles', function(req, res) {
	res.set({
		"Content-Type" : "application/json; charset=utf-8"
	});

	res.send(200, JSON.stringify(vehicles));
});

app.get('/vehicles/:city', function(req, res) {
	res.set({
		"Content-Type" : "application/json; charset=utf-8"
	});

	var max_fuel_level = parseInt(req.query.max_fuel_level, 10);
	if ( typeof req.query.max_fuel_level === 'undefined' ) {
		max_fuel_level = 100;
	}

	var filtered = vehicles.filter(function(vehicle) {
		return vehicle.city === req.params.city && vehicle.fuel_level <= max_fuel_level;
	});

	res.send(200, JSON.stringify(filtered));
});

// --------

http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});