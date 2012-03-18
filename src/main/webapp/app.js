define([
    'jquery',
    'underscore',
    'backbone',
    'js/sdk/facebook'
], function($, _, Backbone, fb){

    /*
     * This module provides logic for index.html to render views
     * properly. Once created, views aren't destroyed so changing
     * between views doesn't reset them. 
     */

    var views = {};
    var currentView;

    return {
        initialize: function(){
             $("menu button").click(function() {
                 var id = this.id;

                 require(['js/'+id], function(apiModule) {
                    if (currentView) {
                        currentView.remove();
                        $("#mainPage").append("<div id=\"contentArea\" class\"main content\"></div>");
                    }
                    if (views[id]) {
                        $("#mainPage").html(views[id].el);
                    } else {
                        var renderedView = apiModule.view;
                        currentView = new renderedView({el: $("#contentArea")}).render();
                        views[id] = currentView;
                    }
                 });
            });

        }
    };
});
