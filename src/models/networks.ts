export type ContractAddresses = {
    MenloToken: string,
    MenloTopics: string,
    MenloFaucet: string
}

interface NetworkAddresses {
    [network: number] : ContractAddresses;
}

export const networks: NetworkAddresses = {
    4: {
        MenloToken:  '0xb3d076232556cf5246b550e46e8868c624690b02',
        MenloTopics: '0xa7baeaf8e121784ed64bf3c3e1b6a96edd0f3ad2',
        MenloFaucet: '0x21f27028b06306a5aef98c8c47d0de5b913e197f',
    },
    42: {
        MenloToken:  '0xc4e010bbef04f68542b891561592e7e2a89d8648',
        MenloTopics: '0x9f956342c1d581e5efbe06433d22832ac131ffde',
        MenloFaucet: '0x8bdf5c9547a9769bc0915c1851ccef916fd59c39',
    }
}

