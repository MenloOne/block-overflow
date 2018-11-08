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

import ethUtil from 'ethereumjs-util'
import axios from 'axios'

import web3 from './Web3'
import { MenloToken } from '../contracts/MenloToken'
import { QPromise } from '../utils/QPromise'

import config from '../config'
import { networks, ContractAddresses } from './networks'


export enum ToastType {
    Account,
    Balance
}


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
    public network: number
    public networkName: NetworkName = NetworkName.Unknown
    public contractAddresses : ContractAddresses
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

    private enabled: boolean = false

    constructor() {
        super()

        this.ready = QPromise((res, rej) => this.signalReady = res)
        this.address = null
        this.oneBalance = 0
        this.network = 0
        this.status = MetamaskStatus.Starting
        this.stateChangeCallback = null

        this.checkMetamaskStatus = this.checkMetamaskStatus.bind(this)
        if (!web3.version) {
            this.status = MetamaskStatus.Uninstalled
            this.onStateChange()
            return
        }

        this.setNetwork()
        this.onStateChange()

        if (web3.currentProvider) {
            web3.currentProvider.publicConfigStore.on('update', this.checkMetamaskStatus)
        }
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
        const baseUrl = config.apiUrl

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
        if (!web3.version) {
            return
        }

        if (window.ethereum) {
            try {
                // Request account access if needed
                if (!this.enabled) {
                    await window.ethereum.enable();
                }

            } catch (error) {
                // User denied account access...

                this.status = MetamaskStatus.Error
                this.error = 'Metamask access denied by user'
            }

        }

        this.setNetwork()

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
        toast.dismiss()

        if (this.networkName !== NetworkName.Mainnet) {
            this.status = MetamaskStatus.InvalidNetwork
            this.onStateChange()
            return
        }


        try {
            if (reload) {
                // Easy way out for now
                // TODO: Make all modules refresh all acct based state when setWeb3Account() is called
                window.location.reload()
            }

            this.address = address

            if (!this.token) {
                this.token = await MenloToken.createAndValidate(web3, this.contractAddresses.MenloToken)
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

    async getEtherscanUrl(address?: string, tab?: string) {
        let url = ''

        switch (this.network) {
            case 4:
                url = 'https://rinkeby.etherscan.io'
                break
            case 42:
                url = 'https://kovan.etherscan.io'
                break
            default:
                url = 'https://etherscan.io'
        }

        if (address) {
            return `${url}/address/${address}${tab ? '#${tab}' : ''}`
        }

        return url
    }

    setNetwork() {
        if (!web3.version) { return }

        this.contractAddresses = networks[web3.version.network]
        this.network = parseInt(web3.version.network, 10)

        switch (this.network) {
            case 1:
                this.networkName = NetworkName.Mainnet
                break;
            case 2:
                this.networkName = NetworkName.Morden
                break;
            case 3:
                this.networkName = NetworkName.Ropsten
                break;
            case 4:
                this.networkName = NetworkName.Rinkeby
                break;
            case 42:
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

        toast.dismiss(ToastType.Balance)

        this.oneBalance = (await this.token.balanceOf(this.address as string)).div( 10 ** 18 ).toNumber()
        web3.eth.getBalance(this.address as string, (err, balance) => {
            if (err) {
                throw (err)
            }

            this.ethBalance = balance.div(10 ** 18).toNumber()

            if (this.ethBalance === 0) {
                toast(`Note you have no ETH in this wallet.`, {
                    autoClose: false,
                    toastId: ToastType.Balance
                })
            } else
            if (this.oneBalance === 0) {
                let instr = 'use the Menlo Faucet button to get some'

                if (this.networkName === NetworkName.Mainnet) {
                    instr = 'buy some on an exchange like IDEX'
                }

                toast(`You have no ONE tokens, ${instr}`, {
                    autoClose: false,
                    toastId: ToastType.Balance
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
export interface AccountProps {
    acct: AccountContext
}

export function withAcct(Component) {
    // ...and returns another component...

    return function withAcctComponent(props) {
        // ... and renders the wrapped component with the context theme!
        // Notice that we pass through any additional props as well
        return (
            <AccountCtxtComponent.Consumer>
                {(account: Account) => {
                    return (
                        <div>
                            <Component {...props} acct={account} />
                        </div>
                    )
                }}
            </AccountCtxtComponent.Consumer>
        )
    }
}

