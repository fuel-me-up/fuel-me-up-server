(function() {
    var initialize_map = function() {
        var mapOptions = {
            center: new google.maps.LatLng(53.568861, 10.000091),
            zoom: 13
        };

        return new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
    };

    var fetch_vehicles = function(filters, callback) {
        filters = filters || {};

        $.get("/vehicles/hamburg", filters, function(res) {
            if (typeof callback === 'function') {
                callback(res);
            }
        });
    };

    var set_markers = function(vehicles, map_cluster) {
        if (Object.prototype.toString.call(vehicles) === "[object Array]") {
            map_cluster.clearMarkers();

            var map_info_window = new google.maps.InfoWindow({
                content: ""
            });

            var markers = [];
            for (var i = 0; i < vehicles.length; i++) {
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(vehicles[i].coordinate.latitude, vehicles[i].coordinate.longitude),
                    text: vehicles[i].license_plate
                });

                (function(marker, vehicle) {
                    google.maps.event.addListener(marker, "click", function() {
                        map_info_window.setContent("<div style=\"line-height:1.35;overflow:hidden;white-space:nowrap;\">" + vehicle.provider + ", license plate <strong>" + vehicle.license_plate + "</strong></div>");
                        map_info_window.open(map_cluster.map, marker);
                    });
                })(marker, vehicles[i]);
                markers.push(marker);
            }

            map_cluster.addMarkers(markers);
        }
    }

    $(document).ready(function() {
        var map = initialize_map();
        var map_marker_cluster = new MarkerClusterer(map, []);

        fetch_vehicles({
            max_fuel_level: 25
        }, function(res) {
            set_markers(res, map_marker_cluster);
        });

        (function(el, timeout) {
            var timer, trig = function() {
                    el.trigger("changed");
                };

            el.bind("change", function() {
                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(trig, timeout);
            });
        })($("#max-fuel-level"), 750);

        $("#max-fuel-level").bind("changed", function() {
            console.log("changed: " + $(this).val());
            fetch_vehicles({
                max_fuel_level: parseInt($(this).val())
            }, function(res) {
                set_markers(res, map_marker_cluster);
            });
        });
    });
})();