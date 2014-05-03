var _ = require('underscore'),
    prompt = require ('prompt'),
    repl = require('repl');

// Node key format:
// 0: turn
// 1 2 3
// 4 5 6
// 7 8 9

var START = "X---------"; // X's turn, all spaces blank

var nodes = {},
    visited = {},
    unvisited = [],    
    xWins = [],
    oWins = [],
    ties = [],
    currentNode;

function removeFromArray(array, item) {
  var index = array.indexOf(item);
  array.splice(index, 1);
  return array;
}

function opposite(a) {
  if (a === "X") return "O";
  if (a === "O") return "X";
  return "-";
}

function isBlank(a) {
  return a === "-";
}

function getVictory(node) {
  if (isVictory(node, "X")) return "X";
  if (isVictory(node, "O")) return "O";
  return "-";
}

function isVictory(node, player) {
  // diagonal positive
  if (node[7] === player && node[5] === player && node[3] === player) {
    return true;
  }

  // diagonal negative
  if (node[1] === player && node[5] === player && node[9] === player) {
    return true;
  }

  // horizontal
  for (var i = 1; i <= 9; i+=3) {
    if (node[i] === player && node[i + 1] === player && node[i + 2] === player) {
      return true;
    }
  }

  // vertical
  for (i = 1; i <= 3; i++) {
    if (node[i] === player && node[i + 3] === player && node[i + 6] === player) {
      return true;
    }
  }

  return false;
}

function createNode(code) {
  var node = {
    code: code,
    parents: [],
    neighbors: [],
    distanceFromEnd: 10000000
  }
  nodes[code] = node;
  unvisited.push(code);
  return node;
}

function discoverNeighbors(node) {
  // Can't continue to play after winning
  var victory = getVictory(node);
  if (node.indexOf('-') === -1) {
    ties.push(node);
    nodes[node].ties = 1;
    nodes[node].distanceFromEnd = 1;
  } else if (isBlank(victory)) {

    var grid = node.slice(1);
    var turn = node[0];
    var nextTurn = opposite(turn);

    for (var i = 0; i < grid.length; i++) {
      if (grid[i] === "-") {
        var neighbor = nextTurn + grid.slice(0, i) + turn + grid.slice(i + 1);
        nodes[node].neighbors.push(neighbor);
        if (!nodes[neighbor]) {
          createNode(neighbor);
        }

        if (nodes[neighbor].parents.indexOf(node) === -1) nodes[neighbor].parents.push(node);  
      }
    }

  } else if (victory === "X") {
    xWins.push(node);
    nodes[node].xWins = 1;
    nodes[node].distanceFromEnd = 1;
  } else if (victory === "O") {
    oWins.push(node);
    nodes[node].oWins = 1;
    nodes[node].distanceFromEnd = 1;
  }
}

function renderCell(node, index) {
  if (node[index] === "-") {
    return "[" + index + "]";
  } else {
    return " " + node[index] + " ";
  }
}

function renderNode (node) {
  // console.log(node[0] + "'s turn: ");

  console.log(" " + renderCell(node, 1) + " " + renderCell(node, 2) + " " + renderCell(node, 3) + " ");
  console.log(" " + renderCell(node, 4) + " " + renderCell(node, 5) + " " + renderCell(node, 6) + " ");
  console.log(" " + renderCell(node, 7) + " " + renderCell(node, 8) + " " + renderCell(node, 9) + " ");
}

function discoverStep() {
  var current = unvisited.shift();
  if (current) {
    discoverNeighbors(current);
    setImmediate(discoverStep);
  } else {
    console.log("Discovered all " + Object.keys(nodes).length + " nodes.");
    startOutcomeAnalysis();
  }
}

function outcomeAnalysisStep() {
  unvisited.sort(function(a, b) {
    return nodes[a].distanceFromEnd - nodes[b].distanceFromEnd;
  });
  var current = unvisited.shift();
  if (current) {
    visited[current] = true;
    var nodeMeta = nodes[current];
    if (!nodeMeta.xWins) nodeMeta.xWins = 0;
    if (!nodeMeta.oWins) nodeMeta.oWins = 0;
    if (!nodeMeta.ties) nodeMeta.ties = 0
    if (!nodeMeta.traps) nodeMeta.traps = 0;
    if (!nodeMeta.likelyOWins) nodeMeta.likelyOWins = 0;
    

    var dist = nodeMeta.distanceFromEnd + 1;
    var isXVictory = isVictory(current, "X");
    var isOVictory = isVictory(current, "O");
    if (isOVictory) {
      nodeMeta.likelyOWins = 1;
    }

    if (nodeMeta.xWins === 0 && nodeMeta.ties === 0 & nodeMeta.oWins > 1) {
      nodeMeta.traps += 1; // Ackbar conditional
    }

    nodes[current].parents.forEach(function(p) {

      if (isXVictory) {
        // Put a special flag on all the nodes that lead directly to an X victory
        nodes[p].warning = true;
      }

      if (nodes[p].distanceFromEnd > dist) nodes[p].distanceFromEnd = dist;
      nodes[p].xWins = (nodes[p].xWins || 0) + nodes[current].xWins;
      nodes[p].oWins = (nodes[p].oWins || 0) + nodes[current].oWins;
      nodes[p].ties = (nodes[p].ties || 0) + nodes[current].ties;
      nodes[p].traps = (nodes[p].traps || 0) + nodes[current].traps;

      if (isOVictory) {
        // A player's strategy is typically to choose a random cell unless it would directly lead
        // to an O victory
        // But that's really not important so I monkey-patched it back to old behavior
        nodes[p].playerWarning = true;
        nodes[p].likelyOWins = 0;
      }
      nodes[p].likelyOWins = (nodes[p].likelyOWins || 0) + nodes[current].likelyOWins;

      if (unvisited.indexOf(p) === -1) unvisited.push(p);
    });
    setImmediate(outcomeAnalysisStep);
  } else {
    console.log("Finished analysis. Shall we play a game?");
    startGame();
  }
}

