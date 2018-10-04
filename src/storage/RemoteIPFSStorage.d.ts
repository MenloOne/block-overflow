declare namespace IPFS {

    export class Pins {
        add(hash: string)
        rm(hash: string)
    }

    interface IPFS {
        pin: IPFS.Pins
    }
}
