/*
 * Copyright 2018 Menlo One, Inc.
 * Parts Copyright 2018 Vulcanize, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the “License”);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an “AS IS” BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react'
import { toast } from 'react-toastify'
import { withAcct } from '../models/Account'
import utils from '../utils'
import SimpleMDE from 'react-simplemde-editor';
import "simplemde/dist/simplemde.min.css";
import MetamaskModal from 'src/components/MetamaskModal';


class AnswerFormProps {
    rows: number
    icon: string
    onSubmit: (message: string) => void
    onCancel?: () => void
}


class AnswerFormState {
    error: string | null
    message: string
    submitting: boolean
}

class AnswerForm extends React.Component<AnswerFormProps> {
    textarea: HTMLTextAreaElement | null
    state: AnswerFormState

    constructor(props: AnswerFormProps, context) {
        super(props, context)

        this.onChange = this.onChange.bind(this)
        this.onSubmit = this.onSubmit.bind(this)

        this.updateTextareaHeight = this.updateTextareaHeight.bind(this);

        this.state = {
            error: null,
            message: '',
            submitting: false
        }
    }

    componentDidMount() {
        this.updateTextareaHeight();
    }

    async onSubmit(event) {
        event.preventDefault()
        this.setState({ submitting: true })

        try {
            await this.props.onSubmit(this.state.message)
            this.setState({
                message: '',
                submitting: false,
                error: null
            })
        } catch (e) {

            let msg = e.message
            let timeout = 4000

            if (e.message === "Error: MetaMask Tx Signature: User denied transaction signature.") {
                msg = "You cancelled the MetaMask transaction."
                timeout = 1500
            }

            toast(msg, {
                autoClose: timeout,
                toastId: 2
            })

            console.error(e)

            throw e
        }
    }

    onChange(value) {
        this.updateTextareaHeight();
        this.setState({ message: value })
    }

    updateTextareaHeight() {
        if (this.textarea && this.textarea.scrollHeight < utils.getViewport().h * .8) {
            this.textarea.style.height = `${this.textarea.scrollHeight + 2}px`; // +2 for border
        }
    }

    render() {
        return (
            <form onSubmit={this.onSubmit}>
                { this.props.rows === 1 &&
                    <div>
                        { this.props.icon &&
                        <span className='comment-indicator'><i className={ `fa fa-fw ${ this.props.icon }` }/></span>
                        }
                        <textarea
                            className='field'
                            onChange={(e) => this.onChange(e.target.value)}
                            value={this.state.message}
                            rows={ 1 }
                            autoFocus={true}
                            ref={(ref) => this.textarea = ref}
                        />
                        <input type="submit" className="btn submit-btn" disabled={this.state.submitting} value='Vote' />
                    </div>
                }
                { this.props.rows > 1 &&
                    <div>
                        <SimpleMDE
                            onChange={this.onChange}
                            value={this.state.message}
                            options={{
                                autofocus: true,
                                spellChecker: false,
                                // etc.
                            }}
                        />
                        <input type="submit" className="btn submit-btn" disabled={this.state.submitting} value='Post Answer' />
                    </div>
                }
                { this.props.onCancel ? <a className="btn cancel-btn" onClick={this.props.onCancel}>Cancel</a> : null }
                {this.state.submitting && <MetamaskModal />}
            </form>
        )
    }
}

export default withAcct(AnswerForm)
