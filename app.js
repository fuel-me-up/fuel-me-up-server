/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var fs = require('fs');
var crawler = require('./crawler/vehicles/vehicle-crawler.js');
var gasstation_crawler = require('./crawler/gasstations/gasstations-crawler.js');
var vehicles_api = require(__dirname + "/routes/vehicles.js");
var gasstations_api = require(__dirname + "/routes/gasstations.js");
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
var crawl_vehicles = function() {
	crawler.crawl(function(new_vehicles) {
		vehicles_api.vehicles(new_vehicles);
	}); 	
};

timers.setInterval(crawl_vehicles, 5 * 60000);
crawl_vehicles();


var crawl_gasstations = function() {
	gasstation_crawler.crawl(function(new_gasstations) {
		gasstations_api.gasstations(new_gasstations);
	}); 	
};

timers.setInterval(crawl_gasstations, 5 * 60000);
crawl_gasstations();


// API

app.get('/vehicles', vehicles_api.all_vehicles);
app.get('/vehicles/:city', vehicles_api.vehicles_in_city);

app.get('/gasstations', gasstations_api.all_gasstations);
app.get('/gasstations/:city', gasstations_api.gasstations_in_city);


// --------

http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});