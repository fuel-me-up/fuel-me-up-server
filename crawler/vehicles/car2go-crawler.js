var https = require("https");

var parser = function(data, callback) {
    var output = [];
    try {
        var inputJSON = JSON.parse(data);

        var vehicles = inputJSON.placemarks;
        vehicles.forEach(function(vehicle, index) {
            output.push({
                vin: vehicle.vin,
                fuel_level: vehicle.fuel,
                license_plate: vehicle.name,
                coordinate: {
                    latitude: vehicle.coordinates[1],
                    longitude: vehicle.coordinates[0],
                    address: vehicle.address
                },
                provider: "car2go"
            });
        });
    } catch (e) {
        console.error("Error parsing car2go json.");
    }

    if (typeof callback === 'function') {
        callback(null, output);
    }
};

var crawl_vehicles = function(city, callback) {
    var cities = ["amsterdam", "austin", "berlin", "birmingham", "calgary", "columbus", "denver", "duesseldorf", "hamburg", "koeln", "london", "miami", "milano", "minneapolis", "montreal", "muenchen", "newyorkcity", "portland", "sandiego", "seattle", "stuttgart", "toronto", "ulm", "vancouver", "washingtondc", "wien"];

    if (cities.indexOf(city) < 0) {
        var error = new Error(city + " not in service car2go business area");
        error.name = "OutOfBusinessAreaError";

        callback(error, null);
        return;
    }

    var all_vehicles = {};
    var request_options = {
        hostname: "www.car2go.com",
        port: 443,
        path: "/api/v2.1/vehicles?loc=" + city + "&oauth_consumer_key=car2go&format=json",
        method: "GET"
    };

    var body = '';
    var req = https.request(request_options, function(res) {
        res.setEncoding("utf8");
        res.on("data", function(chunk) {
            body = body + chunk;
        });

        res.on("end", function() {
            parser(body, function(err, vehicles) {
                if (!err) {
                    callback(null, city, vehicles);
                } else {
                    callback(err, city, []);
                }
            });
        });
    });

    req.on("error", function(e) {
        console.error("[car2go,vehicles]Request failed: " + e);
    });

    req.end();
};

// Export
module.exports = {
    crawl: crawl_vehicles
};