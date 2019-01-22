class Config {
    public contentNodeUrl: string
    public apiUrl: string
    public ipfsProtocol: string
    public ipfsUrl: string
    public ipfsPort: string

    constructor() {
        if (process.env.NODE_ENV === 'production') {
            this.contentNodeUrl = 'https://cn.menlo.one'
            this.ipfsProtocol = 'https'
            this.ipfsUrl  = 'ipfs.menlo.one'
            this.ipfsPort = '4002'
        } else {
            this.contentNodeUrl = 'https://cn.menlo.one' // Use 'http://localhost:8080' if running local version of Content Node
            this.ipfsProtocol = 'https'
            this.ipfsUrl  = 'ipfs.menlo.one' // Use 'http://localhost' if running local IPFS
            this.ipfsPort = '4002'
        }

        this.apiUrl = `${this.contentNodeUrl}/v0`
    }
}

const config = new Config()

export default config

