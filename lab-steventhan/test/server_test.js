'use strict';

const net = require('net');
const expect = require('chai').expect;
const server = require('../_server');
const port = 5000;

describe('the tcp chat server', () => {
  before((done) =>{
    server.listen(port, done);
  });

  after(() => {
    server.close();
  });

  it('should communicate between 2 clients', (done) => {
    let client1 = net.connect({port});
    let client2 = net.connect({port});

    client1.write('message from client 1');

    client2.on('data', (data) => {
      expect(data.toString().split('\n')[2].split(' ').slice(1).join(' ')).to.eql('message from client 1');
      client1.end();
    });

    client1.on('close', function() {
      client2.end();
      done();
    });
  });

  it('should notify nickname change', (done) => {
    let client1 = net.connect({port});
    let client2 = net.connect({port});
    client1.write('\\nick Steven\n');

    client2.on('data', (data) => {
      if(data.toString().substring(0, 30) !== 'You have entered the chat room') {
        expect(data.toString().slice(35)).to.eql('Steven\n');
      }
      client1.end();
    });

    client1.on('close', function() {
      client2.end();
      done();
    });
  });
});
