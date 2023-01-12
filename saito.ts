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
        console.log("saito d : ", Saito.instance.default);
        let saito = await Saito.instance.default;
        console.log("saito2 : ", saito);
        await saito.initialize();
        console.log("saito initialized");
    }
}

