import * as React from 'react'
import * as History from 'history'

import CssBaseline from '@material-ui/core/CssBaseline'
import { AccountService, AccountContext } from './services/AccountService'
import { history } from './config'
import router from './router'

import Topics from './pages/Topics'
import Forum from './pages/Forum'

import "./App.scss"


class Footer extends React.Component {
    render() {
        return (
            <div></div>
        )
    }
}


interface AppState {
    account: AccountService,
    component: React.Component,
    forumAddress: string | null
}


class App extends React.Component {

    state   : AppState
    account : AccountService

    constructor(props: any, context: any) {
        super(props, context)
        this.accountChanged = this.accountChanged.bind(this)
        this.renderLocation = this.renderLocation.bind(this)
    }

    async accountChanged(_account : AccountService) {
        // Setup account state object w/ particular callbacks

        const account = Object.assign({}, _account)

        account.contractError  = _account.contractError.bind(_account)
        account.refreshBalance = _account.refreshBalance.bind(_account)

        this.setState({ account })
    }

    componentWillMount() {
        this.account = new AccountService(this.accountChanged)
    }

    componentDidMount() {
        history.listen(this.renderLocation)   // render subsequent URLs
        this.renderLocation(history.location, 'REPLACE')
    }


    renderComponent(component : any) {
        if (!component) {
            console.log("Error trying to set to null component")
            return
        }

        console.log(`Setting component to ${component.type.name}`)
        this.setState({ component })
    }

    async renderLocation(location : History.Location, action: History.Action) {
        const routes : object[] = this.commonRoutes

        this.setState({ wasLoggedIn: this.account.isLoggedIn() })
        if (this.account.isLoggedIn()) {
            routes.concat( this.loggedInRoutes )
        } else {
            routes.concat( this.loggedOutRoutes )
        }

        try {
            const component = await router.resolve( routes, location)
            this.renderComponent(component)
        } catch (error) {
            const component = await router.resolve( routes, { ...location, error })
            this.renderComponent(component)
        }
    }


    loggedOutRoutes = [
    ];

    loggedInRoutes = [
    ];

    commonRoutes = [
        { path: '/', action: () => <Topics /> },
        { path: '/topic/:address(.+)', action: (params) => <Forum { ...params }/> },
        { path: '/privacy', action: () => <Topics /> }
    ];


    render() {
        return (
            <AccountContext.Provider value={this.state.account}>
                <CssBaseline />
                { this.state.component }
                { this.props.children }
                <Footer />
            </AccountContext.Provider>
        )
    }
}

export default App
