
var syclify = require('../');
var t = require('chai').assert;

describe('sycle', function () {

    it('should setup ok', function (done) {
        var root = __dirname + '/fixtures/base-app';
        var app = syclify(root, {
            extensions: root + '/extensions',
            initializers: root + '/initializers',
            modules: root
        });

        app.boot(function (err) {
            if (err) throw err;
            t.equal(app.bar, 1);
            t.equal(app.boo, 2);
            t.equal(app.foo, 2);
            t.ok(app.models.Car);
            t.ok(app.models.User);  // should load builtin models
            done();
        });
    });
});