class Config {
    public contentNodeUrl: string
    public apiUrl: string

    constructor() {
        if (process.env.NODE_ENV === 'production') {
            this.contentNodeUrl = 'https://cn.menlo.one'
        } else {
            this.contentNodeUrl = 'https://cn.menlo.one' // 'http://localhost:8080'
        }

        this.apiUrl = `${this.contentNodeUrl}/v0`
    }
}

const config = new Config()

export default config
