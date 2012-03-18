define(['underscore'],function(_) {
    
    /*
     * This module packages authenticaion and data extraction logic
     * from Facebook via Facebooks javaScriptSDK. These methods use
     * heavily underscore library to parse desired data structure from
     * queries results which are done with Facebooks FQL.
     *
     * These method could be done in the backend but then theres is
     * the scaling issue to be considered. Now all the computation
     * load is in client and there is no need for central shared
     * resource (e.g., backend server) from the application
     * side. Scalability is therefore only dependent on Facebooks
     * services.
     */

    window.fbAsyncInit = function() {
	FB.init({
	    appId      : '367787493254897', // App ID
	    channelUrl : '//friends-geodistribution.herokuapp.com/channel.html', // Channel File
	    status     : true, // check login status
	    cookie     : true, // enable cookies to allow the server to access the session
	    xfbml      : true  // parse XFBML
	});
	
	console.log("facebook SDK loaded.")
    };

    // Load the SDK Asynchronously
    (function(d){
	var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
	if (d.getElementById(id)) {return;}
	js = d.createElement('script'); js.id = id; js.async = true;
	js.src = "//connect.facebook.net/en_US/all.js";
	ref.parentNode.insertBefore(js, ref);
    }(window.document));
    
    var uid,accessToken;

    /*
     * Handles the aquirement of the proper authentication tokens to SDK.
     */
    var refreshLoginData = function(options) {
	uid = accessToken = null;
	FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {
                uid = response.authResponse.userID;
                accessToken = response.authResponse.accessToken;
		options.success({"accessToken":accessToken,"uid":uid});
            } else if (response.status === 'not_authorized') {
		console.log("user not authorized, authorizing..");
		loginToApp(options);
            } else {
		console.log("user isn't logged into facebook, trying to log in..");
		loginToApp(options);
            }
	});
    };		
    
    /*
     * Utility functions for retirieving authentication information.
     */
    var loginToApp = function (options) {
	FB.login(function(response) {
	    if (response.authResponse) {
		console.log("loggin & authorization successful, refreshing..")
		refreshLoginData(options);
	    } else {
		failure(options.failure(response.error));
	    }
	},{scope:"user_location,friends_location"})
    }

    var getUID = function(options) {
	if (uid) {
	    options.success({"uid":uid});
	} else {
	    refreshLoginData(options);
	}
    };
    
    var getAccessToken = function(options) {
	if (accessToken) {
	    options.success({"accessToken":accessToken});
	} else {
	    refreshLoginData(options);
	}
    };
    
    /* ==============================================================
     * DATA PARSING:
     * 
     * Methods here could be implemented in the backend but are easily
     * computed in the client as well. Benifit in this approarch is
     * that your application is scalable as Facebook itself. Cons are
     * that applications startup time is higher due to computational
     * load and minimum requirement for your browser is higher
     * (i.e. needs modern browsers). Possible improvement could be to
     * do calculations in the Web Worker script.
     */

    /*
     * Parses application users location information which is used to
     * center Google Map.
     */
    var userLocation = function(options) {
	getUID({
	    success: function(response) {
		FB.api('/'+response.uid, function(response) {
                    FB.api('/' + response.location.id, function(response) {
			var lat = response.location.latitude;
			var long = response.location.longitude;
			var name = response.name;
			options.success({"name":name, "latitude":lat, "longitude":long, "female": 0, "male":0});
		    });
		});
	    }, 
	    failure: options.failure
	});
    };
    
    /*
     * Util function to retrieve users friend data to other parser
     * function.
     */
    var userFriendData = function(options) {
	FB.api('/fql', {q: {"query1":'SELECT current_location,sex FROM user WHERE uid IN (SELECT uid2 FROM friend WHERE uid1 = me())'}}, 
	       function(response) {
		   if (response.error) {
		       options.failure("failed query friends");
		   } else { 
		       options.success({data:response.data[0].fql_result_set});
		   }
	       });
    };
    
    /*
     * Parses friend query to map where each found location has values
     * how many friends there lives.
     */
    var parseLocations = function(options) {
	userFriendData({
	    success: function(data) {
		options.success(_.reduce(data.data, function(memo, i) {
		    if (!!i.sex && !!i.current_location) {
			var locationId = i.current_location.id; 
			if (!memo[locationId]) {
			    memo[locationId] = {"male":0,"female":0};
			}
			memo[locationId][i.sex]++;
		    }
		    return memo;
		} , {}));
	    }, 
	    failure: options.failure });
    };

    /*
     * Function that combines data from 2 queries, location position
     * and friend count.
     */
    var parseCoordinates = function(options) {
	parseLocations({
	    success: function(data) {
		var ids = _.filter(_.map(data,function(v,k){return k}), function(i) {return (i !== "undefined")});
		FB.api('/fql', {q: {"query1":'SELECT page_id,name,latitude,longitude FROM place WHERE page_id IN('+ids.join(",")+")"}}, 
		       function(response){
			   if (response.error) {
			       // This is commented out because of mysterious double call from facebook SDK.
			//       options.failure("failed to query location data.")
			   } else { 
			       var locs = response.data[0].fql_result_set;
			       _.each(locs, function(v) {
				   data[v.page_id].name = v.name;
				   data[v.page_id].latitude = v.latitude;
				   data[v.page_id].longitude = v.longitude;
			       });
			       
			       options.success({data: _.map(data, function(v,k) {
				   v["id"]=k;
				   return v
			       })});
			   }
		       });
	    }, failure: options.failure});
    };

    /*
     * Exposing only functions that produce ready data to be presented
     * in the view. Authentication functions are only for testing
     * purposes.
     */
    return {"refreshToken" : refreshLoginData, 
	    "uid" : getUID, 
	    "accessToken" : getAccessToken, 
	    "getMyLocation" : userLocation,
	    "getFriendData" : userFriendData,
	    "getLocations" : parseLocations,
	    "parseCoordinates" : parseCoordinates};
});
