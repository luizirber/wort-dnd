var html = require('choo/html')

var {FASTQStream, FASTQValidator} = require('fastqstream')

var FileReadStream = require('filestream/read')
// var FileReadStream = require('filereader-stream')

module.exports = function (file, Sourmash) {
  console.log("Reached sig calc")
  var reader = FileReadStream(file)
  var sig = new Sourmash.minhash.MinHash(21, 10)

  reader.pipe(new FASTQStream())
        .pipe(new FASTQValidator())
        .on('data', function (data) {
          var progress = document.getElementById('uploadprogress')
          sig.addSequence(data.seq)
          progress.value += 1
        })
        .on('end', function (data) {
          var progress = document.getElementById('uploadprogress')
          progress.value = 100
          var output = document.getElementById('output')
          output.innerHTML = JSON.stringify(sig.mins, null, 4)
        })

  return html`
    <div>
      <p id='output'>Upload progress: <progress id="uploadprogress" max="100" value="0">0</progress></p>
    </div>
  `
  }
