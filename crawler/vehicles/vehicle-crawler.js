#!/usr/bin/env node

var fs = require("fs");
var moment = require("moment");
// var db = require("mongojs").connect("vehicle_crawler", ["vehicles"]);

var notify = (function() {
    var counters = {};
    var callbacks = {};
    return function() {
        if ( arguments.length == 3 ) {
            counters[arguments[0]] = arguments[1];
            callbacks[arguments[0]] = arguments[2];
        }
        else {
            counters[arguments[0]] -= 1;
            if ( counters[arguments[0]] == 0 ) {
                callbacks[arguments[0]]();
            }
        }
    }; 
})();

// MWAHAHAHA
var crawlers = ["car2go", "drive-now"];
var cities = ["amsterdam", "austin", "berlin", "birmingham", "calgary", "columbus", "denver", "duesseldorf", "hamburg", "koeln", "london", "miami", "milano", "minneapolis", "montreal", "muenchen", "portland", "sandiego", "seattle", "stuttgart", "toronto", "ulm", "vancouver", "washingtondc", "wien", "6099", "1774", "1293", "40065", "4604", "4259"];

var crawl = function(callback) {
    var vehicle_list = {};
    
    notify("requests", crawlers.length * cities.length, function() {
        var date = new Date();
        var timestamp = date.getTime();
        var timestring = moment(date).format("YYYY-MM-DD-HH-mm");

        var cities_count = 0;
        for (var city in vehicle_list) {
            cities_count += 1;
        }

        var vehicles = [];
        for (var city in vehicle_list) {
            var mapped = vehicle_list[city].map(function(item) {
                item.city = city;
                item.timestamp = timestamp;
                item.timestring = timestring;
                return item;
            });

            vehicles = vehicles.concat(mapped);
        }

        if ( typeof callback === 'function' )
        {
            callback(vehicles);
        }

        console.log("Vehicle refresh complete #################################");
    });

    cities.forEach(function(city, index) {
        crawlers.forEach(function(crawler_name, index) {
            var crawler = require(__dirname + "/" + crawler_name + "-crawler.js");

            crawler.crawl(city, function(err, real_city, vehicles) {
                if ( !err ) {
                    if (typeof vehicle_list[real_city] == 'undefined') {
                        vehicle_list[real_city] = [];
                    }

                    vehicle_list[real_city] = vehicle_list[real_city].concat(vehicles);
                }
                else {
                    console.log("[Error] " + err);
                }

                notify("requests");
            });
        });
    });
};


// Export
module.exports = {
    crawl: crawl
};

// Muahahahaha
// crawl();
// timers.setInterval(crawl, 60000);