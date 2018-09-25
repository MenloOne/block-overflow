import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import Blockies from 'react-blockies'

import Profile from './Profile'
import { EthAccount, AcctContext } from './AcctContext'
import ForumService from './services/ForumService'
import web3 from './web3_override'
import ReputationService from './services/ReputationService'


interface AppState {
    ethAccount: EthAccount,

}


class App extends React.Component {

    private resolveReady: () => void

    state : AppState = {
        forumService: new ForumService(),
        repService: new ReputationService(),
    }

    constructor(props, context) {
        super(props, context)

        this.refreshAccount = this.refreshAccount.bind(this)
        this.refreshBalance = this.refreshBalance.bind(this)

        this.setState({
            ethAccount: {
                ready: new Promise((resolve) => {
                    this.resolveReady = resolve
                }),
                account: null,
                balance: '',
                status: MetamaskStatus.Starting,

                refreshBalance: this.refreshBalance
            }
        })
    }

    componentWillMount() {
        if (!web3) {
            const ethContext = Object.assign(this.state.ethAccount, { status: MetamaskStatus.Uninstalled })
            this.setState({ ethContext })
            return
        }

        web3.currentProvider.publicConfigStore.on('update', this.checkMetamaskStatus.bind(this))
        this.checkMetamaskStatus()
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    async checkMetamaskStatus() {
        web3.eth.getAccounts((err, accounts) => {
            if (err || !accounts || accounts.length === 0) {
                const ethContext = Object.assign(this.state.ethAccount, { status: MetamaskStatus.LoggedOut })
                this.setState({ ethContext })
                return
            }

            if (this.state.ethContext.status !== 'starting' && this.state.ethAccount.status !== 'ok') {
                this.refreshAccount( true, null)
            }

            const account0 = accounts[0].toLowerCase()
            if (account0 !== this.state.ethAccount.account) {
                // The only time we ever want to load data from the chain history
                // is when we receive a change in accounts - this happens anytime
                // the page is initially loaded or if there is a change in the account info
                // via a metamask interaction.
                web3.eth.defaultAccount = account0

                this.refreshAccount( this.state.ethAccount.account !== null, account0 )
            }
        });
    }

    async refreshBalance() {
        const eth = this.state.ethAccountethAccount

        setTimeout(async () => {
            const balance = await eth.forumService.getBalance()
            const ethContext = Object.assign({}, eth, { balance })

            this.setState({
                ethContext
            })
        }, 3000 )
    }


    async refreshAccount(refreshBoard : boolean, account: string | null) {
        try {
            if (refreshBoard) {
                // Easy way out for now
                window.location.reload()
            }

            const acct = {
                account,
                avatar: <Blockies seed={account} size={10} />,
                refreshBalance: this.refreshBalance.bind(this)
            }

            await this.state.ethAccount.forumService.setAccount(acct)

            const alias = await this.state.ethAccount.repService.alias
            const balance = await this.state.ethAccount.forumService.getBalance()

            const ethContext = Object.assign({}, this.state.ethAccount, {
                status: 'ok',
                balance,
                alias,
                ...acct,
            })

            this.setState({
                ethContext
            })

            this.resolveReady()

        } catch ( e ) {
            const ethContext = Object.assign(this.state.ethAccount, { status: MetamaskStatus.Error, error: e.message })
            this.setState({ ethContext })

            console.error(e)
        }
    }

    render() {
        return (
            <AcctContext.Provider value={this.state.ethContext}>
                <BrowserRouter>
                    <Switch>
                        <Route path="/" exact component={Profile}/>
                        <Route path="/menlo" exact component={Profile}/>
                    </Switch>
                </BrowserRouter>
            </AcctContext.Provider>
        )
    }
}

export default App
