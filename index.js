import choo from "choo";

import './assets/style.css'

const js = import("sourmash/sourmash.js");
js.then(Sourmash => {
  console.log(Sourmash);
  var mh = new Sourmash.KmerMinHash(0, 21, false, 42, 1000, true);
  console.log(mh);

  var app = choo()

  app.use(function (state, emitter) {
    state.fileNames = []
    state.Sourmash = Sourmash
    emitter.on('fileDrop', function (data) {
      state.fileNames = data
      emitter.emit('render')
    })
  })

  app.route('/', require('./templates/main'))
  app.route('/*', require('./templates/404'))

  if (!module.parent) app.mount('body')
  else module.exports = app

});
