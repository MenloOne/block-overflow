export type ContractAddresses = {
    MenloToken: string,
    MenloTopics: string,
    MenloFaucet?: string
}

interface NetworkAddresses {
    [network: number] : ContractAddresses;
}

export const networks: NetworkAddresses = {
    1: {
        MenloToken:  '0x4d807509aece24c0fa5a102b6a3b059ec6e14392',
        MenloTopics: '0xd428f22c0d1fc3cc614cbcd6953071c3af4c71d2',
    },
    4: {
        MenloToken:  '0xb3d076232556cf5246b550e46e8868c624690b02',
        MenloTopics: '0x8ba7a067b17809e99ff852f6e15535e78184308c',
        MenloFaucet: '0x21f27028b06306a5aef98c8c47d0de5b913e197f',
    },
    42: {
        MenloToken:  '0xc4e010bbef04f68542b891561592e7e2a89d8648',
        MenloTopics: '0x9f956342c1d581e5efbe06433d22832ac131ffde',
        MenloFaucet: '0x8bdf5c9547a9769bc0915c1851ccef916fd59c39',
    }
}

