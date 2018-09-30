import * as React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'

import TopNav from '../components/TopNav'

import '../App.scss'
import TopicBoard from "../topics/TopicBoard";



class TopicsPage extends React.Component {

    state = {
    }

    constructor(props, context) {
        super(props, context)
    }

    render() {
        return (
            <div>
                <TopNav/>

                <div className="game-token shadow-sm">
                    <div className="container">

                        <TopicBoard/>

                    </div>
                </div>
            </div>
        )
    }
}

export default TopicsPage
