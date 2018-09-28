"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable */
var bignumber_js_1 = require("bignumber.js");
var TypeChainContract = /** @class */ (function () {
    function TypeChainContract(web3, address, contractAbi, rawBytecode) {
        this.contractAbi = contractAbi;
        this.rawBytecode = rawBytecode;
        this.address = address.toString();
        this.rawWeb3Contract = web3.eth.contract(contractAbi).at(address);
    }
    return TypeChainContract;
}());
exports.TypeChainContract = TypeChainContract;
var DeferredTransactionWrapper = /** @class */ (function () {
    function DeferredTransactionWrapper(parentContract, methodName, methodArgs) {
        this.parentContract = parentContract;
        this.methodName = methodName;
        this.methodArgs = methodArgs;
    }
    DeferredTransactionWrapper.prototype.send = function (params, customWeb3) {
        var method;
        if (customWeb3) {
            var tmpContract = customWeb3.eth
                .contract(this.parentContract.contractAbi)
                .at(this.parentContract.address);
            method = tmpContract[this.methodName].sendTransaction;
        }
        else {
            method = this.parentContract.rawWeb3Contract[this.methodName].sendTransaction;
        }
        return promisify(method, this.methodArgs.concat([params]));
    };
    DeferredTransactionWrapper.prototype.getData = function () {
        var _a;
        return (_a = this.parentContract.rawWeb3Contract[this.methodName]).getData.apply(_a, this.methodArgs);
    };
    DeferredTransactionWrapper.prototype.estimateGas = function (params) {
        var method = this.parentContract.rawWeb3Contract[this.methodName].estimateGas;
        return promisify(method, this.methodArgs.concat([params])).then(function (gasString) { return new bignumber_js_1.BigNumber(gasString); });
    };
    return DeferredTransactionWrapper;
}());
exports.DeferredTransactionWrapper = DeferredTransactionWrapper;
var DeferredEventWrapper = /** @class */ (function () {
    function DeferredEventWrapper(parentContract, eventName, eventArgs) {
        this.parentContract = parentContract;
        this.eventName = eventName;
        this.eventArgs = eventArgs;
    }
    /**
     * Watches for a single log entry to be returned and then stops listening
     * @param watchFilter Optional filter for specifies blockNumber ranges to get data for
     * @returns First log entry which was seen
     */
    DeferredEventWrapper.prototype.watchFirst = function (watchFilter) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var watchedEvent = _this.getRawEvent(watchFilter);
            watchedEvent.watch(function (err, res) {
                // this makes sure to unsubscribe as well
                watchedEvent.stopWatching(function (err2, res2) {
                    if (err) {
                        reject(err);
                    }
                    else if (err2) {
                        reject(err2);
                    }
                    else {
                        resolve(res);
                    }
                });
            });
        });
    };
    /**
     * Watches for logs occuring and calls the callback when they happen
     * @param watchFilter Optional filter for specifies blockNumber ranges to get data for
     * @param callback Callback function which will be called each time an event happens
     * @returns function which can be called to stop watching this log
     */
    DeferredEventWrapper.prototype.watch = function (watchFilter, callback) {
        var watchedEvent = this.getRawEvent(watchFilter);
        watchedEvent.watch(callback);
        return function () {
            return new Promise(function (resolve, reject) {
                watchedEvent.stopWatching(function (err, res) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(res);
                    }
                });
            });
        };
    };
    /**
     * Gets the historical logs for this event
     * @param watchFilter Optional filter for specifies blockNumber ranges to get data for
     * @returns Array of event logs
     */
    DeferredEventWrapper.prototype.get = function (watchFilter) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var watchedEvent = _this.getRawEvent(watchFilter);
            watchedEvent.get(function (err, logs) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(logs);
                }
            });
        });
    };
    DeferredEventWrapper.prototype.getRawEvent = function (watchFilter) {
        var filter = Object.assign({}, {
            fromBlock: "0",
            toBlock: "latest",
        }, watchFilter);
        var rawEvent = this.parentContract.rawWeb3Contract[this.eventName](this.eventArgs, filter);
        return rawEvent;
    };
    return DeferredEventWrapper;
}());
exports.DeferredEventWrapper = DeferredEventWrapper;
function promisify(func, args) {
    return new Promise(function (res, rej) {
        func.apply(void 0, args.concat([function (err, data) {
                if (err)
                    return rej(err);
                return res(data);
            }]));
    });
}
exports.promisify = promisify;
//# sourceMappingURL=typechain-runtime.js.map