import React from 'react'
import { history } from '../router'


const A = ({ children, href = '', ...props }) => {

    const onClick = (evt) => {
        evt.stopPropagation()
        history.push(href)
    }

    return <a onClick={onClick} {...props}>{children}</a>
};

export default A
