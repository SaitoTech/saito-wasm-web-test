import {parse} from "url";

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const fetch = require("node-fetch");
const fs = require("fs");
const process = require("process");
const cors = require("cors");

import {WebSocketServer, WebSocket} from 'ws';

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const blockRouter = require("./routes/block.js");

import Saito from './saito';
// const Saito = require("./saito").default;

let cr = require('crypto');
globalThis.crypto = cr.webcrypto;

const appNode = express();

appNode.use(cors());
appNode.use(logger('dev'));
appNode.use(express.json());
appNode.use(express.urlencoded({extended: false}));
appNode.use(cookieParser());
appNode.use(express.static(path.join(__dirname, 'public')));

appNode.use('/', indexRouter);
appNode.use('/users', usersRouter);
appNode.use("/block/", blockRouter);


let saito = new Saito();

import("saito-wasm/dist/server")
    .then((s: any) => {
        return s.default;
    })
    .then((s) => {
        Saito.instance = s;
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
                    "port": 12101,
                    "protocol": "http",
                    "synctype": "full"
                }
            ]
        };
        return saito.initialize(configs);
    });
// saito.initialize().then(() => {
//
// });

function startServer(server: any) {
    const wss = new WebSocketServer({
        // server: appNode,
        noServer: true,
        // path: "wsopen"
    });

    server.on("upgrade", (request: any, socket: any, head: any) => {
        console.log(" ----> " + request.url);
        const {pathname} = parse(request.url);
        if (pathname === "/wsopen") {
            wss.handleUpgrade(request, socket, head, (websocket: any) => {
                wss.emit("connection", websocket, request);
            });
        } else {
            socket.destroy();
        }

    });
    wss.on("connection", (socket: any, request: any) => {
        let index = saito.addNewSocket(socket);
        socket.on("message", (buffer: any) => {
            saito.getInstance().process_msg_buffer_from_peer(buffer, index);
        });
        socket.on("close", () => {
            saito.getInstance().process_peer_disconnection(index);
        });
        saito.getInstance().process_new_peer(index, null);
    });

}

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
            let index = saito.addNewSocket(socket);

            socket.on("message", (buffer: any) => {
                saito.getInstance().process_msg_buffer_from_peer(buffer, index);
            });
            socket.on("close", () => {
                saito.getInstance().process_peer_disconnection(index);
            });
            saito.getInstance().process_new_peer(index, peer_data);
            console.log("connected to : " + url + " with peer index : " + index);
        } catch (e) {
            console.error(e);
        }
    },
    write_value: (key: string, value: Uint8Array) => {
        try {
            fs.writeFileSync(key, value);
        } catch (error) {
            console.error(error);
        }
    },
    read_value: (key: string) => {
        try {
            let data = fs.readFileSync(key);
            return data;
        } catch (error) {
            console.error(error);
            return null;
        }
    },
    load_block_file_list: () => {
        try {
            let files = fs.readdirSync("data/blocks/");
            files = files.filter((file: string) => file.endsWith(".sai"));
            return files;

        } catch (e) {
            console.log("cwd : ", process.cwd())
            console.error(e);
            return [];
        }
    },
    is_existing_file: (key: string) => {
        try {
            let result = fs.statSync(key);
            return !!result;
        } catch (error) {
            console.error(error);
            return false;
        }
    },
    remove_value: (key: string) => {
        try {
            fs.rmSync(key);
        } catch (e) {
            console.error(e);
        }
    },
    disconnect_from_peer: (peer_index: bigint) => {
        saito.removeSocket(peer_index);
    },
    fetch_block_from_peer: (hash: Uint8Array, peer_index: bigint, url: string) => {
        fetch(url)
            .then((res: any) => {
                return res.arrayBuffer();
            })
            .then((buffer: ArrayBuffer) => {
                return new Uint8Array(buffer);
            }).then((buffer: Uint8Array) => {
            saito.getInstance().process_fetched_block(buffer, hash, peer_index);
        })
    }
};

// startServer();

// module.exports = appNode;
export default {appNode, startServer};
