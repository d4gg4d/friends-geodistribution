//"use strict"; //ECMAScript5 feature
function initialize() {
    console.log("google maps loaded...");
}

!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//maps.googleapis.com/maps/api/js?sensor=false&callback=initialize";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","google-maps-api");

