import axios from 'axios';

import { BigNumber } from "bignumber.js";

import CNContract from './CNContract'

import { MenloTopics as MenloTopicsWeb3 } from '../contracts/MenloTopics';
import config from '../config'
import * as TC from '../contracts/typechain-runtime'
import { promisiwrap} from '../utils/promisify'


export class MenloTopics extends CNContract {

    topics: MenloTopicsWeb3 | null = null;
    cnUrl: string;
    object: {} = {}

    private constructor(web3?: any, address?: string | BigNumber) {
        super(web3, address)

        if (web3) {
            this.topics = new MenloTopicsWeb3(web3, address!)
        }

        this.cnUrl = `${config.contentNodeUrl}/topics`
    }

    static async createAndValidate(web3: any, address: string | BigNumber): Promise<MenloTopics> {
        const topics = new MenloTopics()
        if (web3) {
            topics.topics = await MenloTopicsWeb3.createAndValidate(web3, address)
        }

        const result = await axios.get(topics.cnUrl)
        topics.object = result.data

        return topics
    }

    public get owner(): Promise<string> {
        return promisiwrap(this.object['owner'] as string)
    }

    public get topicsCount(): Promise<BigNumber> {
        return promisiwrap(new BigNumber(this.object['topicsCount']))
    }

    public get topicCost(): Promise<BigNumber> {
        return promisiwrap(new BigNumber(this.object['topicCost']))
    }

    public get ACTION_NEWTOPIC(): Promise<BigNumber> {
        return promisiwrap(new BigNumber(this.object['ACTION_NEWTOPIC']))
    }

    public get getToken(): Promise<string> {
        return promisiwrap(this.object['getToken'] as string)
    }

    public forums(
        arg0: BigNumber | string
    ): Promise<[string, boolean, BigNumber, BigNumber, string]> {
        let a0 = arg0
        if (typeof a0 !== 'number') {
            a0 = (arg0 as BigNumber).toString(16)
        }
        return promisiwrap(this.object['forums'][a0])
    }

    public alias(arg0: BigNumber | string): Promise<string> {
        let a0 = arg0
        if (typeof a0 !== 'number') {
            a0 = (arg0 as BigNumber).toString(16)
        }
        return promisiwrap(this.object['alias'][a0] as string)
    }

    public reputation(arg0: BigNumber | string): Promise<BigNumber> {
        let a0 = arg0
        if (typeof a0 !== 'number') {
            a0 = (arg0 as BigNumber).toString(16)
        }
        return promisiwrap(new BigNumber(this.object['reputation'][a0]))
    }

    public reclaimTokenTx(
        _token: BigNumber | string
    ): TC.DeferredTransactionWrapper<TC.ITxParams> {
        if (!this.topics) { throw 'no web3' }
        return this.topics.reclaimTokenTx(_token)
    }
    public renounceOwnershipTx(): TC.DeferredTransactionWrapper<TC.ITxParams> {
        if (!this.topics) { throw 'no web3' }
        return this.topics.renounceOwnershipTx()
    }
    public transferOwnershipTx(
        _newOwner: BigNumber | string
    ): TC.DeferredTransactionWrapper<TC.ITxParams> {
        if (!this.topics) { throw 'no web3' }
        return this.topics.transferOwnershipTx(_newOwner)
    }
    public setAliasTx(
        _alias: string
    ): TC.DeferredTransactionWrapper<TC.ITxParams> {
        if (!this.topics) { throw 'no web3' }
        return this.topics.setAliasTx(_alias)
    }
    public addReputationTx(
        _user: BigNumber | string,
        _rep: BigNumber | number
    ): TC.DeferredTransactionWrapper<TC.ITxParams> {
        if (!this.topics) { throw 'no web3' }
        return this.topics.addReputationTx(_user, _rep)
    }
    public createForumTx(
        _from: BigNumber | string,
        _topicHash: string,
        _bounty: BigNumber | number,
        _length: BigNumber | number
    ): TC.DeferredTransactionWrapper<TC.ITxParams> {
        if (!this.topics) { throw 'no web3' }
        return this.topics.createForumTx(_from, _topicHash, _bounty, _length)
    }
    public onTokenReceivedTx(
        _from: BigNumber | string,
        _value: BigNumber | number,
        _action: BigNumber | number,
        _data: string[]
    ): TC.DeferredTransactionWrapper<TC.ITxParams> {
        if (!this.topics) { throw 'no web3' }
        return this.topics.onTokenReceivedTx(_from, _value, _action, _data)
    }
    public onForumClosedTx(
        _topics: BigNumber | string,
        _tokens: BigNumber | number,
        _votes: BigNumber | number,
        _winner: BigNumber | string
    ): TC.DeferredTransactionWrapper<TC.ITxParams> {
        if (!this.topics) { throw 'no web3' }
        return this.topics.onForumClosedTx(_topics, _tokens, _votes, _winner)
    }

    public OwnershipRenouncedEvent(eventFilter: {
        previousOwner?: BigNumber | string | Array<BigNumber | string>;
    }): TC.DeferredEventWrapper<
        { previousOwner: BigNumber | string },
        { previousOwner?: BigNumber | string | Array<BigNumber | string> }
        > {
        if (!this.topics) { throw 'no web3' }
        return this.topics.OwnershipRenouncedEvent(eventFilter)
    }
    public OwnershipTransferredEvent(eventFilter: {
        previousOwner?: BigNumber | string | Array<BigNumber | string>;
        newOwner?: BigNumber | string | Array<BigNumber | string>;
    }): TC.DeferredEventWrapper<
        { previousOwner: BigNumber | string; newOwner: BigNumber | string },
        {
            previousOwner?: BigNumber | string | Array<BigNumber | string>;
            newOwner?: BigNumber | string | Array<BigNumber | string>;
        }
        > {
        if (!this.topics) { throw 'no web3' }
        return this.topics.OwnershipTransferredEvent(eventFilter)
    }
    public NewTopicEvent(eventFilter: {}): TC.DeferredEventWrapper<
        { _forum: BigNumber | string },
        {}
        > {
        if (!this.topics) { throw 'no web3' }
        return this.topics.NewTopicEvent(eventFilter)
    }
}
