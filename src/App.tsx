import * as React from 'react'
import * as History from 'history'

import CssBaseline from '@material-ui/core/CssBaseline'
import { AccountService, AccountContext } from './services/AccountService'
import { history } from './config'
import router from './router'

import Topics from './pages/Topics'
import Forum from './pages/Forum'

import ForumService from './services/ForumService'



class Footer extends React.Component {
    render() {
        return (
            <div></div>
        )
    }
}


interface AppState {
    account: AccountService,
    component: React.Component
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
        const renderComponent = this.renderComponent.bind(self)

        if (this.state.account.isLoggedIn()) {

            this.setState({ wasLoggedIn: true })

            router.resolve(this.loggedInRoutes, location)
                .then(renderComponent)
                .catch(error => router.resolve(this.loggedInRoutes, { ...location, error })
                    .then(renderComponent));
            return
        }

        this.setState({ wasLoggedIn: false })

        router.resolve(this.loggedOutRoutes, location)
            .then(renderComponent)
            .catch(error => router.resolve(this.loggedOutRoutes, { ...location, error })
                .then(renderComponent));
    }


    loggedOutRoutes = [
        { path: '/', action: () => <Forum /> },
    ];

    loggedInRoutes = [
        { path: '/', action: () => <Topics /> },
        { path: '/topic/:id(\\d+)', action: (params) => <Forum {...params}/> },
    ];

    commonRoutes = [
        { path: '/privacy', action: () => <Topics /> }
    ];


    render() {
        return (
            <AccountContext.Provider value={this.state.account}>
                <CssBaseline />
                { this.state.component }
                <Forum address='0x4e72770760c011647d4873f60a3cf6cdea896cd8' />
                { this.props.children }
                <Footer />
            </AccountContext.Provider>
        )
    }
}

export default App
