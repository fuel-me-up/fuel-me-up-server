#!/usr/bin/env node

var path = require('path');
var moment = require("moment");
var async = require("async");

// var crawlers = ["car2go", "drive-now"];
var crawlers = ["car2go"];
var cities = ["amsterdam", "austin", "berlin", "birmingham", "calgary", "columbus", "denver", "duesseldorf", "hamburg", "koeln", "london", "miami", "milano", "minneapolis", "montreal", "muenchen", "portland", "sandiego", "seattle", "stuttgart", "toronto", "ulm", "vancouver", "washingtondc", "wien", "6099", "1774", "1293", "40065", "4604", "4259"];

var crawl = function(callback) {
    var requests = [];
    cities.forEach(function(city, index) {
        crawlers.forEach(function(provider, index) {
            var crawler = require(path.join(__dirname, provider + "-gasstations-crawler.js"));

            requests.push(function(async_callback) {
                crawler.crawl(city, function(err, real_city, gasstations) {
                    if (!err) {
                        async_callback(null, {
                            city: real_city,
                            gasstations: gasstations.map(function(gasstation) {
                                gasstation.city = real_city;
                                gasstation.provider = [gasstation.provider];                                

                                return gasstation;
                            })
                        });
                    } else if (err.name !== "OutOfBusinessAreaError") {
                        console.error("[Error] " + err);
                        async_callback(err, null);
                    } else {
                        async_callback(null, null);
                    }
                });
            });
        });
    });

    async.parallel(requests, function(err, results) {
        var gasstations = [];

        results.forEach(function(item) {
            if (item !== null && typeof item !== "undefined" && typeof item.gasstations !== "undefined") {
                gasstations = gasstations.concat(item.gasstations);
            }
        });

        // Remove gasstations that serve multiple carsharing providers
        // Join the stations that are doubled
        var reduced_gasstations = [];
        for (var i = 0; i < gasstations.length; i++) {
            var found = false;
            for (var j = 0; j < reduced_gasstations.length; j++) {
                var delta = 0.0002;
                var provider = gasstations[i].provider[0];
                if (Math.abs(gasstations[i].coordinate.latitude - reduced_gasstations[j].coordinate.latitude) < delta &&
                    Math.abs(gasstations[i].coordinate.longitude - reduced_gasstations[j].coordinate.longitude) < delta) {
                    // some gasstations double ...
                    if (reduced_gasstations[j].provider.indexOf(provider) === -1) {
                        reduced_gasstations[j].provider.push(gasstations[i].provider[0]);
                    }
                    found = true;
                    break;
                }
            }

            if (found === false) {
                reduced_gasstations.push(gasstations[i]);
            }
        }

        if (typeof callback === 'function') {
            callback(reduced_gasstations);
        }

        console.log("[" + moment().format("YYYY-MM-DD HH:mm:ss") + "] Gasstations refresh complete #################################");
    });
};

// Export
module.exports = {
    crawl: crawl
};