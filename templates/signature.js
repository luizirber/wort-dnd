var html = require('choo/html')
var raw = require('choo/html/raw')

var FASTQStream = require('fastqstream').FASTQStream
var Fasta = require('fasta-parser')

var humanFormat = require('human-format')

var zlib = require('zlib')
var peek = require('peek-stream')
const PassThrough = require('stream').PassThrough

const downloadLogo = require('../assets/download.svg')

function toUrl (data) {
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
  return data.toString().charAt(0) === '>'
}

function isFASTQ (data) {
  return data.toString().charAt(0) === '@'
}

function isGzip (data) {
  return (data[0] === 31) && (data[1] === 139)
}

function GzipParser () {
  return peek(function (data, swap) {
    if (isGzip(data)) return swap(null, new zlib.Unzip())
    else return swap(null, new PassThrough())
  })
}

function FASTParser () {
  return peek(function (data, swap) {
    if (isFASTA(data)) return swap(null, new Fasta())
    if (isFASTQ(data)) return swap(null, new FASTQStream())

    // we do not know - bail
    swap(new Error('No parser available'))
  })
}

module.exports = function (item, Sourmash) {
  var file = item.get('file')

  if (!item.get('done')) {
    var reader = item.get('raw')

    /*
    var loaded = 0

    reader.reader.onprogress = function (data) {
      loaded += data.loaded
      var progress = document.getElementById('uploadprogress')
      progress.max = size
      progress.value = loaded
    }
    */

    var mh = new Sourmash.KmerMinHash(10, 21, false, 42, 0, true)

    var seqparser = new FASTParser()
    var compressedparser = new GzipParser()

    seqparser
      .on('data', function (data) {
        mh.add_sequence_js(data.seq)
      })
      .on('end', function (data) {
        item.set('done', true)
        item.set('sig', mh)
        console.log(item)
      })

    switch (file.type) {
      case 'application/gzip':
        reader.pipe(new zlib.Unzip()).pipe(seqparser)
        break
      default:
        reader.pipe(compressedparser).pipe(seqparser)
        break
    }
  }

  return html`
    <tr>
      <td>${file.name}</td>
      <td><progress id="uploadprogress" max="100" value="0"></progress></td>
      <td>${humanFormat(file.size, {scale: 'binary', unit: 'B'})}</td>

      <td>
        <a href=${toUrl(item)} download=${file.name + '.sig'}>
          <div class='download-icon' alt="Download">${raw(downloadLogo)}</div>
        </a>
      </td>

    </tr>
  `
}