function startDiscover() {
  createNode(START);
  unvisited.push(START);
  discoverStep();
}


function startOutcomeAnalysis() {
  unvisited = ties.concat(xWins, oWins);
  outcomeAnalysisStep();
}

function startGame() {
  currentNode = START;
  prompt.start();
  playerTurn();
}

function playerTurn() {
  console.log();
  console.log("X's turn: ");
  renderNode(currentNode);
  console.log("Press the key for the move you would like to make: ");
  prompt.get(['move'], function(err, result) {
    var index = parseInt(result && result.move, 10);
    if (currentNode[index] === "-") {
      var nextNode = opposite(currentNode[0]) + currentNode.slice(1, index) + "X" + currentNode.slice(index + 1);
      currentNode = nextNode;
      
      nextTurn();
    } else {
      console.log("Sorry, that's not a valid move");
      setTimeout(playerTurn, 1000);
    }
  });
}

function probabilityFor(node, outcome) {
  var totalOutcomes = nodes[node].xWins + nodes[node].oWins + nodes[node].ties;
  if (totalOutcomes === 0) return 0; // don't divide by 0

  
  return nodes[node][outcome] / totalOutcomes;
}

function computerTurn() {
  console.log();
  console.log("O's turn: ");
  renderNode(currentNode);

  debugProbability(currentNode);

  var bestMove = _(nodes[currentNode].neighbors).max(function(n) {
    // Avoid giving the player a chance to win.
    if (nodes[n].warning) return -1;

    // if (nodes[n].traps) return 1000000 + probabilityFor(n, 'traps');
    return probabilityFor(n, 'likelyOWins');
  });
  currentNode = bestMove;
  
  setTimeout(nextTurn, 1000);
}

function nextTurn() {
  
  if (currentNode.indexOf('-') === -1) {
    console.log();
    renderNode(currentNode);
    console.log("A strange game. It seems the only way to win is not to play.")
  } else {
    var victory = getVictory(currentNode);
    if (victory === "X") {
      console.log();
      renderNode(currentNode);
      console.log("Congratulations, you defeated the machine!");
    } else if (victory === "O") {
      console.log();
      renderNode(currentNode);
      console.log("You have been defeated!");
    } else if (currentNode[0] === "X") {
      setTimeout(playerTurn, 1000);
    } else if (currentNode[0] === "O") {
      computerTurn();
    }
  }
}

function debugRepl(derpNode) {
  var replInstance =  repl.start({
    prompt: "node > ",
    input: process.stdin,
    output: process.stdout
  });

  replInstance.context.derpNode = derpNode;
  replInstance.context.nodes = nodes;
  replInstance.context._ = _;
  replInstance.context.renderNode = renderNode;
}

function debugProbability(node) {
  console.log("Total X Wins: " + nodes[node].xWins);
  console.log("Total O Wins: " + nodes[node].oWins);
  console.log("Total Likely O Wins: " + nodes[node].likelyOWins);
  console.log("Total Ties: " + nodes[node].ties);
  console.log("Total Traps: " + nodes[node].traps);
  nodes[node].neighbors.forEach(function(n) {
    console.log("Chance of winning for " + n + ": " + probabilityFor(n, 'likelyOWins') + (nodes[n].warning ? "; WARNING" : ""));
  });
  // nodes[node].neighbors.forEach(function(n) {
  //   console.log("Chance of winning for " + n + ": " + probabilityFor(n, 'oWins') + (nodes[n].warning ? "; WARNING" : ""));
  // });

  // nodes[node].neighbors.forEach(function(n) {
  //   console.log("Chance of trapping for " + n + ": " + probabilityFor(n, 'traps') + (nodes[n].warning ? "; WARNING" : ""));
  // });
}

startDiscover();