import * as React from 'react'
import * as History from 'history'

import CssBaseline from '@material-ui/core/CssBaseline'
import { AccountService, AccountContext } from './services/AccountService'
import { history } from './config'
import BasicRouter from './BasicRouter'

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

    state : AppState

    constructor(props: any, context: any) {
        super(props, context)
        this.accountChanged = this.accountChanged.bind(this)
        this.renderLocation = this.renderLocation.bind(this)
    }

    async accountChanged(account : AccountService) {
        this.setState({ account })
    }

    componentWillMount() {
        this.setState({
            account: new AccountService(this.accountChanged)
        })
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
        const renderComponent = this.renderComponent.bind(this)

        if (this.state.account.isLoggedIn()) {

            this.setState({ wasLoggedIn: true })

            BasicRouter.resolve(this.loggedInRoutes, location)
                .then(renderComponent)
                .catch(error => BasicRouter.resolve({ ...this.loggedInRoutes, ...this.commonRoutes }, { ...location, error })
                    .then(renderComponent));
            return
        }

        this.setState({ wasLoggedIn: false })

        BasicRouter.resolve( this.loggedOutRoutes, location)
            .then(renderComponent)
            .catch(error => BasicRouter.resolve(this.loggedOutRoutes, { ...location, error })
                .then(renderComponent));
    }


    loggedOutRoutes = [
        { path: '/', action: () => <Topics /> },
    ];

    loggedInRoutes = [
        { path: '/', action: () => <Topics /> },
        { path: '/topic/:address(\\d+)', action: (params) => <Forum {...params}/> },
    ];

    commonRoutes = [
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
