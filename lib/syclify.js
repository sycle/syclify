"use strict";

var _ = require('lodash');
var sycle = require('sycle');
var needs = require('needs');

module.exports = exports = syclify;

/**
 *
 *
 * @param {String} [root] The root path of the application
 * @param {Object} [options] The options object
 * @param options.loadBuiltinModels=true The options object
 * @param options.modules the modules auto load.
 * @param options.extensions the extensions directory.
 * @param options.initializers the initializers directory
 * @param options.auth whether enable authorizer middleware
 * @param options.db database options. Examples:
 * { driver: 'redis' }
 * or
 * {
 *      mysql: {
 *          driver: 'mysql',
 *          models: ['User', 'Role'...]
 *      },
 *      redis: {
 *          driver: 'redis',
 *          models: ['User', 'Role'...]
 *      }
 * }
 * </pre>
 *
 *
 * @returns {*}
 */
function syclify(root, options) {
    if (typeof root === 'object') {
        options = root;
        root = null;
    }
    options = options || {};
    root = root || options.root || process.cwd();
    delete options.root;

    if ('loadBuiltinModels' in options) {
        options.loadBuiltinModels = !!options.loadBuiltinModels;
    } else {
        options.loadBuiltinModels = true;
    }

    var sapp = new sycle({ loadBuiltinModels: options.loadBuiltinModels });
    sapp.root = root;
    sapp.setAll(options);

    sapp.module = function (m) {
        if (typeof m !== 'string') throw new TypeError('module must be string for path');
        if (!Array.isArray(m)) m = [m];
        var modules = sapp.get('modules') || [];
        modules = _.union(modules, _.flatten(m));
        sapp.set('modules', modules);
    };

    sapp.on('before boot', function () {
        delete sapp.module;

        // phase extensions
        sapp.emit('phase:extensions', sapp);
        if (sapp.get('extensions')) {
            var extensions = needs(sapp.get('extensions'));
            _.forEach(extensions, function (ext) {
                if (typeof ext === 'function') sapp.phase(ext);
            });
        }
        sapp.emit('phase:after extensions', sapp);

        sapp.emit('phase:modules', sapp);
        // phase modules
        var modules = sapp.get('modules');
        if (typeof modules === 'string') {
            modules = [modules];
        }
        if (Array.isArray(modules)) modules.forEach(function (m) {
            sapp.phase(sycle.boot.module(m));
        });

        sapp.emit('phase:after modules', sapp);

        sapp.emit('phase:auth', sapp);
        // phase auth
        if (sapp.enabled('auth')) {
            sapp.phase(sycle.authorizer);
            sapp.emit('phase:after auth', sapp);
        }

        sapp.emit('phase:database', sapp);
        // init models and database
        sapp.phase(sycle.boot.database(sapp.get('db') || sapp.get('database')));
        sapp.emit('phase:after database', sapp);

        sapp.emit('phase:initializers', sapp);
        // execute initializers
        if (sapp.get('initializers')) {
            sapp.phase(sycle.boot.initializers(sapp.get('initializers')));
            sapp.emit('phase:after initializers', sapp);
        }
    });

    return sapp;
}
