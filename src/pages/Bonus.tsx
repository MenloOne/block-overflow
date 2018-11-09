import * as React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'react-dropdown/style.css'
import CountdownTimer from '../components/CountdownTimer'

import { toast } from 'react-toastify'

import web3 from '../models/Web3'
import { MenloTokenTimelock } from '../contracts/MenloTokenTimelock'
import { AccountContext, withAcct } from '../models/Account'

import TopNav from '../components/TopNav'
import A from '../components/A'

import '../App.scss'


const BlockOverflowIcon = require('../images/menlo-logo.svg')



class BonusPageProps {
    acct: AccountContext
}

class BonusPageState {
    balance: number
    endTime: Date
}


class BonusPage extends React.Component<BonusPageProps> {

    state : BonusPageState = {
        balance: 0,
        endTime: new Date()
    }
    timelock : MenloTokenTimelock

    constructor(props: BonusPageProps, context) {
        super(props, context)
        this.claim = this.claim.bind(this)
    }

    async componentWillMount() {
        this.refreshBalances(this.props)
    }

    async componentWillReceiveProps(props) {
        this.refreshBalances(props)
    }

    async refreshBalances(props: BonusPageProps) {
        if (!props.acct.model.address) {
            return
        }

        this.timelock = await MenloTokenTimelock.createAndValidate(web3, props.acct.model.contractAddresses.MenloBonusWalletTimelock)
        const balance = (await this.timelock.balance(props.acct.model.address)).toNumber() / 10 ** 18
        const timestamp = (await this.timelock.releaseTime).toNumber() * 1000
        const endTime = new Date(timestamp)

        console.log(`Lock ends at ${endTime.toString()}`)

        this.setState({ balance, endTime } )
    }

    async claim() {
        await this.timelock.releaseTx().send({})
        toast('Once the transaction confirms you will receive your ONE bonus tokens', {
        })
    }


    render() {
        return (
            <div>
                <TopNav>
                    <li className="nav-item"><A href='/'>Info</A></li>
                    <li className="nav-item"><A>Bonus</A></li>
                </TopNav>

                <div className="shadow-sm bonus" >
                    <div className="container">
                        <div className="col-md-7 game-detail-wrapper">
                            <div className="hero-logo-wrapper">
                                <img className="hero-logo" src={BlockOverflowIcon} />
                                <div className="hero-logo-text-wrapper">
                                    <h1>Bonus Tokens</h1>
                                    <h3>You have {this.state.balance} ONE bonus tokens locked</h3>
                                    { this.state.endTime.getTime() < new Date().getTime() ?
                                        <h4 className='mb-2'>Time lock is unlocked...</h4>
                                     :
                                        <h4 className='mb-2'>Will unlock in...</h4>
                                    }
                                    <div style={{ textAlign: 'left' }}>
                                        <CountdownTimer date={ this.state.endTime } renderCompleted={ () => {
                                            return (
                                                <div>
                                                    {this.state.balance > 0 &&
                                                    <div className="btn-wrapper">
                                                        <a className="btn btn-grey" style={{ width: '100%' }}
                                                           onClick={this.claim}>Claim Bonus Tokens Now</a>
                                                    </div>
                                                    }
                                                </div>
                                            )
                                        }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default withAcct(BonusPage)
