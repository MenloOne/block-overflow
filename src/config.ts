import { createBrowserHistory } from 'history'

const history = createBrowserHistory()

class Config {
    public contentNodeUrl: string

    constructor() {
        if (process.env.NODE_ENV === 'production') {
            this.contentNodeUrl = 'https://node.menlo.one'
            return
        }

        this.contentNodeUrl = 'https://localhost:8080'
    }
}

const config = new Config()

export {
    config,
    history
}
