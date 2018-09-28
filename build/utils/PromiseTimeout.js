"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Timeout = /** @class */ (function () {
    function Timeout(message) {
        this.message = message;
    }
    return Timeout;
}());
exports.Timeout = Timeout;
function PromiseTimeout(ms, promise) {
    // Create a promise that rejects in <ms> milliseconds
    var timeout = new Promise(function (resolve, reject) {
        var id = setTimeout(function () {
            clearTimeout(id);
            reject(new Timeout('Timed out in ' + ms + 'ms.'));
        }, ms);
    });
    // Returns a race between our timeout and the passed in promise
    return Promise.race([
        promise,
        timeout
    ]);
}
exports.default = PromiseTimeout;
//# sourceMappingURL=PromiseTimeout.js.map