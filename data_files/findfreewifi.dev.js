"use strict"; // jshint ;_;

$(function () {

    //bootstrap-specific
    var html = '                    <div class="modal hide fade" id="bsModal">\
                        <div class="modal-header">\
                            <button class="close" data-dismiss="modal">\
                                ×</button>\
                                <h3 id="bsModalHeader">\
                                Modal header</h3>\
                        </div>\
                        <div class="modal-body">\
                            <p id="bsModalBody">\
                                …</p>\
                        </div>\
                        <div class="modal-footer" id="bsModalButtons">\
                            \
                        </div>\
                    </div>';
    $('body').append(html);
    $('#bsModal').modal('hide');
});



// high level DOM window level error handler
window.onerror = function (message, uri, line) {
    var fullMessage = message + "\n at " + uri + ": " + line;
    alert('Error : ' + fullMessage);

    return false;
}

function populateGlobal(namespace) {
    var ar = namespace.split('.');

    var currentLevel = null;
    for (var i = 0; i < ar.length; i++) {
        var fn = ar[i];

        if (currentLevel === null) {
            currentLevel = window;
        }

        if (currentLevel[fn] === undefined) {
            currentLevel[fn] = {};
        }
        currentLevel = currentLevel[fn];

    }
}



populateGlobal('BKS.FFW');

var map = null;
var allLocations = null;
var markers = [];


BKS.FFW.extend = function (target, defaults) {

    var item;

    for (item in defaults) {
        if (typeof target[item] === 'undefined') {
            target[item] = defaults[item];
        }
    }
    return target;
}


BKS.FFW.retVal = function (sName) {
    var sURL = new String(window.location);
    var iQMark = sURL.lastIndexOf('?');
    var iLensName = sName.length;
    var iStart = sURL.indexOf('?' + sName + '=')
    if (iStart == -1) {
        iStart = sURL.indexOf('&' + sName + '=')
        if (iStart == -1) {
            return null;
        }
    }
    iStart = iStart + +iLensName + 2;
    var iTemp = sURL.indexOf('&', iStart);
    if (iTemp == -1) {

        iTemp = sURL.length;
    }
    return sURL.slice(iStart, iTemp);
}

BKS.FFW.initMapAndLoadLocations = function (cityName, callBack) {
    var cityName = cityName || "All";

    map = BKS.FFW.initMap("map_canvas");

    BKS.FFW.loadLocationsForCity(cityName, 0, callBack);
}


var allLocs = [];
BKS.FFW.loadLocationsForCity = function (city, page, callBack) {
    var city = city || "All";
    var page = page || 0;
    var PAGE_SIZE = 500;
    callBack = callBack || function () { };
    var mustContinue = false;
    
    if (page === 0) {
        BKS.FFW.clearMapOverlays();
    }
    $.getJSON(
                '../../publicjson/SiteIndexWithPaging',
               { cityName: city, page:page },
                function (data) {

                    var locations = [];
                    for (var i = 0; i < data.length; i++) {
                        locations.push(new BKS.FFW.CreateLocation(
                        				{
                        				    Id: data[i].Id,
                        				    Name: data[i].Name,
                        				    Lat: data[i].Lat,
                        				    Lng: data[i].Lng,
                                            Type: data[i].Type
                        				}
                        				));
                    }
                    if (locations.length >= PAGE_SIZE)
                    {
                         mustContinue = true;
                    }
                    BKS.FFW.addMarkersToMap(locations);
                    allLocs = allLocs.concat(locations);
                    if (mustContinue) {
                        //recursive
                        page++;
                        BKS.FFW.loadLocationsForCity(city, page, callBack);
                    }
                    else {
                        callBack(allLocs);
                    }
                });


}

