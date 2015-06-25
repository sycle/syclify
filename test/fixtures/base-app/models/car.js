
var sycle = require('sycle');

module.exports = function (Car) {
    Car.setupCar = true;

    Car.echo = function (data, cb) {
        cb(null, data);
    };

};