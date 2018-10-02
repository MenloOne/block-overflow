import * as React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'

import TopNav from '../components/TopNav'
import AnswersBoard from './AnswersBoard'
import { Forum, ForumContext } from '../models/Forum'
import { AccountContext, withAcct } from "../models/Account";
import { history } from '../router'

import '../App.scss'


interface ForumProps {
    params: { address: string },
    acct: AccountContext
}

interface ForumState {
    forum: ForumContext
}


class AnswersPage extends React.Component<ForumProps> {

    state : ForumState
    forum : Forum

    constructor(props : ForumProps, context) {
        super(props, context)

        this.goBack = this.goBack.bind(this)

        this.forum = new Forum(props.params.address)

        this.state = {
            forum: { model: this.forum, svc: this.forum}
        }
        
        this.prepForum(props)
    }

    async prepForum(props: ForumProps) {
        try {
            await this.forum.setAccount(props.acct.svc)
        } catch (e) {
            // If this fails we probably got a bad forum address
            console.log('Error setting up forum ', e)
            history.push('/')
        }
        this.setState({ forum: { model: Object.assign({}, this.forum), svc: this.forum }  })
    }

    componentWillReceiveProps(nextProps : ForumProps, nextContext) {
        this.updateForum(nextProps)
    }

    goBack() {
        history.push('/')
    }

    async updateForum(nextProps : ForumProps) {
        if (nextProps.params.address !== this.props.params.address) {
            this.forum = new Forum(nextProps.params.address)
            this.prepForum(nextProps)
        }

        if (nextProps.acct.model.address !== this.props.acct.model.address) {
            this.prepForum(nextProps)
        }
    }

    render() {
        return (
            <div>
                <TopNav/>

                <div className="content-wrapper">
                    <div className="container">
                        <div className="row">
                            <div className="col-12">
                                <p>
                                    <a onClick={ this.goBack }>&laquo; Back to Topics</a>
                                </p>

                                <AnswersBoard forum={ this.state.forum }/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default withAcct(AnswersPage)
