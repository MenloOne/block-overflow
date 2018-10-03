class Config {
    public contentNodeUrl: string

    constructor() {
        if (process.env.NODE_ENV === 'production') {
            this.contentNodeUrl = 'https://node.menlo.one'
            return
        }

        this.contentNodeUrl = 'http://localhost:3030'
    }
}

const config = new Config()

export default config
