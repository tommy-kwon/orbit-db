# OrbitDB

[![CircleCI Status](https://circleci.com/gh/haadcode/orbit.svg?style=shield&circle-token=158cdbe02f9dc4ca4cf84d8f54a8b17b4ed881a1)](https://circleci.com/gh/haadcode/orbit-db)

## Introduction

Distributed, peer-to-peer database on IPFS.

This is the Javascript implementation and it works both in **Node.js** and **Browsers**.

- Client-side database to be embedded in Javascript applications
- Stores all data in IPFS
- Aggregation happens on client side and data is eventually consistent
- Designed to work offline first

Check out a visualization of the data flow at https://github.com/haadcode/proto2

Live demo: http://celebdil.benet.ai:8080/ipfs/Qmezm7g8mBpWyuPk6D84CNcfLKJwU6mpXuEN5GJZNkX3XK/

![Screenshot](https://raw.githubusercontent.com/haadcode/proto2/master/screenshot.png)

**NOTE: the README can be out of date, I'm working to get up to date. If you find a problem, please open an issue or a PR.**

_Currently requires [orbit-server](https://github.com/haadcode/orbit-server) for pubsub communication. This will change in the future as soon as IPFS provides pubsub._

## Data stores

Currently available data stores:

- [orbit-db-kvstore](https://github.com/haadcode/orbit-db-kvstore)
- [orbit-db-eventstore](https://github.com/haadcode/orbit-db-eventstore)
- [orbit-db-feedstore](https://github.com/haadcode/orbit-db-feedstore)
- [orbit-db-counterstore](https://github.com/haadcode/orbit-db-counterstore)

Usage:
```javascript
const kvstore = orbit.kvstore('db name')
const events = orbit.eventlog('db name')
const feed = orbit.feed('db name')
const counters = orbit.counter('db name')
```

Documentation for individual stores are WIP, please see each store's source code for available public methods.

## Install
```
npm install orbit-db
```

## Examples

*To run the examples below, make sure to run a local [orbit-server](https://github.com/haadcode/orbit-server)*

### Browser examples
Build the examples:
```bash
npm install
npm run build:examples
```

Then open `examples/browser.html` or `examples/index.html`. See the full example [here](https://github.com/haadcode/orbit-db/blob/master/examples/browser/browser.html).

```html
<html>
  <head>
    <meta charset="utf-8">
  </head>
  <body>
    <script type="text/javascript" src="../dist/orbitdb.min.js" charset="utf-8"></script>
    <script type="text/javascript" src="../node_modules/logplease/dist/logplease.min.js" charset="utf-8"></script>
    <script type="text/javascript" src="../node_modules/ipfs/dist/index.min.js" charset="utf-8"></script>

    <script type="text/javascript">
      const ipfs = window.Ipfs();
      OrbitDB.connect('localhost:3333', 'user1', '', ipfs)
        .then((orbit) => orbit.kvstore('test'))
        .then((db) => db.put('hello', 'world'))
        .then((res) => {
            const result = db.get(key)
            console.log(result)
        })
    </script>
  </body>
</html>
```

### Node.js examples

Before running the examples, install dependencies with:
```
npm install
```

Key-Value store [example](https://github.com/haadcode/orbit-db/blob/master/examples/keyvalue.js):
```
node examples/keyvalue.js <host:port> <username> <channel> <key> <value>
```

Event log [example](https://github.com/haadcode/orbit-db/blob/master/examples/eventlog.js) (run several in separate shells):
```
node examples/eventlog.js <host:port> <username> <channel> <data> <interval in ms>
```

Benchmark writes:
```bash
node examples/benchmark.js <host:port> <username> <channel>;
```

## API
**NOTE: the API documentation is currently out of date. It will be updated soon!**

_See usage example below_

_OrbitDB calls its namespaces channels. A channel is similar to "table", "keyspace", "topic", "feed" or "collection" in other db systems._

    connect(<host:port>, username, password)

    channel(name, password)

        .add(data: String) // Insert an event to a channel, returns <ipfs-hash> of the event

        .iterator([options]) // Returns an iterator of events

            // options : { 
            //   gt: <ipfs-hash>,   // Return events newer than <ipfs-hash>
            //   gte: <ipfs-hash>,  // Return events newer then <ipfs-hash> (inclusive)
            //   lt: <ipfs-hash>,   // Return events older than <ipfs-hash>
            //   lte: <ipfs-hash>,  // Return events older than <ipfs-hash> (inclusive)
            //   limit: -1,         // Number of events to return, -1 returns all, default 1
            //   reverse: true      // Return items oldest first, default latest first
            // }

        .put(key, data: String) // Insert (key,value) to a channel

        .get(key) // Retrieve value

        .del({ key: <key or hash> }) // Remove entry

        .delete() // Deletes the channel, all data will be "removed" (unassociated with the channel, actual data is not deleted from ipfs)

## Usage
```javascript
const async   = require('asyncawait/async');
const ipfsAPI = require('ipfs-api');
const OrbitDB = require('orbit-db');

// local ipfs daemon
const ipfs = ipfsAPI();

async(() => {
    // Connect
    const orbit = await(OrbitClient.connect('localhost:3333', 'usernamne', '', ipfs));

    /* Event Log */
    const eventlog = orbit.eventlog('eventlog test');
    const hash = await(eventlog.add('hello')); // <ipfs-hash>

    // Remove event
    await(eventlog.remove(hash));

    // Iterator options
    const options = { limit: -1 }; // fetch all messages

    // Get events
    const iter = eventlog.iterator(options); // Symbol.iterator
    const next = iter.next(); // { value: <item>, done: false|true}

    // OR:
    // var all = iter.collect(); // returns all elements as an array

    // OR:
    // for(let i of iter)
    //   console.log(i.hash, i.item);

    /* Delete database locally */
    eventlog.delete();

    /* KV Store */
    const kvstore = orbit.kvstore('kv test');
    await(kvstore.put('key1', 'hello world'));
    kvstore.get('key1'); // returns "hello world"
    await(kvstore.del('key1'));
})();
```

### Development

#### Run Tests
```bash
npm test
```

Keep tests running while development:
```bash
mocha -w
```

#### Build distributables
```bash
npm install
npm run build
```
