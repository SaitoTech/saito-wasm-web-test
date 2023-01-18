const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

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

// @ts-ignore
global.shared_methods = {
    send_message: (peer_index: bigint, buffer: Uint8Array) => {

    },
    send_message_to_all: (buffer: Uint8Array, exceptions: Array<bigint>) => {
    },
    connect_to_peer: (url: string) => {
        console.log("---------------- connect to peer-------------");
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
    }
};

module.exports = appNode;
