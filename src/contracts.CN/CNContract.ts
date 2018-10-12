import { BigNumber } from 'bignumber.js'

export default class CNContract {
    public readonly rawWeb3Contract: any = null;
    public readonly address?: string | BigNumber;

    constructor(
        web3: any,
        address?: string | BigNumber
    ) {
        this.address = address;
    }
}
