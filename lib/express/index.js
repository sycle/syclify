"use strict";

var _ = require('lodash');
var syclify = require('./../syclify');

var express = module.exports = function (/*app, options, cb*/) {
    var app, options, cb;
    var i, arg;
    for (i = 0; i < arguments.length; i++) {
        arg = arguments[i];
        if (!app && isApp(arg)) {
            app = arg;
        } else if (!cb && typeof arg === 'function') {
            cb = arg;
        } else if (!options) {
            options = arg;
        } else {
            throw new Error('Invalid arguments');
        }
    }

    var sapp = syclify(options);

    if (!app) {
        app = require('express')();
    }

    app.sapp = sapp;
    sapp.app = app;

    app.install =  function install() {
        if (app._installed_for_sapp) return;
        app._installed_for_sapp = true;

        var opitons = sapp.get('veriuser');
        if (opitons !== false) {
            app.use(require('sycle-express-veriuser')(sapp, opitons));
        }

        options = sapp.get('rest');
        if (options !== false) {
            var apiUrl = options.url || '/api';
            app.use(apiUrl, require('sycle-express-rest')(sapp));

            options = sapp.get('explorer');
            if (options) {
                options = typeof options === 'object' ? options : {};
                options = _.defaults(options, { basePath: apiUrl });
                app.use(options.url || '/explorer', require('sycle-express-explorer')(sapp, options));
            }
        }
    };

    sapp.boot(function (err) {
        if (err && !cb) throw err;
        if (err) return cb(err);
        process.nextTick(function () {
            app.install();
        });
        cb(null, app);
    });

    return app;
};

function isApp(obj) {
    return typeof obj === 'function' && obj.request && obj.response && typeof obj.handle === 'function';
}

require('./middleware')(express);