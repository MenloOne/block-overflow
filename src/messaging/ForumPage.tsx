import * as React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'

import TopNav from '../components/TopNav'
import MessageBoard from '../messaging/MessageBoard'
import { Forum } from '../services/Forum'
import { AccountContext, withAcct } from "../services/Account";

import '../App.scss'


interface ForumProps {
    params: { address: string },
    acct: AccountContext
}

interface ForumState {
    forum?: Forum
}


class ForumPage extends React.Component<ForumProps> {

    state : ForumState

    constructor(props : ForumProps, context) {
        super(props, context)

        this.state = {
            forum: new Forum(props.params.address)
        }

        this.state.forum!.setAccount(props.acct.svc)
    }

    componentWillReceiveProps(nextProps : ForumProps, nextContext) {
        this.updateForum(nextProps)
    }

    async updateForum(nextProps : ForumProps) {
        if (nextProps.acct.model.address !== this.props.acct.model.address || nextProps.params.address !== this.props.params.address) {
            const forum = new Forum(nextProps.params.address)
            await forum.setAccount(nextProps.acct.svc)
            this.setState({ forum  })
        }
    }

    render() {
        return (
            <div>
                <TopNav/>

                <div className="content-wrapper">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-8">
                                <p>
                                    <a href="">&laquo; Back to Topics</a>
                                </p>

                                <MessageBoard forum={ this.state.forum }/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default withAcct(ForumPage)
