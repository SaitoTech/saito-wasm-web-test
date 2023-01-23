export default class Saito {
    static instance: any;
    sockets: Map<bigint, any> = new Map<bigint, any>();
    nextIndex: bigint = BigInt(0);

    constructor() {
        console.log("construct...");
    }

    public getInstance(): any {
        return Saito.instance;
    }

    async initialize(configs: any) {
        console.log("initializing saito")

        await Saito.instance.initialize(configs);
        console.log("saito initialized");

        setInterval(() => {
            Saito.instance.process_timer_event(BigInt(100));
        }, 100);
    }

    public addNewSocket(socket: any): bigint {
        this.nextIndex++;
        this.sockets.set(this.nextIndex, socket);
        return this.nextIndex;
    }

    public getSocket(index: bigint): any | null {
        return this.sockets.get(index);
    }

    public removeSocket(index: bigint) {
        let socket = this.sockets.get(index);
        this.sockets.delete(index);
        socket.close();
    }

}

