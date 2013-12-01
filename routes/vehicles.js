var vehicles = [];
var city_coordinates = {
    "default": {
        "latitude": 0.0,
        "longitude": 0.0
    },
    "amsterdam": {
        "latitude": 52.379791,
        "longitude": 4.894989
    },
    "austin": {
        "latitude": 30.294646,
        "longitude": -97.740083
    },
    "berlin": {
        "latitude": 52.535438,
        "longitude": 13.400359
    },
    "birmingham": {
        "latitude": 52.488112,
        "longitude": -1.890019
    },
    "calgary": {
        "latitude": 51.065565,
        "longitude": -114.057527
    },
    "columbus": {
        "latitude": 39.985538,
        "longitude": -82.997804
    },
    "denver": {
        "latitude": 39.761047,
        "longitude": -104.98282
    },
    "duesseldorf": {
        "latitude": 51.238277,
        "longitude": 6.773651
    },
    "hamburg": {
        "latitude": 53.566414,
        "longitude": 9.993224
    },
    "koeln": {
        "latitude": 50.955832,
        "longitude": 6.959624
    },
    "london": {
        "latitude": 51.528397,
        "longitude": -0.121064
    },
    "miami": {
        "latitude": 25.796491,
        "longitude": -80.227028
    },
    "milano": {
        "latitude": 45.470003,
        "longitude": 9.18589
    },
    "minneapolis": {
        "latitude": 44.993455,
        "longitude": -93.265793
    },
    "montreal": {
        "latitude": 45.537137,
        "longitude": -73.557801
    },
    "muenchen": {
        "latitude": 48.144556,
        "longitude": 11.584976
    },
    "portland": {
        "latitude": 43.667127,
        "longitude": -70.255562
    },
    "sandiego": {
        "latitude": 32.759562,
        "longitude": -117.164125
    },
    "seattle": {
        "latitude": 47.619587,
        "longitude": -122.330811
    },
    "stuttgart": {
        "latitude": 48.782437,
        "longitude": 9.18515
    },
    "toronto": {
        "latitude": 43.670852,
        "longitude": -79.381928
    },
    "ulm": {
        "latitude": 48.41234,
        "longitude": 9.978225
    },
    "vancouver": {
        "latitude": 49.266684,
        "longitude": -123.11422
    },
    "washingtondc": {
        "latitude": 38.919887,
        "longitude": -77.036927
    },
    "wien": {
        "latitude": 48.217353,
        "longitude": 16.374328
    },
    "san francisco": {
        "latitude": 37.782112,
        "longitude": -122.419335
    }
};

exports.vehicles = function(new_vehicles) {
    vehicles = new_vehicles;
};

exports.all_vehicles = function(req, res) {
    var max_fuel_level = parseInt(req.query.max_fuel_level, 10);
    if (typeof req.query.max_fuel_level === 'undefined') {
        max_fuel_level = 100;
    }

    res.send(200, vehicles.filter(function(vehicle) {
        return vehicle.fuel_level <= max_fuel_level;
    }));
};

exports.vehicles_in_city = function(req, res) {
    var latlng = city_coordinates[req.params.city];
    if (typeof latlng === "undefined") {
        latlng = city_coordinates["default"];
    }

    res.format({
        "text/html": function() {
            res.render("index", {
                selected_city: req.params.city,
                map_center_latitude: latlng.latitude,
                map_center_longitude: latlng.longitude
            });
        },
        "application/json": function() {
            var max_fuel_level = parseInt(req.query.max_fuel_level, 10);
            if (typeof req.query.max_fuel_level === 'undefined') {
                max_fuel_level = 100;
            }

            res.send(200, vehicles.filter(function(vehicle) {
                return vehicle.city === req.params.city && vehicle.fuel_level <= max_fuel_level;
            }));
        }
    });
};