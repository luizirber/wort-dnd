'use strict'

import choo from "choo";

import './assets/app.css'

const js = import("sourmash/sourmash.js");

const IPFS = require('ipfs')

js.then(Sourmash => {
  var app = choo()

  app.use(function (state, emitter) {
    state.fileNames = []
    state.Sourmash = Sourmash
    state.ready = false

    const options = {
      repo: 'ipfs-' + Math.random(),
      config: {
        Addresses: {
          Swarm: ['/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star']
        }
      }
    }

    var node = new IPFS(options)

    node.once('start', () => {
      node.id()
        .then((id) => {
          state.info = id
          emitter.emit("IPFSReady")
          //updateView('ready', node)
          //onSuccess('Node is ready.')
          //setInterval(refreshPeerList, 1000)
          //setInterval(sendFileList, 10000)
        })
        .catch((error) => alert(error))
    })

    state.node = node
    state.Buffer = node.types.Buffer

    emitter.on('fileDrop', function (data) {
      Array.prototype.push.apply(state.fileNames, data);
      emitter.emit('render')
    })

    emitter.on('IPFSReady', function () {
      state.ready = true
      emitter.emit('render')
    })
  })

  app.route('/', require('./templates/main'))
  app.route('/*', require('./templates/404'))

  if (!module.parent) app.mount('body')
  else module.exports = app
});
