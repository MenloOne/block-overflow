"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const react_dom_1 = require("react-dom");
require("./index.css");
const App_1 = require("./App");
const registerServiceWorker_1 = require("./registerServiceWorker");
react_dom_1.default.render(react_1.default.createElement(App_1.default, null), document.getElementById('root'));
registerServiceWorker_1.default();
//# sourceMappingURL=index.js.map