import React from 'react'
const AcctContext = React.createContext({})


enum MetamaskStatus {
    Starting = 'starting',
    Uninstalled = 'uninstalled',
    LoggedOut = 'logged out',
    Ok = 'ok',
    Error = 'error'
}


interface EthAccount {
    ready: Promise<void>
    account: string | null
    balance: string
    status: MetamaskStatus

    refreshBalance() : void
}


function withEth(Component) {
    // ...and returns another component...

    return function EthContextComponent(props) {
        // ... and renders the wrapped component with the context theme!
        // Notice that we pass through any additional props as well
        return (
            <AcctContext.Consumer>
                {(account: EthAccount) => <Component { ...props } eth={ account }/>}
            </AcctContext.Consumer>
        )
    }
}


export {
    AcctContext,
    EthAccount,
    MetamaskStatus,
    withEth
}
