import Saito from './saito';


let saito = new Saito();

// saito.initialize().then(() => {
//     console.log("test1");
//     return saito.getInstance().get_latest_block_hash();
// }).then(() => {
//     console.log("test2");
// });

import("saito-wasm/dist/browser")
    .then((s: any) => {
        console.log("saito 1 : ", s);
        return s.default;
    })
    .then((s) => {
        console.log("saito 2 : ", s);
        Saito.instance = s;
        let configs = {
            "server": {
                "host": "127.0.0.1",
                "port": 3000,
                "protocol": "http",
                "endpoint": {
                    "host": "127.0.0.1",
                    "port": 3000,
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
                    "port": 13201,
                    "protocol": "http",
                    "synctype": "full"
                }
            ]
        };
        return saito.initialize(configs);
    })
    .then(() => {
        console.log("test1");
        return saito.getInstance().get_latest_block_hash();
    })
    .then(() => {
        console.log("test2");
    })

// @ts-ignore
global.shared_methods = {
    send_message: (peer_index: bigint, buffer: Uint8Array) => {
        let socket = saito.getSocket(peer_index);
        socket.send(buffer);
    },
    send_message_to_all: (buffer: Uint8Array, exceptions: Array<bigint>) => {
        saito.sockets.forEach((socket, key) => {
            if (exceptions.includes(key)) {
                return;
            }
            socket.send(buffer);
        });
    },
    connect_to_peer: (peer_data: any) => {
        let protocol = "ws";
        if (peer_data.protocol === "https") {
            protocol = "wss";
        }
        let url = protocol + "://" + peer_data.host + ":" + peer_data.port + "/wsopen";

        try {
            console.log("connecting to " + url + "....");
            let socket = new WebSocket(url);
            socket.binaryType = "arraybuffer";
            let index = saito.addNewSocket(socket);

            socket.onmessage = (event: MessageEvent) => {
                // console.log("buffer : ", event.data);
                saito.getInstance().process_msg_buffer_from_peer(new Uint8Array(event.data), index);
            };

            socket.onopen = () => {
                saito.getInstance().process_new_peer(index, peer_data);
            };
            socket.onclose = () => {
                saito.getInstance().process_peer_disconnection(index);
            };

            console.log("connected to : " + url + " with peer index : " + index);
        } catch (e) {
            console.error(e);
        }
    },
    write_value: (key: string, value: Uint8Array) => {
        try {
            localStorage.setItem(key, Buffer.from(value).toString("base64"));
        } catch (error) {
            console.error(error);
        }
    },
    read_value: (key: string) => {
        try {
            let data = localStorage.getItem(key);
            if (!data) {
                console.log("item not found for key : " + key);
                return null;
            }
            let buffer = Buffer.from(data, "base64");
            let array = new Uint8Array(buffer);

            return array;
        } catch (error) {
            console.error(error);
            return null;
        }
    },
    load_block_file_list: () => {
        try {
            // console.log("loading block file list...");
            // let files = Object.keys(localStorage);
            // console.log("files : ", files);
            // return files;
            return [];
        } catch (e) {
            console.error(e);
            return [];
        }
    },
    is_existing_file: (key: string) => {
        try {
            return !!localStorage.getItem(key);
        } catch (error) {
            console.error(error);
            return false;
        }
    },
    remove_value: (key: string) => {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error(e);
        }
    },
    disconnect_from_peer: (peer_index: bigint) => {
        saito.removeSocket(peer_index);
    },
    fetch_block_from_peer: (hash: Uint8Array, peer_index: bigint, url: string) => {
        fetch(url, {
            mode: "no-cors"
        })
            .then((res: any) => {
                console.log("block res : ", res);
                return res.arrayBuffer();
            })
            .then((buffer: ArrayBuffer) => {
                console.log("block buffer : ", buffer);
                return new Uint8Array(buffer);
            }).then((buffer: Uint8Array) => {
            saito.getInstance().process_fetched_block(buffer, hash, peer_index);
        })
    }
};

module.exports = saito;
