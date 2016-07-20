'use strict';

const net = require('net');
var ClientPool = require('./lib/clientpool');

let clientpool = new ClientPool;
clientpool.ee.on('register', (thisClient) => {
  thisClient.nickName = thisClient.id;
  clientpool.pool[thisClient.id] = thisClient;
  clientpool.ee.emit('registered');
  console.log(`${thisClient.id} connected`);
});

clientpool.ee.on('broadcast', (data, currentSocket, currentClient) => {
  for (var clientId in clientpool.pool) {
    if (clientpool.pool[clientId].socket !== currentSocket) clientpool.pool[clientId].socket.write(`${clientpool.pool[currentClient.id].nickName}: ${data}`);
  }
});

clientpool.ee.on('nicknameChanged', (currentSocket, oldNickname, newNickname) => {
  for (var clientId in clientpool.pool) {
    if (clientpool.pool[clientId].socket !== currentSocket) clientpool.pool[clientId].socket.write(`${oldNickname} new nick name is ${newNickname}\n`);
  }
});

let server = net.createServer((socket) => {
  let thisClient = {
    id: 'user_' + Math.floor(Math.random() * 1000000000000),
    socket: socket
  };

  while (clientpool.pool.hasOwnProperty(thisClient.id)) {
    thisClient.id = 'user_' + Math.floor(Math.random() * 1000000000000);
  }

  clientpool.ee.emit('register', thisClient);
  socket.write(`You have entered the chat room.\nYour temporary nick name is ${clientpool.pool[thisClient.id].nickName}\n`);
  socket.pipe(process.stdout);

  socket.on('data', (data) => {
    if (data.toString() === 'EXIT\r\n') socket.end();
    if (data.toString().substring(0, 5) === '\\nick') {
      let oldNickname = thisClient.nickName;
      let newNickname = data.toString().replace(/(\r\n|\n|\r)/gm,'').split(' ')[1];
      clientpool.pool[thisClient.id].nickName = newNickname;
      clientpool.ee.emit('nicknameChanged', socket, oldNickname, newNickname);
    } else {
      clientpool.ee.emit('broadcast', data, socket, thisClient);
    }
  });

  socket.on('end', function() {
    console.log(thisClient.id, 'disconnected');
    delete clientpool.pool[thisClient.id];
  });
});

module.exports = exports = server;
