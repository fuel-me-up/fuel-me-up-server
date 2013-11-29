var vehicles = [];

exports.vehicles = function(new_vehicles) {
    vehicles = new_vehicles;
};

exports.all_vehicles = function(req, res) {
    res.set({
        "Content-Type": "application/json; charset=utf-8"
    });

    res.send(200, JSON.stringify(vehicles));
};

exports.vehicles_in_city = function(req, res) {
    res.set({
        "Content-Type": "application/json; charset=utf-8"
    });

    var max_fuel_level = parseInt(req.query.max_fuel_level, 10);
    if (typeof req.query.max_fuel_level === 'undefined') {
        max_fuel_level = 100;
    }

    var filtered = vehicles.filter(function(vehicle) {
        return vehicle.city === req.params.city && vehicle.fuel_level <= max_fuel_level;
    });

    res.send(200, JSON.stringify(filtered));
};