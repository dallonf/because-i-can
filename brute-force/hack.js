var charm = require('charm')();
charm.pipe(process.stdout);

var CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var TARGETS = ['ZZZZ', 'HACK', 'DOGE', 'CORE', 'GAME', 'AAAA', 'PASS', 'WORD', 'BANK', 'JOKE', 'IRON', 'STAR', 'FISH', 'CODE', 'JOHN'];
var GUESSES_PER_SECOND = 10000;

var target;
var current = [0,0,0,0];
var lastIndex = current.length - 1;
var lastTime = 0;

function next() {
  var currentTime = new Date().getTime();
  if (lastTime === 0) { // first iteration, just guess once
    guess();
  } else {
    var secondsElapsed = (currentTime - lastTime)/1000;
    var guesses = Math.floor(GUESSES_PER_SECOND*secondsElapsed);
    if (guesses <= 0) {
      currentTime = lastTime; // skip this frame if there's nothing to do
    } else {
      for (var i = 0; i < guesses; i++) {
        guess();
      }
    }
  }
  
  lastTime = currentTime;
  setImmediate(next);
}

function guess() {
  var currentGuess = '';

  for (var i = 0; i < current.length; i++) {
    currentGuess += CHARS[current[i]];
  }

  charm.up(1);
  console.log("> " + currentGuess);

  if (currentGuess === target) {
    console.log("ACCESS GRANTED");
    process.exit();
    return;
  }

  var incIndex = lastIndex;
  while(incIndex >= 0) {
    current[incIndex] += 1;
    if (current[incIndex] >= CHARS.length) {
      current[incIndex] = 0;
      incIndex -= 1;
    } else {
      break;
    }
  }

  if (incIndex < 0) {
    console.log("ACCESS DENIED");
    process.exit();
    return;
  }
}

target = TARGETS[Math.floor(Math.random() * TARGETS.length)];

console.log("ENTER PASSWORD: ");
console.log("> ");
next();