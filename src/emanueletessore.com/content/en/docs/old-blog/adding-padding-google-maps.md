---
title: 'Adding some padding on a Google Maps'
date: Mon, 13 Oct 2014 10:39:51 +0000
draft: false
tags: ['News']
featured_image: https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg
---

Some days ago I was asked to make a google maps with a nice translucent bar on "position absolute". Everything worked
fine until some map markers went under the box.

To fix this issue I had to use
the [Projection](https://developers.google.com/maps/documentation/javascript/reference#Projection) object to translate
the vertical and horizontal box pixels into gmaps coordinates and then extend the map bounds. Here's the code:

```javascript
// used globals
//window.map;
//window.styledMap;
//window.infowindow;
//window.bounds;
//window.overlay;

window.markers = [{
  "title": "Marker Title",
  "point": {"lat": 46.255762928292, "lng": 10.504977026953},
  "content": "Box Content Here!"
}];

function initialize() {
  window.bounds = new google.maps.LatLngBounds();
  window.overlay = new google.maps.OverlayView();
  // this is required by Google APIs but useless for our intents
  window.overlay.draw = function () {
  };

  var myOptions = {
    zoom: 10,
    center: new google.maps.LatLng(window.markers[0].point.lat, window.markers[0].point.lng),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: false,
    streetViewControl: false,
    scrollwheel: false
  };
  window.map = new google.maps.Map(document.getElementById('map-canvas'), myOptions);

  var styles = [];
  styles.push({
    featureType: "poi.business",
    elementType: "labels",
    stylers: [
      {visibility: "off"}
    ]
  });
  window.styledMap = new google.maps.StyledMapType(styles, {name: "Styled Map"});

  window.map.mapTypes.set('map_style', window.styledMap);
  window.map.setMapTypeId('map_style');

  window.infowindow = new google.maps.InfoWindow({
    content: 'Placeholder'
  });
  
  var setPopupContent = function(){
      window.infowindow.setContent(this.html);
      window.infowindow.open(window.map, this);
  };

  for (var i = 0; i < window.markers.length; i++) {
    var position = new google.maps.LatLng(window.markers[i].point.lat, window.markers[i].point.lng);
    var marker = new google.maps.Marker({
      position: position,
      map: window.map,
      title: window.markers[i].title,
      html: window.markers[i].content
    });

    bounds.extend(position);

    google.maps.event.addListener(marker, 'click', setPopupContent);

  }

  overlay.setMap(window.map);
  var paddings = {
    top: parseInt(document.getElementById('overlay-top').clientHeight),
    right: parseInt(document.getElementById('overlay-right').clientWidth),
    bottom: parseInt(document.getElementById('overlay-bottom').clientHeight),
    left: parseInt(document.getElementById('overlay-left').clientWidth)
  };

  google.maps.event.addListenerOnce(map, 'idle', function () {
    mapEnforcePaddings(window.map, window.overlay, window.markers, paddings);
  });

  google.maps.event.addListener(map, 'resize', function () {
    mapEnforcePaddings(window.map, window.overlay, window.markers, paddings);
  });

}

var mapEnforcePaddings = function (map, overlay, markers, paddings) {
  if (typeof(paddings.top) == 'undefined') paddings.top = 0;
  if (typeof(paddings.right) == 'undefined') paddings.right = 0;
  if (typeof(paddings.bottom) == 'undefined') paddings.bottom = 0;
  if (typeof(paddings.left) == 'undefined') paddings.left = 0;

  var projection = overlay.getProjection();
  var bounds = new google.maps.LatLngBounds(map.getBounds().getSouthWest(), map.getBounds().getNorthEast());

  for (var i = 0; i < markers.length; i++) {
    var markerLatLng = new google.maps.LatLng(markers[i].point.lat, markers[i].point.lng);
    var markerPixelCoordinates = projection.fromLatLngToDivPixel(markerLatLng);

    bounds.extend(
      projection.fromDivPixelToLatLng({
        x: markerPixelCoordinates.x - paddings.left,
        y: markerPixelCoordinates.y - paddings.top
      })
    );

    bounds.extend(
      projection.fromDivPixelToLatLng({
        x: markerPixelCoordinates.x + paddings.right,
        y: markerPixelCoordinates.y + paddings.bottom
      })
    );

  }
  map.fitBounds(bounds);
  map.panBy(
    (paddings.right - paddings.left) / 2,
    (paddings.bottom - paddings.top) / 2
  );
};

```

See the CodePen [Google Maps paddings](http://codepen.io/setola/pen/zdBqL/) 