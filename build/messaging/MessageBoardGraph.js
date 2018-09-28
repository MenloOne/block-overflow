"use strict";
/*
 * Copyright 2018 Vulcanize, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the “License”);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an “AS IS” BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var MessageGraph = /** @class */ (function () {
    function MessageGraph(rootMessage) {
        if (!rootMessage) {
            rootMessage = {
                id: '0x0',
                children: []
            };
        }
        this.messages = {};
        this.add(rootMessage);
    }
    MessageGraph.prototype.add = function (message) {
        var parentID = message.parent || '0x0';
        // console.log('adding :', message)
        if (typeof message.id === 'undefined') {
            throw new Error('Adding invalid node');
        }
        this.messages[message.id] = message;
        if (parentID && parentID !== message.id) {
            var parent_1 = this.messages[parentID];
            if (!parent_1.children.includes(message.id)) {
                parent_1.children.push(message.id);
            }
        }
    };
    MessageGraph.prototype.delete = function (message) {
        delete this.messages[message.id];
    };
    MessageGraph.prototype.get = function (id) {
        return this.messages[id];
    };
    return MessageGraph;
}());
exports.default = MessageGraph;
//# sourceMappingURL=MessageBoardGraph.js.map