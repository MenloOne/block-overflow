import axios from 'axios'
import config from '../config'
import { ForumCTOGet, MessageCTOPost, TopicCTOPost, TopicsCTOGet } from './BlockOverflow.cto'

export class ContentNode {

    constructor() {
    }

    async getTopics(query: string | null, continuation?: string | null, pageLimit?: number) : Promise<TopicsCTOGet> {
        let   url = `${config.apiUrl}/topics`
        const params: string[] = []

        if (query) {
            params.push(`query=${query}`)
        }
        if (pageLimit) {
            params.push(`pageLimit=${pageLimit}`)
        }
        if (continuation) {
            params.push(`continuation=${continuation}`)
        }
        if (params.length > 0) {
            url += `?${params.join('&')}`
        }

        const result = await axios.get(url)
        return result.data
    }

    async createTopic(topic: TopicCTOPost) : Promise<any> {
        const url = `${config.apiUrl}/topics`

        const result = await axios.post(url, {
            topic
        })

        return result
    }

    async getForum(address: string, account: string | null) : Promise<ForumCTOGet> {
        let   url = `${config.apiUrl}/forums/${address}`
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

    async createMessage(message: MessageCTOPost) : Promise<any> {
        const url = `${config.apiUrl}/forums/${message.forumAddress}/messages`

        const result = await axios.post(url, {
            message
        })

        return result
    }

}
