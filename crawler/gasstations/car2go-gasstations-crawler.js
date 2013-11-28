var https = require("https");

var parser = function(data, callback) {
    var output = [];
    try {
        var inputJSON = JSON.parse(data);

        var gasstations = inputJSON.placemarks;
        gasstations.forEach(function (gasstation, index) {
            output.push({
                name : gasstation.name,
                coordinate : {
                    latitude : gasstation.coordinates[1],
                    longitude : gasstation.coordinates[0],
                },
                provider : "car2go" 
            });
        });
    }
    catch ( e ) {
        var fs = require("fs");
        var timestamp = new Date().getTime();

        console.error("Error parsing car2go json. See " + timestamp + ".log");
        fs.writeFile("" + timestamp + ".log", data, function(err) {
            console.error("Could not even write log file ...");
        });
    }

    if ( typeof callback === 'function' ) {
        callback(null, output);
    }
};

var crawl_gasstations = function(city, callback) {
    var cities = ["amsterdam", "austin", "berlin", "birmingham", "calgary", "columbus", "denver", "duesseldorf", "hamburg", "koeln", "london", "miami", "milano", "minneapolis", "montreal", "muenchen", "portland", "sandiego", "seattle", "stuttgart", "toronto", "ulm", "vancouver", "washingtondc", "wien"];

    if ( cities.indexOf(city) < 0 ) {
        callback("city not in service", null);
        return;
    }

    console.log("Crawling car2go gasstations in " + city + " ...");
    
    console.log("crawling " + city);
    var request_options = {
        hostname: "www.car2go.com",  
        port: 443,      
        path: "/api/v2.1/gasstations?loc=" + city + "&oauth_consumer_key=car2go&format=json",
        method: "GET"
    };

    var body = '';
    var req = https.request(request_options, function(res) {
        res.setEncoding("utf8");
        res.on("data", function(chunk) {
            body = body + chunk;
        });

        res.on("end", function() {
            parser(body, function(err, gasstations) {
                callback(null, city, gasstations);
            });
        });
    });

    req.on("error", function(e) {
        console.log("Request failed: " + e);
    });

    req.end();   
};

// Export
module.exports = {
    crawl: crawl_gasstations
};