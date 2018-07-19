var html = require('choo/html')

var {FASTQStream, FASTQValidator} = require('fastqstream')

var FileReadStream = require('filestream/read')
//var FileReadStream = require('filereader-stream')

module.exports = function (file, Sourmash) {
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
  var current_progress = 0

  var fqstream = new FASTQStream()
  var validate = new FASTQValidator()

  validate.on('data', function (data) {
    mh.add_sequence_js(data.seq)
  })
  .on('end', function (data) {
    var output = document.getElementById('output')
    output.innerHTML = mh.to_json()
  })

  reader.pipe(fqstream).pipe(validate)

  return html`
    <div>
      <p id='output'>Upload progress: <progress id="uploadprogress" max="100" value="0">0</progress></p>
    </div>
  `
  }
