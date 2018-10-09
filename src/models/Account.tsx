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
import { toast } from 'react-toastify'

import TruffleContract from 'truffle-contract'
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
    InvalidNetwork = 'network',
    LoggedOut = 'logged out',
    Ok = 'ok',
    Error = 'error'
}

export enum NetworkName {
    Mainnet = 'Mainnet',
    Morden = 'Morden',
    Ropsten = 'Ropsten',
    Rinkeby = 'Rinkeby',
    Kovan = 'Kovan',
    Unknown = 'unknown',
}


export class AccountModel {
    public ready: any
    public address: string | null
    public oneBalance: number
    public ethBalance: number
    public status: MetamaskStatus
    public error: string | null
    public networkName: NetworkName = NetworkName.Unknown
}

export type AccountContext = { model: AccountModel, svc: Account }
export type BasicCallback = () => void

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
    private balanceCallbacks: BasicCallback[] = []

    constructor() {
        super()

        this.ready = QPromise((res, rej) => this.signalReady = res)
        this.address = null
        this.oneBalance = 0
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

    public addBalanceCallback(callback: BasicCallback) {
        this.balanceCallbacks.push(callback)
    }

    public setCallback(callback : AccountChangeCallback) {
        this.stateChangeCallback = callback
        this.stateChangeCallback()
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
        if (window.ethereum) {
            try {
                // Request account access if needed
                console.log('Calling ethereum enable')
                await window.ethereum.enable();
            } catch (error) {
                // User denied account access...

                this.status = MetamaskStatus.Error
                this.error = 'Metamask access denied by user'
            }

        }

        web3.eth.getAccounts(async (err, accounts) => {
            if (err || !accounts || accounts.length === 0) {
                this.status = MetamaskStatus.LoggedOut
                this.onStateChange()
                return
            }

            const account0 = accounts[0].toLowerCase()

            if (account0 !== this.address) {

                if (this.status !== MetamaskStatus.Starting && this.status !== MetamaskStatus.Ok) {
                    await this.refreshAccount( true, account0)
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


    async refreshAccount(reload : boolean, address: string) {
        this.setNetworkName()

        if (this.networkName !== NetworkName.Kovan) {
            this.status = MetamaskStatus.InvalidNetwork
            this.onStateChange()
            return
        }


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

            await this.getBalance(true)

            this.status = MetamaskStatus.Ok

            this.onStateChange()

            this.signalReady()

        } catch ( e ) {
            console.error(e)

            this.status = MetamaskStatus.Error
            this.error  = e.message

            this.onStateChange()
        }
    }
    
    setNetworkName() {
        switch (web3.version.network) {
            case '1':
                this.networkName = NetworkName.Mainnet
                break;
            case '2':
                this.networkName = NetworkName.Morden
                break;
            case '3':
                this.networkName = NetworkName.Ropsten
                break;
            case '4':
                this.networkName = NetworkName.Rinkeby
                break;
            case '42':
                this.networkName = NetworkName.Kovan
                return
            default:
                this.networkName = NetworkName.Unknown
                break;
        }
    }

    async getBalance(force: boolean = false) : Promise<number> {
        if (!force) {
            await this.ready
        }

        this.oneBalance = (await this.token.balanceOf(this.address as string)).div( 10 ** 18 ).toNumber()
        web3.eth.getBalance(this.address as string, (err, balance) => {
            if (err) {
                throw (err)
            }

            this.ethBalance = balance.div(10 ** 18).toNumber()

            if (this.ethBalance === 0) {
                toast(`Note you have no ETH in this wallet.`, {
                    autoClose: false,
                    toastId: 1,
                    closeButton: false
                })
            } else
            if (this.oneBalance === 0) {
                toast('You have no ONE tokens, use the ONE faucet to obtain some!', {
                    autoClose: false,
                    toastId: 0,
                    closeButton: false
                })
            }
        })

        return this.oneBalance
    }

    async refreshBalance(wait: number = 3000) : Promise<void> {
        await this.ready

        setTimeout(async () => {
            const bal = await this.getBalance()
            
            if (bal === 0) {
            }
            
            this.onStateChange()

            let callback
            while (callback = this.balanceCallbacks.pop()) {
                await callback()
            }
        }, wait )
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

