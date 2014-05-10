require('sugar');
var fs = require('fs');

var options = {
  file: 'words.txt',
  markov: true
};

if (process.argv.count('--nomarkov')) {
  console.log("Disabling markov chains...");
  options.markov = false;
}

var sample = fs.readFileSync(options.file, 'utf-8');
var words = sample.toLowerCase().replace(/[^a-z ]/g, '').words();

var wordLengths = {};
var letterFrequencies = {};
var totalLetterFrequencies = {};
words.each(function(w) {
  count(wordLengths, w.length);

  var lastLetter = ' ';
  w.chars(function(c) {
    letterFrequencies[lastLetter] = letterFrequencies[lastLetter] || {};
    count(letterFrequencies[lastLetter], c);
    count(totalLetterFrequencies, c);

    lastLetter = c;
  });
});

var output = '';
for (var i = 0; i < 30; i++) {
  var word = '';
  var length = selectFromCount(wordLengths).toNumber();
  var lastLetter = ' ';
  length.times(function() {
    var letter;
    if (options.markov) {
      letter = selectFromCount(letterFrequencies[lastLetter]);
    }
    if (!letter) {
      letter = selectFromCount(totalLetterFrequencies) || '*';
    }
    word += letter;
    lastLetter = letter;
  });

  output += word + ' ';
}

console.log(output);

function count(map, val) {
  if (typeof map[val] === 'undefined') {
    map[val] = 1;
  } else {
    map[val] = map[val] + 1;
  }
}

function selectFromCount(map) {
  map = Object.extended(map);
  var total = map.values().sum();
  var current = 0;
  var rand = Number.random(total);
  return map.keys().find(function(key) {
    var val = map[key];
    if (rand <= val + current) {
      return true;
    }

    current += val;
  });
}