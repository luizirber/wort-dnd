var html = require('choo/html')
var raw = require('choo/html/raw')

// var FileReadStream = require('filereader-stream')
var FileReadStream = require('filestream/read')

var signature = require('./signature.js')

const uploadLogo = require('../assets/upload.svg')

const TITLE = 'wort drag and drop'

module.exports = view

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)
  return html`
    <body ondragover="event.preventDefault()">
      <header>
        <h1>sourmash + IPFS</h1>
      </header>
      <main>
      <div class="box node">
        <h2>Node</h2>

        <div>
          <h3>ID</h3>
          <pre class="node-id">${nodeId()}</pre>
        </div>

        <div>
          <h3>Addresses</h3>
          <ul class="node-addresses">${nodeAddresses()}</ul>
        </div>

      </div>

      <div class="columns">
        <div id="peers" class="box">
          <h2>Peers</h2>

          <div class="input-button">
            <input id="multiaddr-input" type="text" placeholder="Multiaddr"/>
            <button id="peer-btn">Connect</button>
          </div>

          <table>
            <thead>
              <tr>
                <th>Connected Peers</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>

        <div id="files" class="box" ondragover="event.preventDefault()">
          <p class='info'>Drag a FASTQ file from your desktop on to the drop zone to see the browser calculate the signature.</p>

          <h2>Files</h2>

          <div class="input-button">
            <input id="multihash-input" type="text" placeholder="Multihash" />
            <button id="fetch-btn" type="button" onclick=${getFile}>Fetch</button>
          </div>

          <div id="drag-container" 
               ondragenter=${onDragEnter}
               ondragover=${onDragEnter}
               ondragleave=${onDragLeave}
               ondragend=${onDragLeave}
               ondrop=${onDrop}>
            <div id='upload-icon' alt="Upload">${raw(uploadLogo)}</div>
            <p><b>Drag & drop</b> a file to upload it.</p>
          </div>
          
          <table id="file-history">
            <thead>
              <tr>
                <th>Name</th>
                <th>Progress</th>
                <th>Size</th>
              </tr>
            </thead>
            <tbody>
              ${renderFiles(state)}
            </tbody>
          </table>

        </div>
      </div>
      </main>
      <footer>
        made by <a href="https://twitter.com/luizirber">@luizirber</a> with <a href="https://github.com/yoshuawuyts/choo">choo</a>
      </footer>
    </body>
  `

  function renderFiles (state) {
    if (state.fileNames.length === 0) {
      return html`
        <tr class="empty-row">
          <td colspan="4">No signatures yet.</td>
        </tr>
      `
    } else {
      return state.fileNames.map(function (f) {
        return signature(f, state.Sourmash)
      })
    }
  }

  function onDragEnter () {
    const dragContainer = document.querySelector('#drag-container')
    dragContainer.classList.add('dragging')
    return false
  }

  function onDragLeave () {
    const dragContainer = document.querySelector('#drag-container')
    dragContainer.classList.remove('dragging')
    return false
  }

  function onDrop (ev) {
    onDragLeave()
    ev.preventDefault()
    var files = []
    for (var i = 0; i < ev.dataTransfer.files.length; i++) {
      files[i] = new Map([
        ['raw', new FileReadStream(ev.dataTransfer.files[i])],
        ['file', ev.dataTransfer.files[i]],
        ['done', false],
        ['sig', null]
      ])
    }
    emit('fileDrop', files)
  }

  function getFile () {
    const $multihashInput = document.querySelector('#multihash-input')
    const hash = $multihashInput.value

    $multihashInput.value = ''

    if (!hash) {
      emit('error', 'No multihash was inserted.')
    }

    state.node.files.getReadableStream(hash)
      .on('data', (file) => {
        if (file.type !== 'dir') {
          emit('fileDrop', [new Map([
            ['raw', file.content],
            ['file', file],
            ['done', false],
            ['sig', null]
          ])])
        }
      })
      .on('error', () => emit('error', 'An error occurred when fetching the files.'))
  }

  function nodeId () {
    if (state.ready) {
      return state.info.id
    }
    return ''
  }

  function nodeAddresses () {
    if (state.ready) {
      return state.info.addresses.map((address) => {
        return html`<li><pre>${address}</pre></li>`
      })
    }
    return ''
  }
}
