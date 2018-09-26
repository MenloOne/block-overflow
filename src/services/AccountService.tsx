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

import BigNumber from 'bignumber.js'
import TruffleContract from 'truffle-contract'
import Blockies from 'react-blockies'

import web3 from './web3_override'
import { MenloToken } from '../.contracts/MenloToken'
import QPromise from '../utils/QPromise'

const TokenContractJSON = require('../build-contracts/MenloToken.json')




enum MetamaskStatus {
    Starting = 'starting',
    Uninstalled = 'uninstalled',
    LoggedOut = 'logged out',
    Ok = 'ok',
    Error = 'error'
}

type AccountChangeCallback = (svc : AccountService) => Promise<void>

class AccountService {

    public ready: any
    public address: string | null
    public avatar: JSX.Element
    public balance: number
    public fullBalance: BigNumber
    public status: MetamaskStatus
    public error: string | null

    private token : MenloToken
    private signalReady : () => void
    private stateChangeCallback : AccountChangeCallback

    constructor(stateChangeCallback : AccountChangeCallback) {
        this.ready = QPromise((res, rej) => this.signalReady = res)
        this.address = null
        this.balance = 0
        this.avatar = <span></span>
        this.status = MetamaskStatus.Starting
        this.stateChangeCallback = stateChangeCallback

        this.checkMetamaskStatus = this.checkMetamaskStatus.bind(this)
        if (!web3) {
            this.status = MetamaskStatus.Uninstalled
            this.stateChangeCallback(this)
            return
        }

        web3.currentProvider.publicConfigStore.on('update', this.checkMetamaskStatus)
        this.checkMetamaskStatus()
    }

    isLoggedIn() : boolean {
        return false
    }

    async checkMetamaskStatus() {
        web3.eth.getAccounts(async (err, accounts) => {
            if (err || !accounts || accounts.length === 0) {
                this.status = MetamaskStatus.LoggedOut
                this.stateChangeCallback(this)
                return
            }

            if (!this.token) {
                const TokenContract = await TruffleContract(TokenContractJSON)

                await TokenContract.setProvider(web3.currentProvider)
                TokenContract.defaults({ from: this.address })

                this.token = await TokenContract.deployed()
            }

            if (this.status !== MetamaskStatus.Starting && this.status !== MetamaskStatus.Ok) {
                this.refreshAccount( true, null)
            }

            const account0 = accounts[0].toLowerCase()
            if (account0 !== this.address) {
                // The only time we ever want to load data from the chain history
                // is when we receive a change in accounts - this happens anytime
                // the page is initially loaded or if there is a change in the account info
                // via a metamask interaction.
                web3.eth.defaultAccount = account0

                await this.refreshAccount( this.address !== null, account0 )
            }

            this.signalReady()
        });
    }


    async refreshAccount(reload : boolean, address: string | null) {
        try {
            if (reload) {
                // Easy way out for now
                window.location.reload()
            }

            this.address = address
            this.avatar  = <Blockies seed={address} size={10} />
            this.getBalance()
            this.status = MetamaskStatus.Ok

            await this.stateChangeCallback(this)

            this.signalReady()

        } catch ( e ) {
            console.error(e)

            this.status = MetamaskStatus.Error
            this.error  = e.message

            await this.stateChangeCallback(this)
        }
    }

    async getBalance() : Promise<number> {
        this.fullBalance = await this.token.balanceOf(this.address as string)
        this.balance     = this.fullBalance.div( 10 ** 18 ).toNumber()

        return this.balance
    }

    async refreshBalance() : Promise<void> {
        await this.ready

        setTimeout(async () => {
            await this.getBalance()
            this.stateChangeCallback(this)
        }, 3000 )
    }
}


const AccountContext = React.createContext({})


function withAcct(Component) {
    // ...and returns another component...

    return function EthContextComponent(props) {
        // ... and renders the wrapped component with the context theme!
        // Notice that we pass through any additional props as well
        return (
            <AccountContext.Consumer>
                {(account: Account) => <Component { ...props } acct={ account }/>}
            </AccountContext.Consumer>
        )
    }
}


export {
    AccountContext,
    AccountService,
    MetamaskStatus,
    withAcct
}
