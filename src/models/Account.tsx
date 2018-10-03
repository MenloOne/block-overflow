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
import ethUtil from 'ethereumjs-util'
import axios from 'axios'

import web3 from './Web3'
import { MenloToken } from '../contracts/MenloToken'
import { QPromise } from '../utils/QPromise'

import TokenContractJSON from 'menlo-token/build/contracts/MenloToken.json'
import config from '../config'


export enum MetamaskStatus {
    Starting = 'starting',
    Uninstalled = 'uninstalled',
    LoggedOut = 'logged out',
    Ok = 'ok',
    Error = 'error'
}

export class AccountModel {
    public ready: any
    public address: string | null
    public avatar: JSX.Element
    public balance: number
    public fullBalance: BigNumber
    public status: MetamaskStatus
    public error: string | null
}

export type AccountContext = { model: AccountModel, svc: Account }


export interface AccountService {
    refreshBalance() : Promise<void>
    contractError(e : Error) : Promise<void>
    signIn()
    isSignedIn() : boolean
}

type AccountChangeCallback = () => Promise<void>

export class Account extends AccountModel implements AccountService {

    private token : MenloToken
    private signalReady : () => void
    private stateChangeCallback : AccountChangeCallback | null

    constructor() {
        super()

        this.ready = QPromise((res, rej) => this.signalReady = res)
        this.address = null
        this.balance = 0
        this.avatar = <span></span>
        this.status = MetamaskStatus.Starting
        this.stateChangeCallback = null

        this.checkMetamaskStatus = this.checkMetamaskStatus.bind(this)
        if (!web3) {
            this.status = MetamaskStatus.Uninstalled
            this.onStateChange()
            return
        }

        this.onStateChange()

        web3.currentProvider.publicConfigStore.on('update', this.checkMetamaskStatus)
        this.checkMetamaskStatus()
    }

    public setCallback(callback : AccountChangeCallback) {
        this.stateChangeCallback = callback
    }

    public async signIn() {
        const baseUrl = config.contentNodeUrl

        web3.personal.sign(ethUtil.bufferToHex(new Buffer(`I want to sign into ${baseUrl}`, 'utf8')), this.address, async (error, signed) => {
            if (error) {
                console.log('Issue signing in: ', error)
                throw(error)
            }

            console.log('Signed!  Result is: ', signed);

            const result = await axios.post('/signin', {
                account: this.address,
                signed,
            })

            console.log(result)
        })
    }

    public isSignedIn() : boolean {
        return false
    }

    async checkMetamaskStatus() {
        web3.eth.getAccounts(async (err, accounts) => {
            if (err || !accounts || accounts.length === 0) {
                this.status = MetamaskStatus.LoggedOut
                this.onStateChange()
                return
            }

            const account0 = accounts[0].toLowerCase()
            if (account0 !== this.address) {

                if (this.status !== MetamaskStatus.Starting && this.status !== MetamaskStatus.Ok) {
                    await this.refreshAccount( true, null)
                    return
                }

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
                // window.location.reload()
            }

            this.address = address

            if (!this.token) {
                const TokenContract = await TruffleContract(TokenContractJSON)

                await TokenContract.setProvider(web3.currentProvider)
                TokenContract.defaults({ from: this.address })

                const tokenAddress = (await TokenContract.deployed()).address
                this.token = await MenloToken.createAndValidate(web3, tokenAddress)
            }

            this.avatar  = <Blockies seed={address} size={7} />
            this.getBalance()
            this.status = MetamaskStatus.Ok
            await this.getBalance()

            this.onStateChange()

            this.signalReady()

        } catch ( e ) {
            console.error(e)

            this.status = MetamaskStatus.Error
            this.error  = e.message

            this.onStateChange()
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
            this.onStateChange()
        }, 3000 )
    }

    async contractError(e : Error) {
        console.error(e)

        this.status = MetamaskStatus.Error
        this.error  = e.message

        this.onStateChange()
    }

    async onStateChange() {
        if (this.stateChangeCallback) {
            this.stateChangeCallback()
        }
    }
}


export const AccountCtxtComponent = React.createContext({})


export function withAcct(Component) {
    // ...and returns another component...

    return function withAcctComponent(props) {
        // ... and renders the wrapped component with the context theme!
        // Notice that we pass through any additional props as well
        return (
            <AccountCtxtComponent.Consumer>
                {(account: Account) => <Component { ...props } acct={ account }/>}
            </AccountCtxtComponent.Consumer>
        )
    }
}