BKS.FFW.initMap = function (div) {
    var lat = -28.690563031850974;
    var lng = 25.046684548611097;
    var myLatlng = new google.maps.LatLng(lat, lng);
    var myOptions = {
        zoom: 6,
        center: myLatlng,
        //mapTypeControl: false,
        streetViewControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        panControl: false,
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.LARGE,
            position: google.maps.ControlPosition.RIGHT_CENTER
        }
    }
    // time of day theming - start
    var now = new Date();
    var hoursNow = now.getHours();
    var NIGHT_START = 18;
    var DUSK_START = 17;
    var DAY_START = 6;
    var DAWN_START = 5;
    if (hoursNow == DUSK_START) {
        // DUSK
        //http://snazzymaps.com/style/2/midnight-commander
        myOptions.styles = [{ "featureType": "all", "stylers": [{ "saturation": -100 }, { "gamma": 0.5 }] }];
    }
    else if (hoursNow >= DAWN_START && hoursNow < DAY_START) {
        // DAY
        //myOptions.styles = [{"featureType":"road","elementType":"labels","stylers":[{"visibility":"simplified"},{"lightness":20}]},{"featureType":"administrative.land_parcel","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"landscape.man_made","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"labels","stylers":[{"visibility":"simplified"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"road.highway","elementType":"labels","stylers":[{"visibility":"simplified"}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"hue":"#a1cdfc"},{"saturation":30},{"lightness":49}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"hue":"#f49935"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"hue":"#fad959"}]}];
        myOptions.styles = [{ "featureType": "water", "stylers": [{ "visibility": "on" }, { "color": "#acbcc9" }] }, { "featureType": "landscape", "stylers": [{ "color": "#f2e5d4" }] }, { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#c5c6c6" }] }, { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#e4d7c6" }] }, { "featureType": "road.local", "elementType": "geometry", "stylers": [{ "color": "#fbfaf7" }] }, { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#c5dac6" }] }, { "featureType": "administrative", "stylers": [{ "visibility": "on" }, { "lightness": 33 }] }, { "featureType": "road" }, { "featureType": "poi.park", "elementType": "labels", "stylers": [{ "visibility": "on" }, { "lightness": 20 }] }, {}, { "featureType": "road", "stylers": [{ "lightness": 20 }] }];
    }
    else if (hoursNow >= DAY_START && hoursNow < DUSK_START) {
        // DAY
        //myOptions.styles = [{"featureType":"road","elementType":"labels","stylers":[{"visibility":"simplified"},{"lightness":20}]},{"featureType":"administrative.land_parcel","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"landscape.man_made","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"labels","stylers":[{"visibility":"simplified"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"road.highway","elementType":"labels","stylers":[{"visibility":"simplified"}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"hue":"#a1cdfc"},{"saturation":30},{"lightness":49}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"hue":"#f49935"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"hue":"#fad959"}]}];
        myOptions.styles = [{ "featureType": "landscape", "stylers": [{ "hue": "#F1FF00" }, { "saturation": -27.4 }, { "lightness": 9.4 }, { "gamma": 1 }] }, { "featureType": "road.highway", "stylers": [{ "hue": "#0099FF" }, { "saturation": -20 }, { "lightness": 36.4 }, { "gamma": 1 }] }, { "featureType": "road.arterial", "stylers": [{ "hue": "#00FF4F" }, { "saturation": 0 }, { "lightness": 0 }, { "gamma": 1 }] }, { "featureType": "road.local", "stylers": [{ "hue": "#FFB300" }, { "saturation": -38 }, { "lightness": 11.2 }, { "gamma": 1 }] }, { "featureType": "water", "stylers": [{ "hue": "#00B6FF" }, { "saturation": 4.2 }, { "lightness": -63.4 }, { "gamma": 1 }] }, { "featureType": "poi", "stylers": [{ "hue": "#9FFF00" }, { "saturation": 0 }, { "lightness": 0 }, { "gamma": 1 }] }];
    }
    else {
        // NIGHT
        //http://snazzymaps.com/style/2/midnight-commander
        myOptions.styles = [{ "featureType": "water", "stylers": [{ "color": "#021019" }] }, { "featureType": "landscape", "stylers": [{ "color": "#08304b" }] }, { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#0c4152" }, { "lightness": 5 }] }, { "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{ "color": "#000000" }] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#0b434f" }, { "lightness": 25 }] }, { "featureType": "road.arterial", "elementType": "geometry.fill", "stylers": [{ "color": "#000000" }] }, { "featureType": "road.arterial", "elementType": "geometry.stroke", "stylers": [{ "color": "#0b3d51" }, { "lightness": 16 }] }, { "featureType": "road.local", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }, { "elementType": "labels.text.fill", "stylers": [{ "color": "#ffffff" }] }, { "elementType": "labels.text.stroke", "stylers": [{ "color": "#000000" }, { "lightness": 13 }] }, { "featureType": "transit", "stylers": [{ "color": "#146474" }] }, { "featureType": "administrative", "elementType": "geometry.fill", "stylers": [{ "color": "#000000" }] }, { "featureType": "administrative", "elementType": "geometry.stroke", "stylers": [{ "color": "#144b53" }, { "lightness": 14 }, { "weight": 1.4 }] }];
    }
    // time of day theming - end
    map = new google.maps.Map(document.getElementById(div), myOptions);
    return map;
}


BKS.FFW.refreshCurrentPage = function () {
    window.location.href = window.location.href;
};

// QS = querystring
BKS.FFW.selectQSItem = function () {

    var id = BKS.FFW.retVal("id");
    for (var i = 0; i < allLocations.length; i++) {
        // look for matching Id
        if (id == allLocations[i].Id) {
            // display info window
            allLocations[i].window.open(allLocations[i].map, allLocations[i].marker);

            BKS.FFW.panToLatLong(allLocations[i].Latitude, allLocations[i].Longitude);

            map.setZoom(15);
            return;
        }
    }

}

BKS.FFW.removeQueryString = function (url) {
    return url.split("?")[0];
}

BKS.FFW.updateURL = function (base, param, paramVal) {
    var url = base.replace('#', '');
    var newAdditionalURL = "";
    var tempArray = url.split("?");
    var baseURL = tempArray[0];
    var aditionalURL = tempArray[1];
    var temp = "";
    if (aditionalURL) {
        var tempArray = aditionalURL.split("&");
        for (var i = 0; i < tempArray.length; i++) {
            if (tempArray[i].split('=')[0] != param) {
                newAdditionalURL += temp + tempArray[i];
                temp = "&";
            }
        }
    }
    var rows_txt = temp + "" + param + "=" + paramVal;
    var finalURL = baseURL + "?" + newAdditionalURL + rows_txt;
    return finalURL;
}


//var message =
//                    '<div class="row-fluid">' +
//                    '    <div class="span4">First option</div>' +
//                    '    <div class="span5">' +
//                    '    <textarea class="input-xlarge psCapitalizeFirst" id="txtComment" rows="2"></textarea>' +
//                    '    </div>' +
//                    '</div>';
//    var btns = [];
//    btns[0] = {
//         'name' : 'OK',
//        'fn' : function () {
//              // do stuff here
//          }
//      }
BKS.FFW.showBSModal = function (header, message, btns, inclCloseBtn) {
    header = header || 'Header';
    message = message || 'Some cool message';
    if (!btns) {
        btns = [];
        //btns.push ({ 'name': 'OKey', 'id': 'myButton', 'fn': function() { alert('clicked!'); } });
    }
    inclCloseBtn = inclCloseBtn || true;

    $("#bsModalHeader").html(header);
    $("#bsModalBody").html(message);

    $("#bsModalButtons").html('');

    var tempHtml = '';

    for (var i = 0; i < btns.length; i++) {
        tempHtml += '<a href="#" class="btn btn-primary" id="' + btns[i].id + '">' + btns[i].name + '</a>';
    }
    if (inclCloseBtn) {
        tempHtml += '<a href="#" class="btn psModalClose">Close</a>';
    }

    $("#bsModalButtons").append(tempHtml);

    for (var i = 0; i < btns.length; i++) {
        $('#' + btns[i].id).off('click'); // TODO may have unintended consequences
        $("#" + btns[i].id).on('click', btns[i].fn);
    }

    $("#bsModal").modal('show');

    $(".psModalClose").click(function () {

        $("#bsModal").modal('hide');

    });
};

/*function selectDisplayDialog() {

var id = retVal("id");
if (id == null) {
//openCityChooser()
}
else {
for (var i = 0; i < allLocations.length; i++) {
// look for matching Id
if (id == allLocations[i].Id) {
// display info window
allLocations[i].window.open(allLocations[i].map, allLocations[i].marker);
// navigate and zoom to
var latlng = new google.maps.LatLng(allLocations[i].Latitude, allLocations[i].Longitude);
map.panTo(latlng);
map.setZoom(15);
return;
}
}
}

}*/

BKS.FFW.redirectToMapIfRequired = function (city) {
    city = BKS.FFW.extend(city, { id: 0, name: '', lat: 0, long: 0 });

    if (window.location.href.indexOf('index') === -1) {
        window.location.href = '../../../Public/index?cityid=' + city.id + '&name=' + city.name + '&lat=' + city.lat + '&long=' + city.long;
        return true;
    }
    return false;
}


BKS.FFW.panToLatLong = function (lat, long) {
    var latlng = new google.maps.LatLng(lat, long);
    map.panTo(latlng);
    return;
}


BKS.FFW.CreateLocation = function (o) {
    this.Id = o.Id;
    this.Name = o.Name;
    this.Address = o.Address;

    this.Latitude = o.Lat;
    this.Longitude = o.Lng;

    this.OpeningTime = o.OpeningTime;
    this.ClosingTime = o.ClosingTime;
    this.ConnectionTimeLimit = o.ConnectionTimeLimit;
    this.ConnectionDataLimit = o.ConnectionDataLimit;
    this.BestReceptionSpot = o.BestReceptionSpot;
    this.IsShaped = o.IsShaped;
    this.PasswordControl = o.PasswordControl;
    this.CredentialRequest = o.CredentialRequest;
    this.CoLocatedService = o.CoLocatedService;
    this.UsagePrerequisite = o.UsagePrerequisite;
    this.URL = o.URL;
    this.Type = o.Type;
}


BKS.FFW.createPopup = function(location) {
    var txt = '<div style="z-index:1032;">';

    txt += '<span style="font-size:large;font-weight:bold;">' + location.Name + '</span><br /><br />';

    txt += '<b>Address: </b>' + location.Address + '<br />';

    if ((location.OpeningTime != null) && (location.OpeningTime.length > 0) && (location.OpeningTime != 'Unknown') && (location.ClosingTime != null) && (location.ClosingTime.length > 0) && (location.ClosingTime != 'Unknown')) {
        txt += '<b>Opening Time: </b>' + location.OpeningTime + ' to ';
        txt += location.ClosingTime + '<br />';
    }

    if ((location.ConnectionTimeLimit != null) && (location.ConnectionTimeLimit != 0))
        txt += '<b>Connection Time Limit: </b>' + location.ConnectionTimeLimit + ' minutes<br />';

    if ((location.ConnectionDataLimit != null) && (location.ConnectionDataLimit != 0))
        txt += '<b>Connection Data Limit: </b>' + location.ConnectionDataLimit + ' MB<br />';

    if ((location.BestReceptionSpot != null) && (location.BestReceptionSpot.length != 0) && (location.BestReceptionSpot != 'Unknown'))
        txt += '<b>Best Reception Spot: </b>' + location.BestReceptionSpot + '<br />';

    if (location.IsShaped != false)
        txt += '<b>is Shaped: </b>' + location.IsShaped + '<br />';

    if ((location.PasswordControl.length > 0) && (location.PasswordControl != 'None'))
        txt += '<b>Password Control: </b>' + location.PasswordControl + '<br />';

    if (location.CredentialRequest != 'None')
        txt += '<b>Credential Request: </b>' + location.CredentialRequest + '<br />';

    txt += '<b>Co-located Service: </b>' + location.CoLocatedService + '<br />';

    if ((location.UsagePrerequisite.length > 0) && (location.UsagePrerequisite != 'None'))
        txt += '<b>Usage Prerequisite: </b>' + location.UsagePrerequisite + '<br />';

    if ((location.URL != null) && (location.URL.length != 0) && (location.URL != 'Unknown'))
        txt += '<b>Website: </b><a href="' + location.URL + '" target="_blank">click here</a>';

    txt += '<br />';
    txt += '<a href="http://www.findfreewifi.co.za/public/index?id=' + location.Id + '">direct link</a>';

    txt += '</div>';
    return txt;

}
BKS.FFW.addMarkersToMap = function (data) {

    allLocations = data;

    function _resolveMarker(type) {
        var img = '';
        switch (type) {
            case 'Coffee Shop':
                img = '../content/images/markers/coffee.png';
                break;
            case 'Restaurant':
                img = '../content/images/markers/restaurant.png';
            case 'Bar':
                img = '../content/images/markers/bar.png';
            case 'Hotel':
                img = '../content/images/markers/hotel.png';
            case 'Shared Work Area':
                 img = '../content/images/markers/workoffice.png';
                break;
            default:
                img = '../content/images/markers/wifi.png';
                break;
        }
        
        return img;
    }
    

    var openInfoWin = null;
    for (var i = 0; i < data.length; i++) {
        var item = data[i];

        var myLatlng = new google.maps.LatLng(item.Latitude, item.Longitude);

        var infoWindow = new google.maps.InfoWindow({
            //content: _resolveDescription(item)
        });

        var icon;
        var marker = new google.maps.Marker({
            position: myLatlng,
            map: map,
            title: item.Name,
            icon: _resolveMarker(item.Type)
        });
        markers.push(marker);

        (function (p, k, win, locationId) {


            google.maps.event.addListener(k, 'click', function () {
                for (var i = 0; i < allLocations.length; i++) {
                    allLocations[i].window.close();
                }

                console.dir(win);

                $.ajax({
                    url: '../../publicjson/SiteFetchLocation',
                    data: {id:locationId},
                    dataType: 'json',
                    type: 'POST',
                    success: function (data) {
                        
                        var html = BKS.FFW.createPopup(data);

                        win.setContent(html);
                        win.open(p, k);
                        openInfoWin = win;
                    }
                });

                
            });
        } (map, marker, infoWindow, item.Id));
        data[i].window = infoWindow;
        data[i].marker = marker;
        data[i].map = map;

    }
   
}


BKS.FFW.clearMapOverlays = function () {
    if (markers) {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
        markers = []; // clear array
    }
}

BKS.FFW.zoom = function (zoom) {
    map.setZoom(zoom);
}
BKS.FFW.zoomToCity = function (cityName) {
    if (cityName != "All")
        BKS.FFW.zoom(11);
    else
        BKS.FFW.zoom(5);
}


var BBlocationCallBack = null;
BKS.FFW.locationCallBack = function () {
    if (blackberry.location.latitude != 0) {
        document.body.style.cursor = "default";
        //window.location.href = '<%: Url.Action("LocationsNearMe", "Mobile")%>' + '?lat=' + blackberry.location.latitude + '&lng=' + blackberry.location.longitude;
        //alert(blackberry.location.latitude, blackberry.location.longitude);

        BBlocationCallBack(blackberry.location.latitude, blackberry.location.longitude);
    }
    else {
        alert('Please retry');
    }
    return true;
}

//TODO SimonS - namespace prefix?
function tryGetLatLong(callback) {


    function redirectWithLocation() {

        document.body.style.cursor = "wait";

        if (window.blackberry && blackberry.location.GPSSupported) {

            BBlocationCallBack = callback;
            // Set our call back function
            blackberry.location.onLocationUpdate("BKS.FFW.locationCallBack()");

            // set to Autonomous mode
            blackberry.location.setAidMode(2);

            //refresh the location
            blackberry.location.refreshLocation();

            //blackberry.location.removeLocationUpdate();
        }
        else if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                                    function (position) {

                                        document.body.style.cursor = "default";
                                        //alert('lat=' + position.coords.latitude + '   lng=' + position.coords.longitude);
                                        callback(position.coords.latitude, position.coords.longitude);
                                    },
            // next function is the error callback
                                    function (error) {
                                        switch (error.code) {
                                            case error.TIMEOUT:
                                                alert('Timeout');
                                                break;
                                            case error.POSITION_UNAVAILABLE:
                                                alert('Position unavailable');
                                                break;
                                            case error.PERMISSION_DENIED:
                                                alert('Permission denied');
                                                break;
                                            case error.UNKNOWN_ERROR:
                                                alert('Unknown error');
                                                break;
                                        }
                                    }
                            );
        }
        else // finish the error checking if the client is not compliant with the spec
        {
            alert('cant geolocate');

        }

    }

    redirectWithLocation();


}

BKS.FFW.showWifiSpotDialog = function () {


    function getContentForAddWifiSpotDialog() {

        var message =
                     '<div class="row-fluid">' +
                     '    <div class="span4">Hot spot name</div>' +
                     '    <div class="span5">' +
                     '      <input type="text" id="wifiSpotName" /><br />' +
                     '    </div>' +
                     '</div>' +
                     '<div class="row-fluid">' +
                     '    <div class="span4">Address line 1</div>' +
                     '    <div class="span5">' +
                     '      <input type="text" id="addressLine1" /><br />' +
                     '    </div>' +
                     '</div>' +
                     '<div class="row-fluid">' +
                     '    <div class="span4">Address line 2</div>' +
                     '    <div class="span5">' +
                     '      <input type="text" id="addressLine2" /><br />' +
                     '    </div>' +
                     '</div>' +
                     '<div class="row-fluid">' +
                     '    <div class="span4">City</div>' +
                     '    <div class="span5">' +
                     '      <input type="text" id="city" /><br />' +
                     '    </div>' +
                     '</div>' +
                     '<div class="row-fluid">' +
                     '    <div class="span4">Email Address/Twitter</div>' +
                     '    <div class="span5">' +
                     '      <input type="text" id="contactDetails" /><br />' +
                     '    </div>' +
                     '</div>' +
                     '<div class="row-fluid">' +
                     '    <div class="span4">Use current Lat/Long</div>' +
                     '    <div class="span5">' +
                     '      <input type="checkbox" id="checkBoxCoordinates" /><br />' +
                     '    </div>' +
                     '</div>' +
                     '<div class="row-fluid">' +
                     '    <div class="span4"></div>' +
                     '    <div class="span5">' +
                     '    <div id=latitude></div>' +
                     '    <div id=longitude></div>' +
                     '</div>';

        return message;
    };

    function getAddButtonForAddWifiSpot() {

        var addButton = {
            'name': 'Add',
            'fn': function () {

                if ($('#wifiSpotName').val() === '') {
                    alert('Please enter a name for the WiFi spot.');
                    $('#wifiSpotName').focus();
                    return false;
                }

                //Wim: latitude should be optional i updated below was unable to test though as I was getting a timeout when trying to get the coords
                if (
                    ($('#addressLine1').val().length === 0 && $('#addressLine2').val().length === 0)
                     && ($('#latitude').html() === '' && $('#longitude').html() === '')) {
                    alert('Please enter either the address or latitude/longitude.');
                    $('#addressLine1').focus();
                    return false;
                }

                saveWifiSpot();
            }
        };


        function saveWifiSpot() {

            // Wim looks fine, do you get a good response from the server? I get a done response
            // Wim feel free to test by doing some adds. I did add a few
            var newLocation = {
                Name: $('#wifiSpotName').val(),
                Address: $('#addressLine1').val() + ' ' + $('#addressLine2').val(),
                City: $('#city').val(),
                Lat: $('#latitude').html().replace('Latitude: ',''),
                Lng: $('#longitude').html().replace('Longitude: ', ''),
                ColocatedService: "None",
                DataLimit: 0,
                TimeLimit: 0,
                ReporterIdentifier: $('#contactDetails').val()
            };

            $.ajax({
                url: 'http://www.findfreewifi.co.za/publicjson/addlocation',
                data: newLocation,
                dataType: 'json',
                type: 'POST',
                success: function (data) {
                    if (data.Success == true) {
                        alert("Awesome!  We've got your hotspot info and will check it out.");
                        $("#bsModal").modal('hide');
                    } else {
                        alert("Oops, something went wrong.  Please can you retry else hit us up on Twitter and let us know what happened.");
                    }
                }
            });
        }

        return addButton;
    };

    var btns = [];
    btns[0] = getAddButtonForAddWifiSpot();

    BKS.FFW.showBSModal('Add a WiFi location', getContentForAddWifiSpotDialog(), btns, true);

    setTimeout(function () {
        $("#wifiSpotName").focus();
    }, 500);

};

BKS.FFW.includeCurrentUserCoordinates = function () {

    tryGetLatLong(function (latitude, longitude) {
        $('#latitude').html('Latitude: ' + latitude);
        $('#longitude').html('Longitude: ' + longitude);
    });

};

$(function () {

    $(document).on('change', '#checkBoxCoordinates', function (e) {
        e.preventDefault();
        BKS.FFW.includeCurrentUserCoordinates();
    });

    $("#btnAddWiFiSpot").click(function (e) {
        e.preventDefault();
        BKS.FFW.showWifiSpotDialog();
    });

    // near me
    $(".psCitySelector").click(function (e) {
        e.preventDefault();
        //alert('near me:' + top.nearme);
        //if (typeof top.nearme == 'undefined') {
            //alert('not near me ...');
            //if (BKS.FFW.retVal("nearme") == null) {
                //alert('qs near me');
                if (window.location.href.indexOf('Developers') != -1 || window.location.href.indexOf('About') != -1) {
                    //alert('setting near me');
                    window.location.href = "../Public/Index"; //?nearme=true";
                    return;
                }
            //}
        //}
        // TODO if not on homepage, add to QS, then redirect

        //alert('not completed');
        var redirecting = false;
        var go = function (lat, long) {
            //alert('go:  lat=' + lat + '  long:' + long);
            if (!redirecting) {

                //alert('not redirecting');

                if (cityName === 'Locations near me') {
                    BKS.FFW.loadLocationsForCity('All');
                    BKS.FFW.panToLatLong(lat, long);
                }
                else {
                    //alert('redirecting for city:' + cityName);
                    BKS.FFW.loadLocationsForCity(cityName);
                    BKS.FFW.panToLatLong(cityLat, cityLong);
                }
                $("#spanCurrentCity").html('');
                $("#spanCurrentCity").html('Viewing ' + cityName);

                if (cityName === 'All')
                    map.setZoom(5);
                else if (cityName === 'Locations near me')
                    map.setZoom(14);
                else
                    map.setZoom(11);

                setTimeout(function () {
                    new google.maps.Marker({
                        position: new google.maps.LatLng(lat, long),
                        map: map,
                        title: "We think you are here",
                        animation: google.maps.Animation.DROP
                    })
                }, 1500);


                return;
                //BKS.FFW.Evt_CityFocus({ id: cityId, name: cityName });
            }
        }

        if ($(this).attr("data-near-me") == "true") {
            //alert('locations near me');
            cityName = 'Locations near me';
            tryGetLatLong(go);
            return;
        }
        else {
            var cityId = $(this).attr("data-city-id");
            var cityName = $(this).attr("data-city-name");
            var cityLat = $(this).attr("data-city-lat");
            var cityLong = $(this).attr("data-city-long");

            //check current page, if not index, then redirect with querystring data
            redirecting = BKS.FFW.redirectToMapIfRequired({ id: cityId, name: cityName, lat: cityLat, long: cityLong });
            //alert('redirecting:' + redirecting);
            //alert('redirect required:' + redirecting);


            go(cityLat, cityLong);
        }
    });
});






