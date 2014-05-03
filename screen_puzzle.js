var _ = require('underscore');

var RESET = "000100";

var START = "000100";
var FINISH = "??1?0?";
var FINISH_ON = 0;

var unvisited = {};
var visited = {};
var currentNode;
var currentMeta;

function findNeighbors(node) {
  var neighbors = {};

  // Turn off any screens that are on
  for (var i = 0; i < node.length; i++) {
    if (node[i] === "1") {
      neighbors["Turn off " + (i + 2)] = toggleIndex(i, node);
    }
  }

  // Rules for turning on screens
  if (!screen(2, node) && screen(4, node) && screen(5, node) && !screen(3, node) && !screen(6, node)) {
    neighbors["Turn on 2"] = toggle(2, node);
  }

  if (!screen(3, node) && screen(5, node) && screen(6, node)) {
    neighbors["Turn on 3"] = toggle(3, node);
  }

  if (!screen(4, node) && screen(3, node) && !screen(5, node) && !screen(6, node)) {
    neighbors["Turn on 4"] = toggle(4, node);
  }

  if (!screen(5, node) && screen(4, node) && !screen(2, node) && !screen(6, node)) {
    neighbors["Turn on 5"] = toggle(5, node);
  }

  if (!screen(6, node) && screen(5, node) && !screen(4, node)) {
    neighbors["Turn on 6"] = toggle(6, node);
  }

  if (!screen(7, node) && screen(2, node) && screen(3, node) && screen(4, node) && !screen(5, node) && !screen(6, node)) {
    neighbors["Turn on 7"] = toggle(7, node);
  }

  // And an error condition
  neighbors["Cause an error"] = RESET;

  _(neighbors).each(discover);

  return neighbors;
}

function toggle(number, node) {
  return toggleIndex(number - 2, node);
}

function toggleIndex(index, node) {
  var newNode = "";
  newNode += node.slice(0, index);
  newNode += node[index] === "1" ? "0" : "1";
  newNode += node.slice(index + 1);
  return newNode;
}

function screen(number, node) {
  return node[number - 2] === "1";
}

function discover(node) {
  if (!unvisited[node] && !visited[node] && currentNode !== node) {
    // console.log("discovered " + node);
    unvisited[node] = {
      tentativeDistance: 1000000
    }
  }
}

function examine(node, meta) {
  if (!meta.neighbors) {
    meta.neighbors = findNeighbors(node);
  }

  _(meta.neighbors).each(function(nNode, nStep) {
    if (unvisited[nNode]) {
      var nMeta = unvisited[nNode];
      var distance = meta.tentativeDistance + 1;
      if (distance < nMeta.tentativeDistance) {
        nMeta.tentativeDistance = distance;
        nMeta.from = node;
      }
    }
  });

  visited[node] = meta;
  delete unvisited[node];
}

function step() {

  if (currentNode === null) {
    error();
    return;
  }
  examine(currentNode, currentMeta);

  // Find the unvisited node with the lowest distance
  currentNode = null;
  currentMeta = null;
  var lowestDistance = Number.MAX_VALUE;
  _(unvisited).each(function(uMeta, uNode) {
    if (uMeta.tentativeDistance < lowestDistance) {
      lowestDistance = uMeta.tentativeDistance;
      currentNode = uNode;
      currentMeta = uMeta;
    }
  });  

  var finisher;
  _(visited).each(function(vMeta, vNode) {
    var isFinish = true;
    var count = 0;
    for (var i = 0; i < FINISH.length; i++) {
      if (vNode[i] === "1") count++;
      if (FINISH[i] !== "?" && FINISH[i] !== vNode[i]) {
        isFinish = false;
        break;
      }
    }
    if (isFinish && count >= FINISH_ON) {
      finisher = vNode; 
    } 
  });
  
  // If the destination has been visited, stop the algorithm
  if (!finisher) {
    // Allow the computer to breathe
    setImmediate(step);
  } else {
    finish(finisher);
  }
}

function finish(finisher) {
  console.log("Finished. Calculating path...");
  console.log(Object.keys(visited).length + " nodes visited");

  
  var steps = [];
  var currentNode = finisher;
  var currentMeta = visited[finisher];

  console.log("Starting with " + START);
  
  if (!currentMeta.from) {
    console.log("Error - can't route to starting node");
  }

  while(currentMeta.from) {
    var adjacentNode = currentMeta.from;
    var adjacentNodeMeta = visited[adjacentNode];

    _(adjacentNodeMeta.neighbors).each(function(node, instruction) {
      if (node === currentNode) {
        steps.push(instruction + " - " + currentNode);
      }
    });

    currentNode = adjacentNode;
    currentMeta = adjacentNodeMeta;
    adjacentNode = currentMeta.from;
    adjacentNodeMeta = visited[adjacentNode];
  }

  steps.reverse();

  steps.forEach(function(step) {
    console.log(step);
  });  
}

function error() {
  console.log("Error! No path to destination. " + Object.keys(unvisited).length + " nodes unvisited; " +
    Object.keys(visited).length + " nodes visited.");
}

discover(START);
currentNode = START;
currentMeta = unvisited[START];
delete unvisited[START];
currentMeta.tentativeDistance = 0;

function recursiveDiscover(last) {
  last = last || "";
  
  var fork1 = last + "1";
  if (fork1.length === 6) {
    discover(fork1);
  } else {
    recursiveDiscover(fork1);
  }

  var fork2 = last + "0";
  if (fork2.length === 6) {
    discover(fork2);
  } else {
    recursiveDiscover(fork2);
  }
}

recursiveDiscover();

step();

// _(findNeighbors(START)).each(function(v, k) {
//   console.log(k + ": " + v);
// });
