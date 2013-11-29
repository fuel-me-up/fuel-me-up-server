var gasstations = [];

exports.gasstations = function(new_gasstations) {
    gasstations = new_gasstations;
};

exports.all_gasstations = function(req, res) {
    res.set({
        "Content-Type": "application/json; charset=utf-8"
    });

    res.send(200, JSON.stringify(gasstations));
};

exports.gasstations_in_city = function(req, res) {
    res.set({
        "Content-Type": "application/json; charset=utf-8"
    });

    var provider = req.query.provider;
    if (typeof req.query.provider === 'undefined') {
        provider = [];
    } else if (typeof req.query.provider === 'string') {
        provider = [req.query.provider];
    }

    var filtered = gasstations.filter(function(gasstation) {
        var matches_provider = true;
        if (provider.length > 0) {
            matches_provider = false;

            outer_loop: for (var i = 0; i < provider.length; i++) {
                for (var j = 0; j < gasstation.provider.length; j++) {
                    if (provider[i] === gasstation.provider[j]) {
                        matches_provider = true;
                        break outer_loop;
                    }
                }
            }
        }

        return matches_provider && gasstation.city === req.params.city;
    });

    res.send(200, JSON.stringify(filtered));
};