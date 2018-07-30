var html = require('choo/html')

var {FASTQStream, FASTQValidator} = require('fastqstream')

var humanFormat = require("human-format")

var FileReadStream = require('filestream/read')
//var FileReadStream = require('filereader-stream')

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

  var fqstream = new FASTQStream()
  var validate = new FASTQValidator()

  validate.on('data', function (data) {
    mh.add_sequence_js(data.seq)
  })
  .on('end', function (data) {
    item.set('done', true)
    item.set('sig', mh)
  })

  reader.pipe(fqstream).pipe(validate)

  return html`
    <tr>
      <td>${file.name}</td>
      <td><progress id="uploadprogress" max="100" value="0"></progress></td>
      <td>${humanFormat(size, {scale: 'binary', unit: 'B'})}</td>

      <td>
        <a href=${to_url(item)} download=${file.name + ".sig"}>
          <img width=20 class="table-action" src="assets/download.svg" alt="Download" />
        </a>
      </td>

    </tr>
  `
  }
