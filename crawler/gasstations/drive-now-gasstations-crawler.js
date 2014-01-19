var https = require("https");
var querystring = require("querystring");

var parser = function(data, callback) {
    var output = [];
    try {
        var inputJSON = JSON.parse(data);

        inputJSON = inputJSON.rec.stations;
        inputJSON.forEach(function(gasstation, index) {
            output.push({
                name: gasstation.name,
                coordinate: {
                    latitude: parseFloat(gasstation.position.lat),
                    longitude: parseFloat(gasstation.position.lng),
                },
                provider: "drive-now"
            });
        });
    } catch (e) {
        console.error("Error parsing drive-now gasstations json: " + e.toString());
    }

    if (typeof callback === 'function') {
        callback(null, output);
    }
};

var crawl_vehicles = function(city, callback) {
    var cities = ["6099", "1774", "1293", "40065", "4604", "4259"];
    if (cities.indexOf(city) < 0) {
        var error = new Error(city + " not in drive-now business area");
        error.name = "OutOfBusinessAreaError";

        callback(error, null);
        return;
    }

    var city_map = {
        "6099": "berlin",
        "1774": "koeln",
        "1293": "duesseldorf",
        "40065": "hamburg",
        "4604": "muenchen",
        "4259": "san_francisco"
    };

    var data = querystring.stringify({
        cit: city
    });
    var request_options = {
        hostname: "de.drive-now.com",
        port: 443,
        path: "/php/metropolisws/mobile.get_stations?is_drive-now_dot_com=1&language=de_DE&tenant=germany",
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Referer": "https://de.drive-now.com/",
            "Origin":"https://de.drive-now.com/",
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": Buffer.byteLength(data)
        }
    };

    var body = '';
    var req = https.request(request_options, function(res) {
        res.setEncoding("utf8");
        res.on("data", function(chunk) {
            body = body + chunk;
        });

        res.on("end", function() {
            parser(body, function(err, gasstations) {
                if (!err) {
                    callback(null, city_map[city], gasstations);
                } else {
                    callback(err, city_map[city], []);
                }
            });
        });
    });

    req.on("error", function(e) {
        console.error("[drive-now,gasstations]Request failed: " + e);
    });

    req.write(data);
    req.end();
};

// Export
module.exports = {
    crawl: crawl_vehicles
};