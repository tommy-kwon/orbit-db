'use strict';

const async   = require('asyncawait/async');
const await   = require('asyncawait/await');
const ipfsd   = require('ipfsd-ctl');
const OrbitDB = require('../src/OrbitDB');
const Timer   = require('./Timer');

// usage: reader.js <network hash> <username> <channel> <data> <interval in ms>

// orbit-server
const network = 'QmYPobvobKsyoCKTw476yTui611XABf927KxUPCf4gRLRr'; // 'localhost:3333'
const username = process.argv[2] ? process.argv[2] : 'testrunner';
const password = '';
const channelName = process.argv[3] ? process.argv[3] : 'c2';
const prefix = process.argv[4] ? process.argv[4] : 'Hello';

const startIpfs = () => {
  return new Promise((resolve, reject) => {
    ipfsd.disposableApi((err, ipfs) => {
      if(err) console.error(err);
      resolve(ipfs);
    });
  });
};

let run = (async(() => {
  try {
    const ipfs = await(startIpfs());
    const orbit = await(OrbitDB.connect(network, username, password, ipfs));
    const db = await(orbit.eventlog(channelName));

    let count = 1;
    let running = false;

    setInterval(async(() => {
      if(!running) {
        running = true;

        let timer = new Timer(true);
        await(db.add(prefix + count));
        console.log(`Query #${count} took ${timer.stop(true)} ms\n`);

        let timer2 = new Timer(true);
        let items = db.iterator({ limit: -1 }).collect();
        console.log("----------------------------------------------------------------------------------------")
        console.log("Hash                                           | Timestamp     | Value")
        console.log("----------------------------------------------------------------------------------------")
        console.log(items.map((e) => `${e.hash} | ${e.meta.ts} | ${e.value}`).join("\n"));
        console.log("----------------------------------------------------------------------------------------")
        console.log(`Query 2 #${count} took ${timer2.stop(true)} ms\n`);

        running = false;
        count ++;
      }
    }), process.argv[6] ? process.argv[6] : 1000);

  } catch(e) {
    console.error(e.stack);
    console.log("Exiting...")
    process.exit(1);
  }
}))();

module.exports = run;
