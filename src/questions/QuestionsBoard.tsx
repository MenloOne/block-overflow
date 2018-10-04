import * as React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'

import { AccountContext, MetamaskStatus, withAcct } from '../models/Account'
import { TopicsContext, withTopics } from "../models/Topics";

import TopicView from './QuestionRow'



import '../App.scss'


interface TopicBoardProps {
    acct: AccountContext,
    topics: TopicsContext
}

interface TopicBoardState {
    topFive: boolean
}

class QuestionsBoard extends React.Component<TopicBoardProps> {

    state : TopicBoardState = {
        topFive: false
    }
    
    constructor(props: any, context: any) {
        super(props, context)
    }

    renderMessagesFilterButton() {
        if (this.state.topFive) {
            return (<button onClick={() => this.setState({ topFive: false })}>View All Messages</button>)
        } else {
            return (<button onClick={() => this.setState({ topFive: true })}>View Top Five Messages</button>)
        }
    }

    renderMessages() {
        if (this.props.topics.model.topics.length === 0 && this.props.acct.model.status !== MetamaskStatus.Ok) {
            return (<li className=''>
                <div style={{ paddingBottom: '3em' }}>
                    Loading Questions...
                </div>
            </li>)
        }

        if (this.props.topics.model.topics.length === 0) {
            return (<li className=''>
                <div style={{ paddingBottom: '3em' }}>
                    Be the first to ask a question...
                </div>
            </li>)
        }

        const topics = this.props.topics.svc.latestTopics
        return topics.filter(m => m.filled).map((m, index) => {
            return (
                <div key={index} className='row'>
                    <div className='col-12'>
                        <TopicView topic={m} />
                    </div>
                </div>
            )
        })
    }


    render() {
        return (
            <div className="comments">
                <ul>
                    { this.renderMessages() }
                </ul>
            </div>
        )
    }
}

export default withAcct(withTopics(QuestionsBoard))

