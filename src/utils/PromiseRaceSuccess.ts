export class Timeout {
    message: string | null = null

    constructor(message) {
        this.message = message
    }
}

export default class PromiseRaceSuccess {

    errors: any[] = []

    async timeout<T>(ms: number, promises: Promise<T>[]): Promise<T> {
        const totalPromises = promises.length

        const timeout = new Promise<T>((resolve, reject) => {
            const id = setTimeout(() => {
                clearTimeout(id);
                reject(new Timeout(`Timed out in ${ms}ms.`))
            }, ms)
        })

        return await Promise.race([timeout, Promise.race(promises.map(p => {
            return new Promise<T>(async (resolve, reject) => {
                try {
                    resolve(await p)
                } catch (e) {
                    this.errors.push(e)
                    if (this.errors.length === totalPromises) {
                        reject(this.errors)
                    } else {
                        console.log(`^ Ignoring this promise failure for ${ms}ms...`)
                        await new Promise((resolve) => {
                            setTimeout(() => resolve, ms)
                        })
                        reject(this.errors)
                    }
                }
            })
        }))])
    }
}

