"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var path_to_regexp_1 = tslib_1.__importDefault(require("path-to-regexp"));
var config_1 = require("./config");
function matchURI(path, uri) {
    var keys = [];
    var pattern = path_to_regexp_1.default(path, keys); // TODO: Use caching
    var match = pattern.exec(uri);
    if (!match)
        return null;
    var params = Object.create(null);
    for (var i = 1; i < match.length; i++) {
        params[keys[i - 1].name] =
            match[i] !== undefined ? match[i] : undefined;
    }
    return params;
}
function resolve(routes, context) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var _i, routes_1, route, uri, params, to, result;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _i = 0, routes_1 = routes;
                    _a.label = 1;
                case 1:
                    if (!(_i < routes_1.length)) return [3 /*break*/, 4];
                    route = routes_1[_i];
                    uri = context.error ? '/error' : context.pathname;
                    params = matchURI(route.path, uri);
                    if (!params)
                        return [3 /*break*/, 3];
                    if (route.redirect) {
                        to = route.redirect();
                        config_1.history.replace(to);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, route.action(tslib_1.__assign({}, context, { params: params }))];
                case 2:
                    result = _a.sent();
                    if (result)
                        return [2 /*return*/, result];
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: throw "Route for " + context.pathname + " not found";
            }
        });
    });
}
exports.default = { resolve: resolve };
//# sourceMappingURL=BasicRouter.js.map