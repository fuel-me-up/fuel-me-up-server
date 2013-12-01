var https = require("https");
var querystring = require("querystring");

var parser = function(data, callback) {
    var output = [];
    try {
        data = data.replace(/^var\s*petrol_stations\s*=\s*/, "");
        data = data.replace(/];/, "]");

        var inputJSON = JSON.parse(data);

        inputJSON.forEach(function(gasstation, index) {
            output.push({
                name: gasstation.meta.organization,
                coordinate: {
                    latitude: parseFloat(gasstation.lat),
                    longitude: parseFloat(gasstation.lng),
                },
                provider: "drive-now"
            });
        });
    } catch (e) {
        console.error("Error parsing drive-now json.");
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
        path: "/static/metropolis/js/lib/data/" + city + "/PetrolStations.js", //"/php/metropolis/json.vehicle_filter?language=de_DE",
        method: "GET",
        headers: {
            "Accept": "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript, */*; q=0.01",
            "Referer": "https://de.drive-now.com/php/metropolis/city_" + city_map[city] + "?cit=" + city + "&language=de_DE",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.57 Safari/537.36",
            "X-Requested-With": "XMLHttpRequest",
            "Content-Type": "application/json",
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