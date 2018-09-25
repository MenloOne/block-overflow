module.exports = function (no) {
    if (no.constructor.name == 'Number') {
        return (no/(10**18)).toLocaleString()
    }

    return no.dividedBy(10**18).toFormat(0)
}

