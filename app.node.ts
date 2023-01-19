const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const ws = require("ws");
const fetch = require("node-fetch");

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

import Saito from './saito';
// const Saito = require("./saito").default;

const appNode = express();

appNode.use(logger('dev'));
appNode.use(express.json());
appNode.use(express.urlencoded({extended: false}));
appNode.use(cookieParser());
appNode.use(express.static(path.join(__dirname, 'public')));

appNode.use('/', indexRouter);
appNode.use('/users', usersRouter);


let saito = new Saito();

saito.initialize().then(() => {

});

function startServer() {
    const server = new ws.Server({
        noServer: true,
        path: "/wsopen"
    });

    appNode.on("upgrade", (request: any, socket: any, head: any) => {
        server.handleUpgrade(request, socket, head, (websocket: any) => {
            server.emit("connection", websocket, request);
        });
    });
    server.on("connection", (wsocket: any, request: any) => {
        let index = saito.addNewSocket(wsocket);
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
            let socket = new ws.WebSocket(url);
            let index = saito.addNewSocket(socket);

            socket.on("message", (buffer: any) => {
                saito.getInstance().process_msg_buffer_from_peer(buffer, index);
            });

            saito.getInstance().process_new_peer(index, peer_data);
            console.log("connected to : " + url + " with peer index : " + index);
        } catch (e) {
            console.error(e);
        }
    },
    write_value: (key: string, value: Uint8Array) => {
    },
    read_value: (key: string) => {
    },
    load_block_file_list: () => {
        return [];
    },
    is_existing_file: (key: string) => {
    },
    remove_value: (key: string) => {
    },
    disconnect_from_peer: (peer_index: bigint) => {
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

startServer();

module.exports = appNode;
