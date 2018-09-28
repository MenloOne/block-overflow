"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var history_1 = require("history");
var history = history_1.createBrowserHistory();
exports.history = history;
var Config = /** @class */ (function () {
    function Config() {
        if (process.env.NODE_ENV === 'production') {
            this.contentNodeUrl = 'https://node.menlo.one';
            return;
        }
        this.contentNodeUrl = 'https://localhost:8080';
    }
    return Config;
}());
var config = new Config();
exports.config = config;
//# sourceMappingURL=config.js.map