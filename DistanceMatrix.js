var map;
var RowCounter = 0;
var markersArray = [];


window.initMap = function() {
    var mapOptions = {
        center: new google.maps.LatLng(51.315875, 9.494597), //Kassel
        zoom: 5
    };
    map = new google.maps.Map(document.getElementById('map'), mapOptions);

    //füge erste Reihe hinzu
    addRow("tableDest");

    //geocodierungsbutton Origon
    var geocoder = new google.maps.Geocoder();

    document.getElementById('submitDest').addEventListener(
        'click',
        function() {
            deleteMarkers(markersArray);
            geocodeAddress(geocoder, map);
        }
    );

    document.getElementById('neueZeile').addEventListener(
        'click',
        function() {
            addRow("tableDest");
        }
    );
};


//geocoder, nimmt den wert aus der origin textbox und geocodiert ihn
function geocodeAddress(geocoder, resultsMap) {
    var origin = document.getElementById('origin').value;

    geocoder.geocode({
        'address': origin
    }, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            var bounds = new google.maps.LatLngBounds();
            var service = new google.maps.DistanceMatrixService();

            //map auf origin zentrieren
            resultsMap.setCenter(results[0].geometry.location);

            //erstmal Destinations anlegen
            var destinations = new Array([]);
            for (k = 0; k < RowCounter; k++) {
                destinations[k] = new Object({});
                destinations[k][0] = document.getElementById(k.toString().concat("", "1")).value; //dest von id holen
                destinations[k][1] = document.getElementById(k.toString().concat("", "2")).value; //dest von id holen
            }

            //Erstelle LatLng Array für die Distancematrix
            var destinationsLatLng = new Array({});
            for (l = 0; l < destinations.length; l++) {
                destinationsLatLng[l] = destinations[l][1];
            }

            //icons definieren
            var destinationIcon = 'https://chart.googleapis.com/chart?' +
                'chst=d_map_pin_letter&chld=D|FF0000|000000';
            var originIcon = 'https://chart.googleapis.com/chart?' +
                'chst=d_map_pin_letter&chld=O|FFFF00|000000';

            //origin icon
            markersArray.push(new google.maps.Marker({
                map: map,
                position: results[0].geometry.location,
                icon: originIcon,
            }));

            //abfahrtzeit
            var date = new Date();
            var afternoon = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 15, 0, 0);

            //Beginne mit getDistanceMatrix TRANSIT
            service.getDistanceMatrix({
                origins: [origin],
                destinations: destinationsLatLng,
                travelMode: google.maps.TravelMode.TRANSIT,
                transitOptions: {
                    departureTime: afternoon
                },
                unitSystem: google.maps.UnitSystem.METRIC,
                avoidHighways: false,
                avoidTolls: false
            }, function(response, status) {
                if (status !== google.maps.DistanceMatrixStatus.OK) {
                    alert('Error was: ' + status);
                } else {
                    var originList = response.originAddresses;
                    var destinationList = response.destinationAddresses;
                    var outputDiv = document.getElementById('Transit');
                    outputDiv.innerHTML = '';
                    var showGeocodedAddressOnMap = function(asDestination) {
                        var icon = asDestination ? destinationIcon : originIcon;
                        return function(results, status) {
                            if (status === google.maps.GeocoderStatus.OK) {
                                map.fitBounds(bounds.extend(results[0].geometry.location));
                                if (map.getZoom() > 12) {
                                    map.setZoom(12);
                                }
                                markersArray.push(new google.maps.Marker({
                                    map: map,
                                    position: results[0].geometry.location,
                                    icon: destinationIcon,
                                }));
                            }
                        };
                    };
                    //ergebnisse ausgeben
                    for (var i = 0; i < originList.length; i++) {
                        var results = response.rows[i].elements;
                        geocoder.geocode({
                                'address': originList[i.LatLng]
                            },
                            showGeocodedAddressOnMap(false));
                        for (var j = 0; j < results.length; j++) {
                            geocoder.geocode({
                                    'address': destinations[j][1]
                                },
                                showGeocodedAddressOnMap(true));
                            outputDiv.innerHTML += '<br>' + "<span style='font-family: Ubuntu; color:#FFFFFF; padding: 0px;'>" + 'Zu ' + destinations[j][0] +
                                ': ' + results[j].distance.text + ' in ' +
                                "<span style='color:#FFA13E;'>" + results[j].duration.text + "</span>" + "</span>";
                        }
                    }
                }
            }); //TRANSIT ENDE


            //Beginne mit getDistanceMatrix Bike
            service.getDistanceMatrix({
                origins: [origin],
                destinations: destinationsLatLng,
                travelMode: google.maps.TravelMode.BICYCLING,
                transitOptions: {
                    departureTime: afternoon
                },
                unitSystem: google.maps.UnitSystem.METRIC,
                avoidHighways: false,
                avoidTolls: false
            }, function(response, status) {
                if (status !== google.maps.DistanceMatrixStatus.OK) {
                    alert('Error was: ' + status);
                } else {
                    var originList = response.originAddresses;
                    var destinationList = response.destinationAddresses;
                    var outputDiv = document.getElementById('Bike');
                    outputDiv.innerHTML = '';
                    var showGeocodedAddressOnMap = function(asDestination) {
                        var icon = asDestination ? destinationIcon : originIcon;
                        return function(results, status) {
                            if (status === google.maps.GeocoderStatus.OK) {
                                map.fitBounds(bounds.extend(results[0].geometry.location));
                                if (map.getZoom() > 12) {
                                    map.setZoom(12);
                                }
                                markersArray.push(new google.maps.Marker({
                                    map: map,
                                    position: results[0].geometry.location,
                                    icon: destinationIcon
                                }));
                            }
                        };
                    };
                    //ergebnisse ausgeben
                    for (var i = 0; i < originList.length; i++) {
                        var results = response.rows[i].elements;
                        geocoder.geocode({
                                'address': originList[i.LatLng]
                            },
                            showGeocodedAddressOnMap(false));
                        for (var j = 0; j < results.length; j++) {
                            geocoder.geocode({
                                    'address': destinations[j][1]
                                },
                                showGeocodedAddressOnMap(true));
                            outputDiv.innerHTML += '<br>' + "<span style='font-family: Ubuntu; color:#FFFFFF; padding: 0px;'>" + 'Zu ' + destinations[j][0] +
                                ': ' + results[j].distance.text + ' in ' +
                                "<span style='color:#FFA13E;'>" + results[j].duration.text + "</span>" + "</span>";
                        }
                    }
                }
            });

            //Beginne mit getDistanceMatrix Driving'
            service.getDistanceMatrix({
                origins: [origin],
                destinations: destinationsLatLng,
                travelMode: google.maps.TravelMode.DRIVING,
                transitOptions: {
                    departureTime: afternoon
                },
                unitSystem: google.maps.UnitSystem.METRIC,
                avoidHighways: false,
                avoidTolls: false
            }, function(response, status) {
                if (status !== google.maps.DistanceMatrixStatus.OK) {
                    alert('Error was: ' + status);
                } else {
                    var originList = response.originAddresses;
                    var destinationList = response.destinationAddresses;
                    var outputDiv = document.getElementById('Driving');
                    outputDiv.innerHTML = '';
                    var showGeocodedAddressOnMap = function(asDestination) {
                        var icon = asDestination ? destinationIcon : originIcon;
                        return function(results, status) {
                            if (status === google.maps.GeocoderStatus.OK) {
                                map.fitBounds(bounds.extend(results[0].geometry.location));
                                if (map.getZoom() > 12) {
                                    map.setZoom(12);
                                }
                                markersArray.push(new google.maps.Marker({
                                    map: map,
                                    position: results[0].geometry.location,
                                    icon: destinationIcon
                                }));
                            }
                        };
                    };
                    for (var i = 0; i < originList.length; i++) {
                        var results = response.rows[i].elements;
                        geocoder.geocode({
                                'address': originList[i.LatLng]
                            },
                            showGeocodedAddressOnMap(false));
                        for (var j = 0; j < results.length; j++) {
                            geocoder.geocode({
                                    'address': destinations[j][1]
                                },
                                showGeocodedAddressOnMap(true));
                            outputDiv.innerHTML += '<br>' + "<span style='font-family: Ubuntu; color:#FFFFFF; padding: 0px;'>" + 'Zu ' + destinations[j][0] +
                                ': ' + results[j].distance.text + ' in ' +
                                "<span style='color:#FFA13E;'>" + results[j].duration.text + "</span>" + "</span>";
                        }
                    }
                }
            });

            //Beginne mit getDistanceMatrix Walking
            service.getDistanceMatrix({
                origins: [origin],
                destinations: destinationsLatLng,
                travelMode: google.maps.TravelMode.WALKING,
                transitOptions: {
                    departureTime: afternoon
                },
                unitSystem: google.maps.UnitSystem.METRIC,
                avoidHighways: false,
                avoidTolls: false
            }, function(response, status) {
                if (status !== google.maps.DistanceMatrixStatus.OK) {
                    alert('Error was: ' + status);
                } else {
                    var originList = response.originAddresses;
                    var destinationList = response.destinationAddresses;
                    var outputDiv = document.getElementById('Walking');
                    outputDiv.innerHTML = '';
                    var showGeocodedAddressOnMap = function(asDestination) {
                        var icon = asDestination ? destinationIcon : originIcon;
                        return function(results, status) {
                            if (status === google.maps.GeocoderStatus.OK) {
                                map.fitBounds(bounds.extend(results[0].geometry.location));
                                if (map.getZoom() > 12) {
                                    map.setZoom(12);
                                }
                                markersArray.push(new google.maps.Marker({
                                    map: map,
                                    position: results[0].geometry.location,
                                    icon: destinationIcon
                                }));
                            }
                        };
                    };
                    for (var i = 0; i < originList.length; i++) {
                        var results = response.rows[i].elements;
                        geocoder.geocode({
                                'address': originList[i.LatLng]
                            },
                            showGeocodedAddressOnMap(false));
                        for (var j = 0; j < results.length; j++) {
                            geocoder.geocode({
                                    'address': destinations[j][1]
                                },
                                showGeocodedAddressOnMap(true));
                            outputDiv.innerHTML += '<br>' + "<span style='font-family: Ubuntu; color:#FFFFFF; padding: 0px;'>" + 'Zu ' + destinations[j][0] +
                                ': ' + results[j].distance.text + ' in ' +
                                "<span style='color:#FFA13E;'>" + results[j].duration.text + "</span>" + "</span>";
                        }
                    }
                }
            });
        }
    });
}

//Lösche alle Marker von der Map
function deleteMarkers(markersArray) {
    for (var i = 0; i < markersArray.length; i++) {
        markersArray[i].setMap(null);
    }
    markersArray = [];
}


//Füge Zeile hinzu. Jede Zelle wird mit Matrizenindizes in der ID benannt
function addRow(Table) {
    var table = document.getElementById(Table);
    var row = table.insertRow(RowCounter + 1);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    cell1.innerHTML = "<input id='" + RowCounter + "1' type='text' placeholder='Bezeichnung'>";
    cell2.innerHTML = "<input id='" + RowCounter + "2' type='text' placeholder='Zieladresse'>";
    RowCounter++;
}
