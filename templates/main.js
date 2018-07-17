var html = require('choo/html')

var signature = require('./signature.js')

const TITLE = 'soursigs drag and drop'

module.exports = view

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)
  return html`
    <body class="container">
      <div class="grass" ondragend=${dragprevent} ondragover=${dragprevent} ondrop=${drop}>
        <p>${state.fileNames.map(function(f) {signature(f, state.Sourmash)})}</p>
      </div>
      <p class='info'>Drag a FASTQ file from your desktop on to the drop zone to see the browser calculate the signature.</p>
      <footer>
        made by <a href="https://twitter.com/luizirber">@luizirber</a> with <a href="https://github.com/yoshuawuyts/choo">choo</a>
      </footer>
    </div>
  `

  function dragprevent () {
    return false
  }

  function drop (ev) {
    ev.preventDefault()
    var files = []
    for (var i = 0; i < ev.dataTransfer.files.length; i++) {
      files[i] = ev.dataTransfer.files[i]
    }
    emit('fileDrop', files, state.Sourmash)
  }
}
