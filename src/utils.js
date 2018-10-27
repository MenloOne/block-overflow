import web3 from './models/Web3'

const utils = {}

utils.formatNumber = function formatNumber(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
}

utils.getViewport = function getViewport() {
    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    return {w, h} 
}



utils.isMacintosh = function isMacintosh() {
    return navigator.platform.indexOf('Mac') > -1
}   

utils.isWindows = function isWindows() {
    return navigator.platform.indexOf('Win') > -1
}



utils.getUrl = async function getUrl(props) {

    let url = ''

    return new Promise((resolve, reject) => {

        web3.version.getNetwork((err, netId) => {
            const { address, etherscanTab } = props;
            const targetId = etherscanTab ? `#${etherscanTab}` : '';

            switch (netId) {
                case "42":
                    url = 'https://kovan.etherscan.io'
                    break
                default:
                    url = 'https://etherscan.io'
            }

            resolve(`${url}/address/${address}${targetId}`);
        })
    })

}

export default utils
