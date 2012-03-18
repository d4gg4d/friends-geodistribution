"use strict";
define(['jquery','backbone','text!templates/friendmap.html','js/sdk/facebook'],
       function($, bb, content, fb){

	   /* 
	    *  BB model that defines Marker in the google map with
	    *  parsed data from facebook. For parsing we could use
	    *  REST backend and defined just url variable which then
	    *  would parse the data from facebook. But it was more
	    *  convinient to do data parsing in client side in
	    *  /js/sdk/facebook module.
	    */
           var LocationOnMap = bb.Model.extend({
               defaults: {id:0, 
			  "latitude":0.0, 
			  "longitude":0.0, 
			  "female":0, 
			  "male":0, 
			  "name":"Unknown places"},
               
               center: function() {
                   return new google.maps.LatLng(this.get("latitude"),this.get("longitude"));
               },

               friendCount: function() {
                   return (this.get("male") + this.get("female"));
               },
	       
	       markerInfo: function() {
		   return  [this.get("name"),
			    ": You have",
			    this.friendCount(),
			    "(",
			    this.get("male"),
			    "male",
			    "and",
			    this.get("female"),
			    "female )","friends here."].join(" ");
	       },

	       generateMarker: function(map) {
		   var self = this;
		   var marker = new window.google.maps.Marker({position: this.center(),
							       map: map, 
							       title: this.markerInfo()
							      });
		   var infoWindow = new window.google.maps.InfoWindow({
		       content: "jibberish"
		   });
		   
		   google.maps.event.addListener(marker, 'click', function() {
		       infoWindow.content = '<p>' + self.markerInfo(); '</p>';
		       infoWindow.open(map, marker);
		   });
	       }
           });

           // Definition of Locations collection
           var Locations = bb.Collection.extend({
               model: LocationOnMap
           });

	   // collection of plotted locations
	   var locations;

	   // GoogleMap entity
	   var gmap;
	   
           // using Backbone view to manage re-rendering of the API components in contact template.
           var MapView = bb.View.extend({
               render: function() {
                   $(this.el).html(content);
                   window.FB.XFBML.parse();
                   this.putMyLocationToCenter();
                   return this;
               },

	       putMyLocationToCenter: function() {
		   var self = this;
		   fb.getMyLocation({
		       success: function(mylocData) {
			   var myLocation = new LocationOnMap(mylocData);
			   
			   gmap = self.generateGMap(myLocation);

			   self.retrieveLocationsData();
		       }, 
		       
		       failure: function() {
			   alert("Failed to retrieve your location!")
		       }
		   });
	       },

	       retrieveLocationsData: function() {
		   var self = this;
		   fb.parseCoordinates({
		       success: function(data) {
		   	   locations = new Locations(data.data);
		   	   self.generateLocations();
		       }, 
		       failure: function(msg) {
		   	   alert("fullInfo failed:" + msg)
		       }
		   });
	       },

	       generateLocations: function() {
		   _.each(locations.models, function(v) {
		       v.generateMarker(gmap);
		   });
	       },

	       generateGMap: function(location) {
		   return new window.google.maps.Map($("#map_canvas")[0],
						     { zoom: 4,
						       panControl: true,
						       zoomControl: true,
						       mapTypeControl: false,
						       scaleControl: true,
						       streetViewControl: false,
						       overviewMapControl: false,
						       mapTypeId: google.maps.MapTypeId.ROADMAP,
						       center: location.center()});
	       }
           });

	   // from this module we only want to expose the view that is
	   // attached and detached by app.js
	   return {view: MapView};
       });