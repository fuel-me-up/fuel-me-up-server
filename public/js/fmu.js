(function() {
    var initialize_map = function() {
        var mapOptions = {
            disableDefaultUI: true,
            center: new google.maps.LatLng(53.568861, 10.000091),
            zoom: 13
        };

        return new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
    };

    var fetch_vehicles = function(filters, callback) {
        filters = filters || {};

        $.get("/vehicles/hamburg", filters, function(res) {
            if (typeof callback === "function") {
                callback(res);
            }
        });
    };

    var fetch_gasstations = function(callback) {
        $.get("/gasstations/hamburg", function(res) {
            if (typeof callback === "function") {
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
                    icon: {
                        size: new google.maps.Size(38, 53),
                        scaledSize: new google.maps.Size(28.5, 39.75),
                        url: "/assets/images/pin-blue.png"
                    },
                    position: new google.maps.LatLng(vehicles[i].coordinate.latitude, vehicles[i].coordinate.longitude),
                    text: vehicles[i].license_plate
                });

                (function(marker, vehicle) {
                    google.maps.event.addListener(marker, "click", function() {
                        map_info_window.setContent("<div style=\"line-height:1.35;overflow:hidden;white-space:nowrap;\"><h1>" + vehicle.license_plate + "<small> (" + vehicle.fuel_level + "%)</small></h1><p>" + vehicle.provider + "</p></div>");
                        map_info_window.open(map_cluster.map, marker);
                    });
                })(marker, vehicles[i]);
                markers.push(marker);
            }

            map_cluster.addMarkers(markers);
        }
    };

    var set_gasstation_markers = function(gasstations, gasstation_markers, map) {
        var map_info_window = new google.maps.InfoWindow({
            content: ""
        });

        for (var i = 0; i < gasstations.length; i++) {
            var gasstation = gasstations[i];

            var marker = new google.maps.Marker({
                icon: {
                    size: new google.maps.Size(38, 53),
                    // scaledSize: new google.maps.Size(28.5, 39.75),
                    url: "/assets/images/pin-gasstation.png"
                },
                position: new google.maps.LatLng(gasstation.coordinate.latitude, gasstation.coordinate.longitude),
                text: gasstation.name,
                map: map
            });

            (function(marker, gasstation) {
                google.maps.event.addListener(marker, "click", function() {
                    map_info_window.setContent("<div style=\"line-height:1.35;overflow:hidden;white-space:nowrap;\"><h1>" + gasstation.name + "</h1><p>" + gasstation.provider.join(", ") + "</p></div>");
                    map_info_window.open(map, marker);
                });
            })(marker, gasstation);

            gasstation_markers.push(marker);
        }
    };

    $(document).ready(function() {
        $("form").sisyphus();

        var clusterStyles = [{
            textColor: 'white',
            url: '/assets/images/cluster-blue.png',
            height: 50,
            width: 50
        }, {
            textColor: 'white',
            url: '/assets/images/cluster-orange.png',
            height: 50,
            width: 50
        }, {
            textColor: 'white',
            url: '/assets/images/cluster-red.png',
            height: 50,
            width: 50
        }];

        var map = initialize_map();
        var map_marker_cluster = new MarkerClusterer(map, [], {
            gridSize: 55,
            midClusterSize: 5,
            maxClusterSize: 10,
            styles: clusterStyles
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
        })($("input.max-fuel-level"), 750);

        // Set saved value and fetch with saved value
        $("output.max-fuel-level").text($("input.max-fuel-level").val() + "%");
        fetch_vehicles({
            max_fuel_level: parseInt($("input.max-fuel-level").val(), 10)
        }, function(res) {
            set_markers(res, map_marker_cluster);
        });

        $("input.max-fuel-level")
            .bind("changed", function() {
                fetch_vehicles({
                    max_fuel_level: parseInt($(this).val())
                }, function(res) {
                    set_markers(res, map_marker_cluster);
                });
            })
            .bind("change", function() {
                $("output.max-fuel-level").text(this.value + "%");
            });

        // Gasstations -----
        var gasstation_markers = [];

        if ($("input.show-gasstations").is(":checked")) {
            fetch_gasstations(function(items) {
                set_gasstation_markers(items, gasstation_markers, map);
            });
        }

        $("input.show-gasstations")
            .change(function() {
                if ($(this).is(":checked")) {
                    fetch_gasstations(function(items) {
                        set_gasstation_markers(items, gasstation_markers, map);
                    });
                } else {
                    gasstation_markers.forEach(function(item, index, arr) {
                        item.setMap(null);
                    });

                    gasstation_markers = [];
                }
            });
    });
})();