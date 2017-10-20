var map, index, locations;

// Create a new blank array for all the listing markers.
var markers = [];

function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 24.9306, lng: 75.5909},
    zoom: 13
  });

  // These are the real estate listings that will be shown to the user.
  // Normally we'd have these in a database instead.
  locations = [
    {title: 'Baroli Temple', location: {lat: 24.95806, lng: 75.59361}},
    {title: 'Uma Oil Company', location: {lat: 24.938861, lng: 75.587233}},
    {title: 'RAPP Hospital', location: {lat: 24.931954, lng: 75.601041}},
    {title: 'Axis Bank ATM', location: {lat: 24.931789, lng: 75.601674}},
    {title: 'Heavy Water Colony', location: {lat: 24.932655, lng: 75.600987}},
    {title: 'NTC Gate', location: {lat: 24.935399, lng: 75.605826}}
  ];

  var largeInfowindow = new google.maps.InfoWindow();
  var bounds = new google.maps.LatLngBounds();

  // The following group uses the location array to create an array of markers on initialize.
  for (var i = 0; i < locations.length; i++) {
    // Get the position from the location array.
    var position = locations[i].location;
    var title = locations[i].title;
    // Create a marker per location, and put into markers array.
    var marker = new google.maps.Marker({
      map: map,
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      id: i
    });
    // Push the marker to our array of markers.
    markers.push(marker);
    // Create an onclick event to open an infowindow at each marker.
    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow);
    });
    bounds.extend(markers[i].position);
  }
  // Extend the boundaries of the map for each marker

  document.getElementById('zoom-to-area').addEventListener('click', function() {
    zoomToArea();
  });

  map.fitBounds(bounds);
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    infowindow.setContent('<div>' + marker.title + '</div> <div>Latitude: ' + marker.position.lat().toFixed(2) + ', Longitude: ' + marker.position.lng().toFixed(2) + '</div>');
    infowindow.open(map, marker);
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick',function(){
      infowindow.setMarker = null;
    });
  }
}

function zoomToArea() {
  // Initialize the geocoder.
  var geocoder = new google.maps.Geocoder();
  // Get the address or place that the user entered.
  var address = document.getElementById('zoom-to-area-text').value;
  // Make sure the address isn't blank.
  if (address == '') {
    window.alert('You must enter an area, or address.');
  } else {
    // Geocode the address/area entered to get the center. Then, center the map
    // on it and zoom in
    geocoder.geocode(
      { address: address,
        componentRestrictions: {locality: 'Rawatbhata'}
      }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          map.setCenter(results[0].geometry.location);
          map.setZoom(15);
        } else {
          window.alert('We could not find that location - try entering a more' +
              ' specific place.');
        }
      });
  }
}

var Location = function(data) {

  this.title = ko.observable(data.title);
  this.location = ko.observable(data.location);

}

var ViewModel = function() {
  
  var self = this;

  this.locationList = ko.observableArray(locations);

  location.forEach(function(place) {
    self.locationList.push(new Location(place));
  });

}