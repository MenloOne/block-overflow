import * as React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import Dropdown from 'react-dropdown'
import 'react-dropdown/style.css'

import { AccountContext, withAcct, MetamaskStatus } from '../models/Account'
import { Topics, TopicsContext, TopicsCtxtComponent } from '../models/Topics'

import TopNav from '../components/TopNav'
import Sidebar from '../components/Sidebar'
import Loader from '../components/Loader'


import QuestionsBoard from "./QuestionsBoard";

import TopicForm from './QuestionForm'

import '../App.scss'
import Topic from '../models/Topic'


class QuestionsPageProps {
    acct: AccountContext
}

class QuestionsPageState {
    topics: TopicsContext
    searchQuery: string
    showCompose: boolean
    showInstructions: boolean
    activeFilter: Function;
}


class QuestionsPage extends React.Component<QuestionsPageProps> {

    static topics: Topics = new Topics()

    state : QuestionsPageState
    filters: { name: string; fn: Function }[] = [
        { name: 'Most Recent', fn: (topics) => {
            return topics.sort((top, top2) => {
                console.log(top);
                
                return top2.date - top.date;
            }); 
        } },
        { name: 'Most Active', fn: (topics) => {
            return topics.sort((top, top2) => {

                return top2.totalAnswers - top.totalAnswers;
            }); 
        }
        },
        {
            name: 'Highest Stakes', fn: (topics) => {
                return topics.sort((top, top2) => {

                    return top2.pool - top.pool;
                });
            }
        },
        {
            name: 'No Answers', fn: (topics) => {
                return topics.filter((top) => {

                    return top.totalAnswers === 0;
                });
            }
        }];

    constructor(props: QuestionsPageProps, context) {
        super(props, context)

        this.topicsChanged = this.topicsChanged.bind(this)
        this.clickAsk = this.clickAsk.bind(this)
        this.onSubmitQuestion = this.onSubmitQuestion.bind(this)
        this.onCancelQuestion = this.onCancelQuestion.bind(this)
        this.clickCloseInstructions = this.clickCloseInstructions.bind(this)
        this.clickSignIn = this.clickSignIn.bind(this)
        this.onChangeSearch = this.onChangeSearch.bind(this)
        this._onSelect = this._onSelect.bind(this)

        this.state = {
            showCompose: true,
            showInstructions: true,
            topics: { model: Object.assign({}, this.topics), svc: this.topics },
            searchQuery: '',
            activeFilter: this.filters[0].fn
        }

        QuestionsPage.topics.setCallback(this.topicsChanged)
        this.prepTopics(props)
    }

    async prepTopics(props: QuestionsPageProps) {
        this.topics.setAccount(props.acct.svc)
    }

    componentWillReceiveProps(newProps: QuestionsPageProps) {
        if (newProps.acct.model !== this.props.acct.model) {
            this.prepTopics(newProps)
        }
    }

    onChangeSearch(evt) {
        const query = evt.target.value
        this.setState({ searchQuery: query })
        this.topics.setFilter(query)
    }

    get topics() : Topics {
        return QuestionsPage.topics
    }

    async topicsChanged(_topic: Topic) {
        this.setState({ topics: { model: Object.assign({}, this.topics), svc: this.topics } })
    }

    clickSignIn() {
        this.props.acct.svc.signIn()
    }

    clickCloseInstructions() {
        this.setState({ showInstructions: false })
    }

    onCancelQuestion() {
        this.setState({ showCompose: false })
    }

    async onSubmitQuestion(title: string, body: string, tokenBounty: number) {
        await this.state.topics.svc.createTopic(title, body, tokenBounty)
        this.setState({ showCompose: false })
    }

    clickAsk() {
        this.setState({ showCompose: true })
        window.scrollTo(0, document.body.scrollHeight);
    }

