export default class QPromise<T> extends Promise<T> {

    public isPending   : boolean
    public isRejected  : boolean
    public isFulfilled : boolean

    constructor(func) {
        super(func)

        // Set initial state
        this.isPending = true;
        this.isRejected = false;
        this.isFulfilled = false;

        // Observe the promise, saving the fulfillment in a closure scope.
        this.then(
            (v) => {
                this.isFulfilled = true;
                this.isPending = false;
                return v;
            },
            (e) => {
                this.isRejected = true;
                this.isPending = false;
                throw e;
            }
        );
    }
}
