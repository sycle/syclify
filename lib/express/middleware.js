"use strict";

var path = require('path');

var middlewareModules = module.exports = exports = {
    "bodyParser": "body-parser",
    "compress": "compression",
    "timeout": "connect-timeout",
    "cookieParser": "cookie-parser",
    "cookieSession": "cookie-session",
    "csrf": "csurf",
    "errorHandler": "errorhandler",
    "session": "express-session",
    "methodOverride": "method-override",
    "logger": "morgan",
    "responseTime": "response-time",
    "favicon": "serve-favicon",
    "directory": "serve-index",
    // "static": "serve-static",
    "vhost": "vhost"
};

module.exports = function (target) {
    for (var m in middlewareModules) defineModule(target, m, middlewareModules[m]);

    target.__defineGetter__('json', function () {
        return target.bodyParser && target.bodyParser.json;
    });
    target.__defineGetter__('urlencoded', function () {
        return target.bodyParser && target.bodyParser.urlencoded;
    });
};

function safeRequire(m) {
    try {
        return require(m);
    } catch (err) {
        return undefined;
    }
}

function throwNotInstalled(memberName, moduleName) {
    throw new Error('The middleware `' + memberName + '` is not installed.\n\n' +
        'Run `npm install ' + moduleName + ' --save` to fix the problem.\n');
}

function defineModule(target, name, mod) {
    target.__defineGetter__(name, function () {
        return safeRequire(mod) || throwNotInstalled(name, mod);
    });
}
