const js = import("sourmash/sourmash.js");
js.then(js => {
  console.log(js);
  mh = new js.KmerMinHash(0, 21, false, 42, 1000, true);
  console.log(mh);
});
