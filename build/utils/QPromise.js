"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var QPromiseStatus = /** @class */ (function () {
    function QPromiseStatus() {
    }
    return QPromiseStatus;
}());
exports.QPromiseStatus = QPromiseStatus;
function extend(first, second) {
    var result = {};
    for (var id in first) {
        result[id] = first[id];
    }
    for (var id in second) {
        if (!result.hasOwnProperty(id)) {
            result[id] = second[id];
        }
    }
    return result;
}
function QPromise(param) {
    var promise = new Promise(param);
    // Set initial state
    var isPending = true;
    var isRejected = false;
    var isFulfilled = false;
    // Observe the promise, saving the fulfillment in a closure scope.
    var result = extend(promise.then(function (v) {
        isFulfilled = true;
        isPending = false;
        return v;
    }, function (e) {
        isRejected = true;
        isPending = false;
        throw e;
    }), {
        isFulfilled: function () { return isFulfilled; },
        isPending: function () { return isPending; },
        isRejected: function () { return isRejected; },
    });
    return result;
}
exports.QPromise = QPromise;
//# sourceMappingURL=QPromise.js.map