var https = require("https");
var querystring = require("querystring");

var parser = function(data, callback) {
    var output = [];
    try {
        var inputJSON = JSON.parse(data);

        var vehicles = inputJSON.rec.vehicles.vehicles;
        vehicles.forEach(function (vehicle, index) {
            output.push({
                vin : vehicle.vin, 
                coordinate: vehicle.position,
                provider : "drive-now"
            });
        });
    }
    catch ( e ) {
        var fs = require("fs");
        var timestamp = new Date().getTime();

        console.error("Error parsing drive-now json. See " + timestamp + ".log");
        fs.writeFile("" + timestamp + ".log", data, function(err) {
            console.error("Could not even write log file ...");
        });
    }

    if ( typeof callback === 'function') {
        callback(null, output);
    }
};

var crawl_vehicles = function(city, callback) {
    var cities = ["6099", "1774", "1293", "40065", "4604", "4259"];
    if ( cities.indexOf(city) < 0 ) {
        callback("city not in service", null);
        return;
    }

    var city_map = {
        "6099" : "berlin", 
        "1774" : "koeln", 
        "1293" : "duesseldorf", 
        "40065" : "hamburg", 
        "4604" : "muenchen",
        "4259" : "san_francisco"
    };

    console.log("Crawling drive-now in " + city_map[city] + "...");

    var request_options = {
        hostname: "de.drive-now.com",  
        port: 443,      
        path: "/php/metropolis/json.vehicle_filter?language=de_DE",
        method: "POST",
        headers: {
            "Content-Type" : "application/x-www-form-urlencoded",
            "Referer" : "https://de.drive-now.com/php/metropolis/city_" + city_map[city] + "?cit=" + city + "&language=de_DE"
        }
    };

    var body = '';
    var req = https.request(request_options, function(res) {
        res.setEncoding("utf8");
        res.on("data", function(chunk) {
            body = body + chunk;
        });

        res.on("end", function() {
            parser(body, function(err, vehicles) {
                callback(null, city_map[city], vehicles);
            });
        });
    });

    req.on("error", function(e) {
        console.log("Request failed: " + e);
    });
    
    req.write(
        querystring.stringify({
            cit : city
        })
    );
    req.end();
};

// Export
module.exports = {
    crawl: crawl_vehicles
};