var html = require('choo/html')

var {FASTQStream, FASTQValidator} = require('fastqstream')

var FileReadStream = require('filestream/read')
// var FileReadStream = require('filereader-stream')

module.exports = function (file, Sourmash) {
  var reader = FileReadStream(file)
  var mh = new Sourmash.KmerMinHash(10, 21, false, 42, 0, true)

  reader.pipe(new FASTQStream())
        .pipe(new FASTQValidator())
        .on('data', function (data) {
          var progress = document.getElementById('uploadprogress')
          mh.add_sequence_js(data.seq)
          //progress.value += 1
        })
        .on('end', function (data) {
          var progress = document.getElementById('uploadprogress')
          //progress.value = 100
          var output = document.getElementById('output')
          console.log(mh.to_json())
          //output.innerHTML = JSON.stringify(mh.mins, null, 4)
        })

  return html`
    <div>
      <p id='output'>Upload progress: <progress id="uploadprogress" max="100" value="0">0</progress></p>
    </div>
  `
  }
