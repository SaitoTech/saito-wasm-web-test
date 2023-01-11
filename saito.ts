export default class Saito {
    static instance: any;

    constructor() {
        console.log("construct...");
    }

    async initialize() {
        console.log("initializing saito")
        if (typeof window === "undefined") {
            Saito.instance = await import("saito-wasm/dist/server");
        } else {
            Saito.instance = await import("saito-wasm/dist/browser");
        }
        console.log("saito1 : ", Saito.instance);
        await Saito.instance.initialize();
        console.log("saito initialized");
    }

}

