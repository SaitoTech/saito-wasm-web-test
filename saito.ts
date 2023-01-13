import {webcrypto} from 'node:crypto'

export default class Saito {
    static instance: any;

    constructor() {
        console.log("construct...");
    }

    async initialize() {
        console.log("initializing saito")
        if (typeof window === "undefined") {
            // @ts-ignore
            globalThis.crypto = webcrypto
            // @ts-ignore
            // global.fetch = (await import("node-fetch")).default;
            let instance = await import("saito-wasm/dist/server");
            let inst2 = await instance.default;
            console.log("saito : ", inst2);
            // await inst2.initSync("aaa");
            Saito.instance = inst2;
        } else {
            let instance = await import("saito-wasm/dist/browser");
            let inst2 = await instance.default;
            Saito.instance = inst2;
        }

        await Saito.instance.initialize();
        console.log("saito initialized");
    }
}

