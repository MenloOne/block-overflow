import * as React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'

import TopNav from '../components/TopNav'
import MessageBoard from '../messaging/MessageBoard'
import { Forum, ForumContext } from '../services/Forum'
import { AccountContext, withAcct } from "../services/Account";

import '../App.scss'


interface ForumProps {
    params: { address: string },
    acct: AccountContext
}

interface ForumState {
    forum: ForumContext
}


class ForumPage extends React.Component<ForumProps> {

    state : ForumState
    forum : Forum

    constructor(props : ForumProps, context) {
        super(props, context)

        this.forum = new Forum(props.params.address)

        this.state = {
            forum: { model: this.forum, svc: this.forum}
        }
        
        this.prepForum(props)
    }

    async prepForum(props: ForumProps) {
        await this.forum.setAccount(props.acct.svc)
        this.setState({ forum: { model: Object.assign({}, this.forum), svc: this.forum }  })
    }

    componentWillReceiveProps(nextProps : ForumProps, nextContext) {
        this.updateForum(nextProps)
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
