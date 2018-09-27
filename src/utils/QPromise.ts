class QPromiseStatus {
    isPending   : () => boolean
    isRejected  : () => boolean
    isFulfilled : () => boolean
}

function extend<T, U>(first: T, second: U): T & U {
    const result = <T & U>{};
    for (const id in first) {
        (<any>result)[id] = (<any>first)[id];
    }
    for (const id in second) {
        if (!result.hasOwnProperty(id)) {
            (<any>result)[id] = (<any>second)[id];
        }
    }
    return result;
}

type QPromise<T> = Promise<T> & QPromiseStatus

function QPromise<T>(param) : QPromise<T> {

    const promise = new Promise<T>(param)

    // Set initial state
    let isPending = true;
    let isRejected = false;
    let isFulfilled = false;

    // Observe the promise, saving the fulfillment in a closure scope.
    const result : Promise<T> & QPromiseStatus = extend<Promise<T>, QPromiseStatus>(
        promise.then(
            (v) => {
                isFulfilled = true;
                isPending = false;
                return v;
            },
            (e) => {
                isRejected = true;
                isPending = false;
                throw e;
            }
        ),
        {
            isFulfilled: () => { return isFulfilled; },
            isPending  : () => { return isPending; },
            isRejected : () => { return isRejected; },
        }
    )

    return result;
}

export {
    QPromise,
    QPromiseStatus
}
