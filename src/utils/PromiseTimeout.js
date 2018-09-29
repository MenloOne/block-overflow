export class Timeout {
    constructor(message) {
        this.message = message
    }
}

export default function PromiseTimeout(ms, promise){

    // Create a promise that rejects in <ms> milliseconds
    let timeout = new Promise((resolve, reject) => {
        let id = setTimeout(() => {
            clearTimeout(id);
            reject(new Timeout('Timed out in '+ ms + 'ms.'))
        }, ms)
    })

    // Returns a race between our timeout and the passed in promise
    return Promise.race([
        promise,
        timeout
    ])
}