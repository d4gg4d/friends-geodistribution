"use strict";
require.config({
    paths: {
        underscore: 'js/libs/amdjs/underscore-min',
        backbone: 'js/libs/amdjs/backbone-min',
        jquery: 'js/libs/jquery-min',
        text: "js/libs/require/text"
    }
});

/*
 * Purpose of this module is just to alias used libraries and to speed
 * up SDK loading by preloading them before app.js initialized.
 */

require([
    'order!js/sdk/twitter',
    'order!js/sdk/facebook',
    'order!js/sdk/google',
    'app'], function(t,f,g,app){
        app.initialize();
    }
);
