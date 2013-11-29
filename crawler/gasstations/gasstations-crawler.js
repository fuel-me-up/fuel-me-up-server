#!/usr/bin/env node

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
    var gasstations_list = {};
    
    notify("requests", crawlers.length * cities.length, function() {
        var cities_count = 0;
        for (var city in gasstations_list) {
            cities_count += 1;
        }

        var gasstations = [];
        for (var city in gasstations_list) {
            var mapped = gasstations_list[city].map(function(item) {
                item.city = city;
                item.provider = [item.provider]
                return item;
            });

            gasstations = gasstations.concat(mapped);
        }

        // Join the stations that are doubled
        var reduced_gasstations = [];
        for ( var i = 0; i < gasstations.length; i++ ) {
            var found = false;
            for ( var j = 0; j < reduced_gasstations.length; j++ ) {
                var delta = 0.0002;
                if ( Math.abs(gasstations[i].coordinate.latitude - reduced_gasstations[j].coordinate.latitude) < delta && 
                    Math.abs(gasstations[i].coordinate.longitude - reduced_gasstations[j].coordinate.longitude) < delta ) {
                    reduced_gasstations[j].provider.push(gasstations[i].provider[0]);
                    found = true;
                    break;
                }
            }

            if ( found === false ) {
                reduced_gasstations.push(gasstations[i]);
            }
        }

        if ( typeof callback === 'function' )
        {
            callback(reduced_gasstations);
        }

        console.log("Gasstations refresh complete #################################");
    });

    cities.forEach(function(city, index) {
        crawlers.forEach(function(crawler_name, index) {
            var crawler = require(__dirname + "/" + crawler_name + "-gasstations-crawler.js");

            crawler.crawl(city, function(err, real_city, gasstations) {
                if ( !err ) {
                    if (typeof gasstations_list[real_city] == 'undefined') {
                        gasstations_list[real_city] = [];
                    }

                    gasstations_list[real_city] = gasstations_list[real_city].concat(gasstations);
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
