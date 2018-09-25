import React from 'react'

const EthContext = React.createContext({})


function withEth(Component) {
    // ...and returns another component...

    return function EthContextComponent(props) {
        // ... and renders the wrapped component with the context theme!
        // Notice that we pass through any additional props as well
        return (
            <EthContext.Consumer>
                {context => <Component {...props} eth={context}/>}
            </EthContext.Consumer>
        )
    }
}

export {
    EthContext,
    withEth
}
