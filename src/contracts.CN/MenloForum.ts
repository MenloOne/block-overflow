import axios from 'axios';

import { BigNumber } from "bignumber.js";
import { MenloForum as MenloForumWeb3 } from '../contracts/MenloForum';

import CNContract from './CNContract'

import config from '../config'
import * as TC from '../contracts/typechain-runtime'
import { promisiwrap} from '../utils/promisify'

export class MenloForum extends CNContract {

    forum: MenloForumWeb3 | null = null;
    cnUrl: string;
    object: {} = {}

    private constructor(web3?: any, address?: string | BigNumber) {
        super(web3, address)

        if (web3) {
            this.forum = new MenloForumWeb3(web3, address!)
        }

        this.cnUrl = `${config.contentNodeUrl}/forum`
    }

    static async createAndValidate(web3: any, address: string | BigNumber): Promise<MenloForum> {
        const forum = new MenloForum()
        if (web3) {
            forum.forum = await MenloForumWeb3.createAndValidate(web3, address)
        }

        // Get full Forum object
        const result = await axios.get(forum.cnUrl)
        forum.object = result.data

        return forum
    }

    public get topicHash(): Promise<string> {
        return promisiwrap(this.object['topicHash'] as string)
    }

    public get pool(): Promise<BigNumber> {
        return promisiwrap(new BigNumber(this.object['pool']))
    }

    public get winningOffset(): Promise<BigNumber> {
        return promisiwrap(new BigNumber(this.object['winningOffset']))
    }

    public get voteCost(): Promise<BigNumber> {
        return promisiwrap(new BigNumber(this.object['voteCost']))
    }

    public get epochLength(): Promise<BigNumber> {
        return promisiwrap(new BigNumber(this.object['epochLength']))
    }

    public get ACTION_POST(): Promise<BigNumber> {
        return promisiwrap(new BigNumber(this.object['ACTION_POST']))
    }

    public get owner(): Promise<string> {
        return promisiwrap(this.object['owner'] as string)
    }

    public get author(): Promise<string> {
        return promisiwrap(this.object['author'] as string)
    }

    public get endTimestamp(): Promise<BigNumber> {
        return promisiwrap(new BigNumber(this.object['endTimestamp']))
    }

    public get postCost(): Promise<BigNumber> {
        return promisiwrap(new BigNumber(this.object['postCost']))
    }

    public get winningVotes(): Promise<BigNumber> {
        return promisiwrap(new BigNumber(this.object['winningVotes']))
    }

    public get ACTION_UPVOTE(): Promise<BigNumber> {
        return promisiwrap(new BigNumber(this.object['ACTION_UPVOTE']))
    }

    public get ACTION_DOWNVOTE(): Promise<BigNumber> {
        return promisiwrap(new BigNumber(this.object['ACTION_DOWNVOTE']))
    }

    public get postCount(): Promise<BigNumber> {
        return promisiwrap(new BigNumber(this.object['postCount']))
    }

    public get votesCount(): Promise<BigNumber> {
        return promisiwrap(new BigNumber(this.object['votesCount']))
    }

    public get claimed(): Promise<boolean> {
        return promisiwrap(this.object['votesCount'] === 'true')
    }

    public get winner(): Promise<string> {
        return promisiwrap(this.object['winner'] as string)
    }

    public messages(arg0: BigNumber | number): Promise<string> {
        let a0 = arg0
        if (typeof a0 !== 'number') {
            a0 = (arg0 as BigNumber).toNumber()
        }
        return promisiwrap(this.object['messages'][a0])
    }

    public posters(arg0: BigNumber | number): Promise<string> {
        let a0 = arg0
        if (typeof a0 !== 'number') {
            a0 = (arg0 as BigNumber).toNumber()
        }
        return promisiwrap(this.object['posters'][a0])
    }

    public votes(arg0: BigNumber | number): Promise<BigNumber> {
        let a0 = arg0
        if (typeof a0 !== 'number') {
            a0 = (arg0 as BigNumber).toNumber()
        }
        return promisiwrap(this.object['votes'][a0])
    }

