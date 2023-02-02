import {parse} from "url";

import SharedMethods from 'saito-js/shared_methods';
import Saito, {initialize as initSaito} from 'saito-js/index.node';
import {WebSocket, WebSocketServer} from 'ws';
// import Saito from './saito';

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const fetch = require("node-fetch");
const fs = require("fs");
const process = require("process");
const cors = require("cors");

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const blockRouter = require("./routes/block.js");

// const Saito = require("./saito").default;


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
        let index = Saito.getInstance().addNewSocket(socket);
        socket.on("message", (buffer: any) => {
            Saito.getLibInstance().process_msg_buffer_from_peer(buffer, index);
        });
        socket.on("close", () => {
            Saito.getLibInstance().process_peer_disconnection(index);
        });
        Saito.getLibInstance().process_new_peer(index, null);
    });

}

class NodeSharedMethods implements SharedMethods {
    sendMessage(peerIndex: bigint, buffer: Uint8Array): void {
        let socket = Saito.getInstance().getSocket(peerIndex);
        socket.send(buffer);
    }

    sendMessageToAll(buffer: Uint8Array, exceptions: bigint[]): void {
        Saito.getInstance().sockets.forEach((socket, key) => {
            if (exceptions.includes(key)) {
                return;
            }
            socket.send(buffer);
        });
    }

    connectToPeer(peerData: any): void {
        let protocol = "ws";
        if (peerData.protocol === "https") {
            protocol = "wss";
        }
        let url = protocol + "://" + peerData.host + ":" + peerData.port + "/wsopen";

        try {
            console.log("connecting to " + url + "....");
            let socket = new WebSocket(url);
            let index = Saito.getInstance().addNewSocket(socket);

            socket.on("message", (buffer: any) => {
                Saito.getLibInstance().process_msg_buffer_from_peer(buffer, index);
            });
            socket.on("close", () => {
                Saito.getLibInstance().process_peer_disconnection(index);
            });
            Saito.getLibInstance().process_new_peer(index, peerData);
            console.log("connected to : " + url + " with peer index : " + index);
        } catch (e) {
            console.error(e);
        }
    }

    writeValue(key: string, value: Uint8Array): void {
        try {
            fs.writeFileSync(key, value);
        } catch (error) {
            console.error(error);
        }
    }

    readValue(key: string): Uint8Array | null {
        try {
            return fs.readFileSync(key);
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    loadBlockFileList(): string[] {
        try {
            let files = fs.readdirSync("data/blocks/");
            files = files.filter((file: string) => file.endsWith(".sai"));
            return files;

        } catch (e) {
            console.log("cwd : ", process.cwd())
            console.error(e);
            return [];
        }
    }

    isExistingFile(key: string): boolean {
        try {
            let result = fs.statSync(key);
            return !!result;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    removeValue(key: string): void {
        try {
            fs.rmSync(key);
        } catch (e) {
            console.error(e);
        }
    }

    disconnectFromPeer(peerIndex: bigint): void {
        Saito.getInstance().removeSocket(peerIndex);
    }

    fetchBlockFromPeer(url: string): Promise<Uint8Array> {
        return fetch(url)
            .then((res: any) => {
                return res.arrayBuffer();
            })
            .then((buffer: ArrayBuffer) => {
                return new Uint8Array(buffer);
            });
    }

}

initSaito(configs, new NodeSharedMethods())
    .then(() => {
        console.log("zzzzzzzzzzzzzzz");
    });


// module.exports = appNode;
export default {appNode, startServer};
