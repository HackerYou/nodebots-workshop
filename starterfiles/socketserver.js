'use strict'

const socket = require('socket.io');
const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);

const io = socket(server);

io.on('connection', function(socket) {
	socket.emit('test',{message: 'HI'});

});

io.listen('4555');
