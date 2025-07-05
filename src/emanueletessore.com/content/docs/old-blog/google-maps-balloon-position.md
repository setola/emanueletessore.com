---
title: 'Google Maps balloon position error'
date: Sat, 05 May 2012 19:24:17 +0000
draft: false
tags: ['google maps', 'JavaScript']
disqus_url: http://www.emanueletessore.com/google-maps-balloon-position/
---

If you're working on a website which needs a map wrapped in a really low element, you'll probably have some issue with
the **Google Maps balloon position** over a pinpoint.

It will be **cut by the top border**: if you open it by clicking
on the pinpoint the map scrolls down, but if you let the popup open on page loaded it will be cut out by the map limit.

This is because the library doesn't know how high the pinpoint image will be when the event
containing `infowindow.open()` is fired.

Here's a reference screenshot of the Google Maps popup positioning error I'm talking
about: ![Google Maps balloon position error](/old-blog/google-maps-balloon-position/bug.png "bug")

The solution is pretty easy: you can workaround this issue by **opening the balloon when the gmaps library fires
the `tilesloaded` event**.

At this time the pinpoint image is fully loaded and the library can make the map scroll as far as needed to the
balloon to be showed.

To do this you can use this code:

```javascript
google.maps.event.addListener(map, 'tilesloaded', function() { 
    infowindow.open(map,marker);
});
```

note: `infowindow` is a
[google.maps.InfoWindow](https://developers.google.com/maps/documentation/javascript/reference#InfoWindow "Google Maps Javascrip API v3 - InfoWindow Object")
object And that's how the InfoWindow object should be positioned in very low Google Map:

![Google Maps balloon position error fixed](/old-blog/google-maps-balloon-position/fixed.png "fixed")