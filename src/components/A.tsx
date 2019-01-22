import React from 'react'
import { history } from '../router'


const A = ({ children, href = '', ...props }) => {

    const onClick = (evt) => {
        evt.stopPropagation()
        history.push(href)
    }

    // TODO: Make it look like it has an href= without putting href=  So underline, hover, etc
    return <a onClick={onClick} {...props}>{children}</a>
};

export default A
