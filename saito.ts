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

    async initialize() {
        console.log("initializing saito")
        if (typeof window === "undefined") {

            let cr = await import ('node:crypto');
            // @ts-ignore
            globalThis.crypto = cr.webcrypto;

            let instance = await import("saito-wasm/dist/server");
            let inst2 = await instance.default;
            // console.log("saito : ", inst2);
            // await inst2.initSync("aaa");
            Saito.instance = inst2;
        } else {
            let instance = await import("saito-wasm/dist/browser");
            let inst2 = await instance.default;
            Saito.instance = inst2;
        }
        let configs = {
            "server": {
                "host": "127.0.0.1",
                "port": 13201,
                "protocol": "http",
                "endpoint": {
                    "host": "127.0.0.1",
                    "port": 13201,
                    "protocol": "http"
                },
                "verification_threads": 1,
                "channel_size": 10000,
                "stat_timer_in_ms": 5000,
                "thread_sleep_time_in_ms": 10,
                "block_fetch_batch_size": 10
            },
            "peers": [
                {
                    "host": "127.0.0.1",
                    "port": 12201,
                    "protocol": "http",
                    "synctype": "full"
                }
            ]
        };
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
        this.sockets.delete(index);
    }

}

