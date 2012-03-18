"use strict";
define(['jquery','backbone','text!templates/contact.html'],
    function($, bb, content){

    /* Using Backbone View to manage re-rendering of the contant
     * view. This is very simple View deifinition, but so is the
     * contact page.
     */
    var ContactView = bb.View.extend({
        render: function() {
            $(this.el).html(content);
            window.twttr.widgets.load();
            window.FB.XFBML.parse();
            return this;
        }
    });
	// Only the view is exposed to app.js view selector.
    return {view: ContactView};
});