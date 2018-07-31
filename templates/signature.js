var html = require('choo/html')
var raw = require('choo/html/raw')

var {FASTQStream, FASTQValidator} = require('fastqstream')
var fasta = require('fasta-parser')

var humanFormat = require("human-format")

var zlib = require('zlib')
var peek = require('peek-stream')
var FileReadStream = require('filestream/read')
//var FileReadStream = require('filereader-stream')

const download_logo = require('../assets/download.svg')

function to_url (data) {
  if (data != null) {
    const sig = data.get('sig')
    if (sig != null) {
      const jsonData = sig.to_json()
      const file = new window.Blob([jsonData], { type: 'application/octet-binary' })
      const url = window.URL.createObjectURL(file)
      return url
    }
  }
  return ''
}

function isFASTA (data) {
  return data.toString().charAt(0) == '>'
}

function isFASTQ (data) {
  return data.toString().charAt(0) == '@'
}

function FASTParser() {
  return peek(function(data, swap) {
    if (isFASTA(data)) return swap(null, new fasta())
    if (isFASTQ(data)) return swap(null, new FASTQStream())

    // we do not know - bail
    swap(new Error('No parser available'))
  })
}

module.exports = function (item, Sourmash) {
  var file = item.get('raw')

  var reader = FileReadStream(file)
  var loaded = 0
  var size = file.size

  reader.reader.onprogress = function (data) {
      loaded += data.loaded
      var progress = document.getElementById('uploadprogress')
      progress.max = size
      progress.value = loaded
  }

  var mh = new Sourmash.KmerMinHash(10, 21, false, 42, 0, true)

  var seqparser = FASTParser()

  seqparser.on('data', function (data) {
    mh.add_sequence_js(data.seq)
  })
  .on('end', function (data) {
    item.set('done', true)
    item.set('sig', mh)
  })

  switch (file.type) {
    case 'application/gzip':
      reader.pipe(new zlib.Unzip()).pipe(seqparser)
      break
    default:
      reader.pipe(seqparser)
      break
  }

  return html`
    <tr>
      <td>${file.name}</td>
      <td><progress id="uploadprogress" max="100" value="0"></progress></td>
      <td>${humanFormat(size, {scale: 'binary', unit: 'B'})}</td>

      <td>
        <a href=${to_url(item)} download=${file.name + ".sig"}>
          <div class='download-icon' alt="Download">${raw(download_logo)}</div>
        </a>
      </td>

    </tr>
  `
  }
