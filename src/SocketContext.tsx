/*
 * Copyright 2018 Menlo One, Inc.
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

import * as React from 'react'


export const SocketCtxtComponent = React.createContext({})


export function withSockets(Component) {
    // ...and returns another component...

    return function withSocketComponent(props) {
        // ... and renders the wrapped component with the context theme!
        // Notice that we pass through any additional props as well
        return (
            <SocketCtxtComponent.Consumer>
                {(socket: SocketIOClient.Socket) => {
                    return (
                        <div>
                            <Component {...props} socket={socket} />
                        </div>
                    )
                }}
            </SocketCtxtComponent.Consumer>
        )
    }
}