    renderUserStats() {
        return (
            <div className="user-stats right-side-box white-bg">
                <div className="block-header">
                    <h4>User Metrics</h4>
                </div>
                <div className="block-padding">
                    <div className="stats-wrapper">
                        <div className="stat">
                            <div className="number-circle">
                                <span>84%</span>
                            </div>
                            <div className="stat-label-wrapper">
                                <span>Your Reputation</span>
                                <span>3,812 Reviews</span>
                            </div>
                        </div>
                        <div className="stat">
                            <div className="number-circle">
                                <span>102</span>
                            </div>
                            <div className="stat-label-wrapper">
                                <span>ONE Tokens Earned</span>
                                <span>($10 USD)</span>
                            </div>
                        </div>
                        <div className="stat">
                            <div className="number-circle">
                                <span>12</span>
                            </div>
                            <div className="stat-label-wrapper">
                                <span>Your Posts</span>
                                <span>See Posts</span>
                            </div>
                        </div>
                        <div className="stat">
                            <div className="number-circle">
                                <span>9</span>
                            </div>
                            <div className="stat-label-wrapper">
                                <span>Paid Views</span>
                                <span>Link</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    _onSelect(newOption) {
        this.setState({ activeFilter: this.filters.filter((filters) => {
            return filters.name === newOption.value
        })[0].fn})
    }

    getFilter() {
        
        return this.state.activeFilter
    }

    render() {
        return (
            <TopicsCtxtComponent.Provider value={this.state.topics}>
                <div>
                    <TopNav />

                    <div className="content-wrapper">
                        <div className="container">
                            <div className="row">
                                <div className="col-md-8">
                                    <div className="list-actions row">
                                        <div className="col-4">
                                            {
                                                (this.state.showCompose && this.props.acct.model.status === MetamaskStatus.Ok) ? 
                                                    <a className='btn ask-btn' onClick={this.clickAsk}>Ask a Question</a> :
                                                    <Loader size={22} />
                                            }
                                        </div>
                                        <div className="col-4 offset-4">
                                            {(this.state.topics.model.topics.length !== 0 && this.props.acct.model.status === MetamaskStatus.Ok) ?
                                            <div>
                                                <span>Sort By:</span>
                                                <Dropdown options={this.filters.map((f) => { return f.name })} onChange={this._onSelect} value={this.filters[0].name} placeholder="Select an option" />
                                                </div> : <div style={{
                                                    textAlign: 'right',
                                                    marginRight: '5px'}}><Loader size={22} /></div>
                                        }
                                        </div>
                                    </div>
                                    <div className='left-side'>
                                        <div className="left-side-wrapper">
                                            <input className='search' placeholder='Search...' value={this.state.searchQuery} onChange={this.onChangeSearch} />
                                        </div>
                                        <QuestionsBoard filter={this.getFilter()} />
                                    </div>
                                    {
                                        (this.state.showCompose && this.props.acct.model.status === MetamaskStatus.Ok) ?
                                            <TopicForm onSubmit={this.onSubmitQuestion} /> : <div className='left-side'><div className="left-side-wrapper" style={{marginTop: '2rem', textAlign: 'center'}}><Loader /></div></div>
                                    }
                                </div>

                                <div className="col-md-4">
                                    {/* {this.renderUserStats()} */}
                                    <Sidebar />

                                    {/* <div className="token-metrics right-side-box white-bg">
                                    <div className="block-header">
                                        <h4>Token Metrics</h4>
                                    </div>
                                    <div className="block-padding">
                                        <ul>
                                            <li>
                                                <div className="name">Tokens in circulation</div>
                                                <div className="detail">354,000,000</div>
                                            </li>
                                            <li>
                                                <div className="name">Price</div>
                                                <div className="detail">$0.03</div>
                                            </li>
                                            <li>
                                                <div className="name">Volume</div>
                                                <div className="detail">34,241</div>
                                            </li>
                                            <li>
                                                <div className="name">Token Supply</div>
                                                <div className="detail">50% discount</div>
                                            </li>
                                        </ul>
                                    </div>
                                </div> */}

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </TopicsCtxtComponent.Provider>
        )
    }
}

export default withAcct(QuestionsPage)
