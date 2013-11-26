/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var fs = require('fs');
var timeFormat = require('strftime');
var db = require("mongojs").connect("vehicle_crawler", ["vehicles"]);
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

function errorWhileReadingFile(path) {
	var msg = 'file does not exists for path: ' + path;
	console.log(msg);
	res.send(400, msg);
}

function sendOutput(req, res, data) {
	content = data;
	if (req.query.jsonp) {
		content = req.query.jsonp + '(' + data + ')';
	}
	return res.send(200, content);
}

function getVehiclesForCityAndTimestamp(req, res, city, timestamp) {
	var time = timeFormat('%F-%H-%M', new Date(timestamp * 1000));
	console.log(time);

	var query = new Object();
	if (req.param('msp')) {
		query.provider = req.query.msp;
	}
	query.city = city;
	query.timestring = time;

	var vehicles = db.vehicles.find(query, function(err, docs) {
		sendOutput(req, res, JSON.stringify(docs));
	});
}

function getAvailableMSPs(req, res) {
	var path = './dataSource/available-msps.js';

	fs.readFile(path, 'utf8', function(err, data) {
		if (err) {
			errorWhileReadingFile(path);
		}
		sendOutput(req, res, data);
	});
}

function getAvailableLocations(req, res) {
	var path = './dataSource/available-locations.js';

	fs.readFile(path, 'utf8', function(err, data) {
		if (err) {
			errorWhileReadingFile(path);
		}
		sendOutput(req, res, data);
	});
}


app.get('/', routes.index);

app.get('/vehicles/:city', function(req, res) {
	if (!req.query.timestamp) {
		res.send(400, 'Please enter a timestamp!')
	} else {
		getVehiclesForCityAndTimestamp(req, res, req.params.city, req.query.timestamp);
	}
});

app.get('/msps', function(req, res) {
	getAvailableMSPs(req, res);
});

app.get('/locations', function(req, res) {
	getAvailableLocations(req, res);
});

http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});