#!/usr/bin/env node

var path = require('path');
var moment = require("moment");
var async = require("async");

// MWAHAHAHA
var crawlers = ["car2go", "drive-now"];
var cities = ["amsterdam", "austin", "berlin", "birmingham", "calgary", "columbus", "denver", "duesseldorf", "hamburg", "koeln", "london", "miami", "milano", "minneapolis", "montreal", "muenchen", "newyorkcity", "portland", "sandiego", "seattle", "stuttgart", "toronto", "ulm", "vancouver", "washingtondc", "wien", "6099", "1774", "1293", "40065", "4604", "4259"];

var crawl = function(callback) {
    var requests = [];
    cities.forEach(function(city, index) {
        crawlers.forEach(function(provider, index) {
            var crawler = require(path.join(__dirname, provider + "-crawler.js"));

            (function(city) {
                requests.push(function(async_callback) {
                    crawler.crawl(city, function(err, real_city, vehicles) {
                        if (!err) {                            
                            vehicles = vehicles
                                .map(function(vehicle) {
                                    vehicle.city = real_city;
                                    vehicle.coordinate.latitude = parseFloat(vehicle.coordinate.latitude);
                                    vehicle.coordinate.longitude = parseFloat(vehicle.coordinate.longitude);

                                    return vehicle;
                                })
                                .filter(function(vehicle) {
                                    // Filter vehicles with no location
                                    var delta = 0.1;
                                    return Math.abs(vehicle.coordinate.latitude) > delta &&
                                        Math.abs(vehicle.coordinate.longitude) > delta;
                                });

                            async_callback(null, {
                                city: real_city,
                                vehicles: vehicles
                            });
                        } else if (err.name !== "OutOfBusinessAreaError") {
                            console.error("[Error] " + err);
                            async_callback(err, null);
                        } else {
                            async_callback(null, null);
                        }
                    });
                });
            })(city);
        });
    });

    async.parallel(requests, function(err, results) {
        var vehicles = [];

        results.forEach(function(item) {
            if (item !== null && typeof item !== "undefined" && typeof item.vehicles !== "undefined") {
                vehicles = vehicles.concat(item.vehicles);
            }
        });

        if (typeof callback === 'function') {
            callback(vehicles);
        }

        console.log("[" + moment().format("YYYY-MM-DD HH:mm:ss") + "] Vehicle refresh complete #####################################");
    });
};


// Export
module.exports = {
    crawl: crawl
};