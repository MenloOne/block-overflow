"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable */
const bignumber_js_1 = require("bignumber.js");
class TypeChainContract {
    constructor(web3, address, contractAbi, rawBytecode) {
        this.contractAbi = contractAbi;
        this.rawBytecode = rawBytecode;
        this.address = address.toString();
        this.rawWeb3Contract = web3.eth.contract(contractAbi).at(address);
    }
}
exports.TypeChainContract = TypeChainContract;
class DeferredTransactionWrapper {
    constructor(parentContract, methodName, methodArgs) {
        this.parentContract = parentContract;
        this.methodName = methodName;
        this.methodArgs = methodArgs;
    }
    send(params, customWeb3) {
        let method;
        if (customWeb3) {
            const tmpContract = customWeb3.eth
                .contract(this.parentContract.contractAbi)
                .at(this.parentContract.address);
            method = tmpContract[this.methodName].sendTransaction;
        }
        else {
            method = this.parentContract.rawWeb3Contract[this.methodName].sendTransaction;
        }
        return promisify(method, [...this.methodArgs, params]);
    }
    getData() {
        return this.parentContract.rawWeb3Contract[this.methodName].getData(...this.methodArgs);
    }
    estimateGas(params) {
        const method = this.parentContract.rawWeb3Contract[this.methodName].estimateGas;
        return promisify(method, [...this.methodArgs, params]).then(gasString => new bignumber_js_1.BigNumber(gasString));
    }
}
exports.DeferredTransactionWrapper = DeferredTransactionWrapper;
class DeferredEventWrapper {
    constructor(parentContract, eventName, eventArgs) {
        this.parentContract = parentContract;
        this.eventName = eventName;
        this.eventArgs = eventArgs;
    }
    /**
     * Watches for a single log entry to be returned and then stops listening
     * @param watchFilter Optional filter for specifies blockNumber ranges to get data for
     * @returns First log entry which was seen
     */
    watchFirst(watchFilter) {
        return new Promise((resolve, reject) => {
            const watchedEvent = this.getRawEvent(watchFilter);
            watchedEvent.watch((err, res) => {
                // this makes sure to unsubscribe as well
                watchedEvent.stopWatching((err2, res2) => {
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
    }
    /**
     * Watches for logs occuring and calls the callback when they happen
     * @param watchFilter Optional filter for specifies blockNumber ranges to get data for
     * @param callback Callback function which will be called each time an event happens
     * @returns function which can be called to stop watching this log
     */
    watch(watchFilter, callback) {
        const watchedEvent = this.getRawEvent(watchFilter);
        watchedEvent.watch(callback);
        return () => {
            return new Promise((resolve, reject) => {
                watchedEvent.stopWatching((err, res) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(res);
                    }
                });
            });
        };
    }
    /**
     * Gets the historical logs for this event
     * @param watchFilter Optional filter for specifies blockNumber ranges to get data for
     * @returns Array of event logs
     */
    get(watchFilter) {
        return new Promise((resolve, reject) => {
            const watchedEvent = this.getRawEvent(watchFilter);
            watchedEvent.get((err, logs) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(logs);
                }
            });
        });
    }
    getRawEvent(watchFilter) {
        const filter = Object.assign({}, {
            fromBlock: "0",
            toBlock: "latest",
        }, watchFilter);
        const rawEvent = this.parentContract.rawWeb3Contract[this.eventName](this.eventArgs, filter);
        return rawEvent;
    }
}
exports.DeferredEventWrapper = DeferredEventWrapper;
function promisify(func, args) {
    return new Promise((res, rej) => {
        func(...args, (err, data) => {
            if (err)
                return rej(err);
            return res(data);
        });
    });
}
exports.promisify = promisify;
//# sourceMappingURL=typechain-runtime.js.map