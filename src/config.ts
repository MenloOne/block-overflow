class Config {
    public contentNodeUrl: string

    constructor() {
        if (process.env.NODE_ENV === 'production') {
            this.contentNodeUrl = 'https://node.menlo.one/v0'
            return
        }

        this.contentNodeUrl = 'http://localhost:8080/v0'
    }
}

const config = new Config()

export default config
