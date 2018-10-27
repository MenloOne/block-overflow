import axios from 'axios'
import config from '../config'
import { ForumCTOGet, TopicsCTOGet } from './BlockOverflow.cto'

export class ContentNode {

    constructor() {
    }

    async getTopics(query: string | null, pageLimit?: number) : Promise<TopicsCTOGet> {
        let   url = `${config.contentNodeUrl}/topics`
        const params: string[] = []

        if (query) {
            params.push(`query=${query}`)
        }
        if (pageLimit) {
            params.push(`pageLimit=${pageLimit}`)
        }
        if (params.length > 0) {
            url += `?${params.join('&')}`
        }

        const result = await axios.get(url)
        return result.data
    }

    async getForum(address: string, account: string | null) : Promise<ForumCTOGet> {
        let   url = `${config.contentNodeUrl}/forums/${address}`
        const params: string[] = []

        if (account) {
            params.push(`account=${account}`)
        }
        if (params.length > 0) {
            url += `?${params.join('&')}`
        }

        const result = await axios.get(url)
        return result.data
    }
}
