var initialSpaces = [
{
  "name": 'Baroli Temple',
  "location": {"lat": 24.95806, "lng": 75.59361},
  "fs_id": "4d53cf28f9f9b60c9c2527e6"
},
{
  "name": "RAPS Hospital",
  "location": {"lat": 24.931954, "lng": 75.601041},
  "fs_id": "50a33faee4b068340f133fc1"
},
{
  "name": "Axis ATM Bank",
  "location": {"lat": 24.931789, "lng": 75.601674},
  "fs_id": "59edceeda3061936f1b3c205"
},
{
  "name": "Heavy Water Colony",
  "location": {"lat": 24.932655, "lng": 75.600987},
  "fs_id": "4ff698eee4b04619c7162ba1"
},
{
  "name": "NTC Gate",
  "location": {"lat": 24.935399, "lng": 75.605826},
  "fs_id": "59edd0e06bdee6069e109ee4"
},
{
  "name": "Main Market",
  "location": {"lat": 24.930228, "lng": 75.592779}, 
  "fs_id": "5237401e11d2f50aefae72dc"
},
{
  "name": "Open Air Theatre",
  "location": {"lat": 24.936354, "lng": 75.605019}, 
  "fs_id": "53f3feca498e94887baee5b9"
},
{
  "name": "Yogmaya",
  "location": {"lat": 24.937331, "lng": 75.613319}, 
  "fs_id": "508d2d6fe4b0ed73380862fd"
},
]

// Foursquare API Url parameters in global scope
var BaseUrl = "https://api.foursquare.com/v2/venues/",
    fsClient_id = "client_id=JJDI4PSIYTKIQHVNDVV304ITAVJXE5Q510JCB4G323SDY40W",
    fsClient_secret = "&client_secret=YWNJJIONIRORBNZ1P2PQNMKJEO1YOAPVUCWX3TFVV5FFW4SL",
    fsVersion = "&v=20161507";


// Create global variables to use in google maps
var map,
  infowindow,
  bounds;

//googleSuccess() is called when page is loaded
function googleSuccess() {
  "use strict";

  //Google map elements - set custom map marker
  var image = {
    "url": "img/32x32.png",
    "size": new google.maps.Size(32, 32),
    "origin": new google.maps.Point(0, 0),
    "anchor": new google.maps.Point(0, 32)
  };

  //Google map elements - set map options
  var mapOptions = {
    "center": {
      "lat": 24.9306, 
      "lng": 75.5909
    },
    zoom: 13,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: false,
    mapTypeControlOptions: {
    style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
    }
  };
  map = new google.maps.Map(document.getElementById("map"), mapOptions);
  infowindow = new google.maps.InfoWindow({
    maxWidth: 150,
    content: ""
  });
  bounds = new google.maps.LatLngBounds();

  // Close infowindow when clicked elsewhere on the map
  map.addListener("click", function(){
    infowindow.close(infowindow);
  });

  // Recenter map upon window resize
  window.onresize = function () {
    map.fitBounds(bounds);
  };


  //Creating Space object
  var Space = function (data, id, map) {
    var self = this;
    this.name = ko.observable(data.name);
    this.location = data.location;
    this.marker = "";
    this.markerId = id;
    this.fs_id = data.fs_id;
    this.shortUrl = "";
    this.photoUrl = "";
  }

  // Get contect infowindows
  function getContent(space) {
    var contentString = "<h3>" + space.name +
      "</h3><br><div style='width:200px;min-height:120px'><img src=" + '"' +
      space.photoUrl + '"></div><div><a href="' + space.shortUrl +
      '" target="_blank">More info in Foursquare</a><img src="img/foursquare_150.png">';
    var errorString = "Oops, Foursquare content not available."
    if (space.name.length > 0) {
      return contentString;
      } else {
      return errorString;
      }
  }

  // Bounce effect on marker
  function toggleBounce(marker) {
    if (marker.getAnimation() !== null) {
      marker.setAnimation(null);
    } else {
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function() {
        marker.setAnimation(null);
      }, 700);
    }
  };

 function ViewModel() {
    var self = this;

    // Nav button control
    this.isNavClosed = ko.observable(false);
    this.navClick = function () {
      this.isNavClosed(!this.isNavClosed());
    };

    // Creating list elements from the spaceList
    this.spaceList = ko.observableArray();
    initialSpaces.forEach(function(item){
      self.spaceList.push(new Space(item));
    });

    // Create a marker per space item
    this.spaceList().forEach(function(space) {
      var marker = new google.maps.Marker({
        map: map,
        position: space.location,
        animation: google.maps.Animation.DROP
      });
      space.marker = marker;
      // Extend the boundaries of the map for each marker
      bounds.extend(marker.position);
      // Create an onclick event to open an infowindow and bounce the marker at each marker
      marker.addListener("click", function(e) {
        map.panTo(this.position);
        //pan down infowindow by 200px to keep whole infowindow on screen
        map.panBy(0, -200)
        infowindow.setContent(getContent(space));
        infowindow.open(map, marker);
        toggleBounce(marker);
    });
  });

    // Foursquare API request
    self.getFoursquareData = ko.computed(function(){
      self.spaceList().forEach(function(space) {

        // Set initail variables to build the correct URL for each space
        var  venueId = space.fs_id + "/?";
        var foursquareUrl = BaseUrl + venueId + fsClient_id + fsClient_secret + fsVersion;

        // AJAX call to Foursquare
        $.ajax({
          type: "GET",
          url: foursquareUrl,
          dataType: "json",
          cache: false,
          success: function(data) {
            var response = data.response ? data.response : "";
            var venue = response.venue ? data.venue : "";
                space.name = response.venue["name"];
                space.shortUrl = response.venue["shortUrl"];
          }
        });
      });
    });

    // Creating click for the list item
    this.itemClick = function (space) {
      var markerId = space.markerId;
      google.maps.event.trigger(space.marker, "click");
    }

    // Filtering the Space list
    self.filter = ko.observable("");

    this.filteredSpaceList = ko.dependentObservable(function() {
      var q = this.filter().toLowerCase();
      //var self = this;
      if (!q) {
      // Return self.spaceList() the original array;
      return ko.utils.arrayFilter(self.spaceList(), function(item) {
        item.marker.setVisible(true);
        return true;
      });
      } else {
        return ko.utils.arrayFilter(this.spaceList(), function(item) {
          if (item.name.toLowerCase().indexOf(q) >= 0) {
          return true;
          } else {
            item.marker.setVisible(false);
          return false;
          }
        });
      }
    }, this);
  };

 // Activates knockout.js
ko.applyBindings(new ViewModel());
}

'use strict';

var mapError = function() {

    document.getElementById('map-error').style.display = 'block';

    document.getElementById('map-error').innerHTML = 'Sorry, something went wrong. Please try again later.';

};