import * as React from 'react'
import * as History from 'history'

import CssBaseline from '@material-ui/core/CssBaseline'
import { Account, AccountContext, AccountCtxtComponent } from './services/Account'
import { Topics, TopicsContext, TopicsCtxtComponent } from './services/Topics'
import { history } from './config'
import router from './router'

import TopicsPage from './topics/TopicsPage'
import ForumPage from './messaging/ForumPage'

import "./App.scss"
import Topic from "./services/Topic";


class Footer extends React.Component {
    render() {
        return (
            <div></div>
        )
    }
}


interface AppState {
    account: AccountContext,
    topics:  TopicsContext,
    component?: React.Component
}


class App extends React.Component {

    state   : AppState

    account : Account
    topics  : Topics

    constructor(props: any, context: any) {
        super(props, context)

        this.accountChanged = this.accountChanged.bind(this)
        this.topicsChanged = this.topicsChanged.bind(this)
        this.renderLocation = this.renderLocation.bind(this)

        this.account = new Account()
        this.topics  = new Topics()

        this.state = {
            account: { model: Object.assign({}, this.account), svc: this.account },
            topics:  { model: Object.assign({}, this.topics),  svc: this.topics }
        }

        this.account.setCallback(this.accountChanged)
        this.topics.setCallback(this.topicsChanged)
    }

    async topicsChanged(_topic: Topic) {
        this.setState({ topics: { model: Object.assign({}, this.topics), svc: this.topics } })
    }

    async accountChanged() {
        // Setup account state object w/ particular callbacks

        this.setState({ account: { model: Object.assign({}, this.account), svc: this.account } })
        this.topics.setAccount(this.account)
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
        { path: '/', action: () => <TopicsPage /> },
        { path: '/topic/:address(.+)', action: (params) => <ForumPage { ...params }/> },
        { path: '/privacy', action: () => <TopicsPage /> }
    ];


    render() {
        return (
            <AccountCtxtComponent.Provider value={this.state.account}>
                <TopicsCtxtComponent.Provider value={this.state.topics}>
                    <CssBaseline />
                    { this.state.component }
                    { this.props.children }
                    <Footer />
                </TopicsCtxtComponent.Provider>
            </AccountCtxtComponent.Provider>
        )
    }
}

export default App