    public voters(arg0: BigNumber | number, arg1: BigNumber | string): Promise<BigNumber> {
        let a0 = arg0
        if (typeof a0 !== 'number') {
            a0 = (arg0 as BigNumber).toNumber()
        }
        let a1 = arg1
        if (typeof a1 !== 'string') {
            a1 = (arg1 as BigNumber).toString(16)
        }
        return promisiwrap(this.object['voters'][a0][a1])
    }

    public getVoters(
        i: BigNumber | number,
        user: BigNumber | string
    ): Promise<BigNumber> {
        let a0 = i
        if (typeof a0 !== 'number') {
            a0 = (i as BigNumber).toNumber()
        }
        let a1 = user
        if (typeof a1 !== 'string') {
            a1 = (user as BigNumber).toString(16)
        }
        return promisiwrap(this.object['getVoters'][a0][a1])
    }

    public reclaimTokenTx(
        _token: BigNumber | string
    ): TC.DeferredTransactionWrapper<TC.ITxParams> {
        if (!this.forum) { throw ('No web3') }
        return this.forum.reclaimTokenTx(_token)
    }
    public renounceOwnershipTx(): TC.DeferredTransactionWrapper<TC.ITxParams> {
        if (!this.forum) { throw ('No web3') }
        return this.forum.renounceOwnershipTx()
    }
    public transferOwnershipTx(
        _newOwner: BigNumber | string
    ): TC.DeferredTransactionWrapper<TC.ITxParams> {
        if (!this.forum) { throw ('No web3') }
        return this.forum.transferOwnershipTx(_newOwner)
    }
    public claimTx(): TC.DeferredTransactionWrapper<TC.ITxParams> {
        if (!this.forum) { throw ('No web3') }
        return this.forum.claimTx()
    }
    public onTokenReceivedTx(
        _from: BigNumber | string,
        _value: BigNumber | number,
        _action: BigNumber | number,
        _data: string[]
    ): TC.DeferredTransactionWrapper<TC.ITxParams> {
        if (!this.forum) { throw ('No web3') }
        return this.forum.onTokenReceivedTx(_from, _value, _action, _data)
    }
    public redeemTx(
        _redeemer: BigNumber | string
    ): TC.DeferredTransactionWrapper<TC.ITxParams> {
        if (!this.forum) { throw ('No web3') }
        return this.forum.redeemTx(_redeemer)
    }
    public undoTx(
        _redeemer: BigNumber | string
    ): TC.DeferredTransactionWrapper<TC.ITxParams> {
        if (!this.forum) { throw ('No web3') }
        return this.forum.undoTx(_redeemer)
    }

    public OwnershipRenouncedEvent(eventFilter: {
        previousOwner?: BigNumber | string | Array<BigNumber | string>;
    }): TC.DeferredEventWrapper<
        { previousOwner: BigNumber | string },
        { previousOwner?: BigNumber | string | Array<BigNumber | string> }
        > {
        if (!this.forum) { throw ('No web3') }
        return this.forum.OwnershipRenouncedEvent(eventFilter)
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
        if (!this.forum) { throw ('No web3') }
        return this.forum.OwnershipTransferredEvent(eventFilter)
    }
    public AnswerEvent(eventFilter: {}): TC.DeferredEventWrapper<
        { _contentHash: string },
        {}
        > {
        if (!this.forum) { throw ('No web3') }
        return this.forum.AnswerEvent(eventFilter)
    }
    public CommentEvent(eventFilter: {}): TC.DeferredEventWrapper<
        { _parentHash: string; _contentHash: string },
        {}
        > {
        if (!this.forum) { throw ('No web3') }
        return this.forum.CommentEvent(eventFilter)
    }
    public PayoutEvent(eventFilter: {}): TC.DeferredEventWrapper<
        { _user: BigNumber | string; _tokens: BigNumber | number },
        {}
        > {
        if (!this.forum) { throw ('No web3') }
        return this.forum.PayoutEvent(eventFilter)
    }
    public VoteEvent(eventFilter: {}): TC.DeferredEventWrapper<
        { _offset: BigNumber | number; _direction: BigNumber | number },
        {}
        > {
        if (!this.forum) { throw ('No web3') }
        return this.forum.VoteEvent(eventFilter)
    }
}
