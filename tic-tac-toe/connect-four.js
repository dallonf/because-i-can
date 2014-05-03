var _ = require('underscore'),
    prompt = require ('prompt'),
    charm = require('charm')();

charm.pipe(process.stdout);
// charm.on('^C', process.exit)

// Node key format:
// 00: turn
// 01 02 03 04 05 06 07 // Droppable row
// 08 09 10 11 12 13 14
// 15 16 17 18 19 20 21
// 22 23 24 25 26 27 28
// 29 30 31 32 33 34 35
// 36 37 38 39 40 41 42

function makeNode(turn, rows) {
  var node = turn;
  if (arguments.length !== 7) console.log("Warning! You provided " + (arguments.length-1) + " rows instead of 6.");
  for (var i = 1; i < arguments.length; i++) {
    node += arguments[i];
  }
  if (node.length !== 43) console.log("Warning! You don't have the right number of columns");
  return node;
}

var START = "X"; // X's turn
for (var i = 0; i < 42; i++) {
  START += "-"; //all spaces blank
}

var nodes = {},
    visited = {},
    unvisited = [],    
    xWins = [],
    oWins = [],
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
  // TODO: all these alorithms could be a tiny bit faster if they worked from the bottom up
  // and avoided checking the same cells
  var x, y, consecutive, 
      checkedPositiveDiagonal = {}, checkedNegativeDiagonal = {},
      cursor;

  // Horizontal victories
  for (y = 1; y < node.length; y+=7) { // For each row
    consecutive = 0;
    for (x = 0; x < 7; x++) { // Check for consecutive pieces
      if (node[x + y] === player) {
        consecutive += 1;
        if (consecutive >= 4) {
          return true;
        }
      } else {
        consecutive = 0;
      }
    }
  }

  // Vertical victories
  for (x = 1; x <= 7; x++) { // For each column
    consecutive = 0;
    for (y = 0; y < 6; y++) {
      if (node[x + y*7] === player) { // Check for consecutive pieces
        consecutive += 1;
        if (consecutive >= 4) {
          return true;
        }
      } else {
        consecutive = 0;
      }
    }
  }

  // Diagonals
  for (var i = 1; i < node.length; i++) { // For each piece
    if (node[i] === player) {
      // Negative diagonal
      consecutive = 1;
      // Check down and right
      cursor = i;
      do {
        cursor += 8; // 1*7 down, 1 right
        if (node[cursor] === player) {
          consecutive += 1;
        } else {
          break;
        }
      } while (cursor < node.length);
      // Check up and left
      cursor = i;
      do {
        cursor -= 8; //1*7 up, 1 left
        if (node[cursor] === player) {
          consecutive += 1;
        } else {
          break;
        }
      } while (cursor > 1);
      if (consecutive >= 4) {
        return true;
      }

      // Positive diagonal
      consecutive = 1;
      // Check up and right
      cursor = i;
      do {
        cursor -= 6; // 1*7 up, 1 right
        if (node[cursor] === player) {
          consecutive += 1;
        } else {
          break;
        }
      } while (cursor > 0);
      // Check down and left
      cursor = i;
      do {
        cursor += 6; // 1*7 down, 1 left
        if (node[cursor] === player) {
          consecutive += 1;
        } else {
          break;
        }
      } while (cursor > 0);
      if (consecutive >= 4) {
        return true;
      }
    }
  }
  return false;
}

function createNode(code) {
  var node = {
    code: code,
    parents: [],
    neighbors: [],
    neighborMap: {},
    distanceFromWin: 10000000
  }
  nodes[code] = node;
  unvisited.push(code);
  return node;
}

function discoverNeighbors(node) {
  // Can't continue to play after winning
  var victory = getVictory(node);
  if (isBlank(victory)) {

    var grid = node.slice(1);
    var turn = node[0];
    var nextTurn = opposite(turn);

    for (var i = 0; i < 7; i++) {
      if (grid[i] === "-") {

        var slicePoint = i;

        // Find the lowest available slot
        while (slicePoint + 7 < 42 && grid[slicePoint + 7] === "-") {
          slicePoint += 7;
        }

        var neighbor = nextTurn + grid.slice(0, slicePoint) + turn + grid.slice(slicePoint + 1);
        nodes[node].neighbors.push(neighbor);
        nodes[node].neighborMap[i + 1] = neighbor;
        if (!nodes[neighbor]) {
          createNode(neighbor);
        }

        if (nodes[neighbor].parents.indexOf(node) === -1) nodes[neighbor].parents.push(node);  
      }
    }

  } else if (victory === "X") {
    xWins.push(node);
    nodes[node].xWins = 1;
    nodes[node].distanceFromWin = 1;
  } else if (victory === "O") {
    oWins.push(node);
    nodes[node].oWins = 1;
    nodes[node].distanceFromWin = 1;
  }
}

function renderCell(node, index) {
  if (node[index] === "-") {
    if (index <= 7) {
      return "[" + index + "]";  
    } else {
      return " - ";
    }
  } else {
    return " " + node[index] + " ";
  }
}

function renderNode (node) {
  for (var y = 1; y < node.length; y += 7) {
    var row = " ";
    for (var x = 0; x < 7; x++) {
      row += renderCell(node, y + x) + " ";
    }
    console.log(row);
  }
}

function discoverStep() {
  var current = unvisited.shift();
  if (current) {

    console.log("discovered " + Object.keys(nodes).length + " nodes");
    renderNode(current);
    discoverNeighbors(current);
    setImmediate(discoverStep);
    charm.up(7);
  } else {
    for (var i = 0; i < 7; i++) {
      console.log();
    }
    console.log("Phew!");
    console.log("Discovered all " + Object.keys(nodes).length + " nodes.");
    // startOutcomeAnalysis();
  }
}

function outcomeAnalysisStep() {
  unvisited.sort(function(a, b) {
    return nodes[a].distanceFromWin - nodes[b].distanceFromWin;
  });
  var current = unvisited.shift();
  if (current) {
    visited[current] = true;
    if (!nodes[current].xWins) nodes[current].xWins = 0;
    if (!nodes[current].oWins) nodes[current].oWins = 0;
    var dist = nodes[current].distanceFromWin + 1;

    var isXVictory = isVictory(current, "X");

    nodes[current].parents.forEach(function(p) {

      if (isXVictory) {
        // Put a special flag on all the nodes that lead directly to an X victory
        nodes[p].warning = true;
      }

      if (nodes[p].distanceFromWin > dist) nodes[p].distanceFromWin = dist;
      nodes[p].xWins = (nodes[p].xWins || 0) + nodes[current].xWins;
      nodes[p].oWins = (nodes[p].oWins || 0) + nodes[current].oWins;
      if (!visited[p] && unvisited.indexOf(p) === -1) unvisited.push(p);
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
  unvisited = xWins.concat(oWins);
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
    var nextNode = currentNode[index].neighborMap[index];
    if (nextNode) {
      currentNode = nextNode;
      
      nextTurn();
    } else {
      console.log("Sorry, that's not a valid move");
      setTimeout(playerTurn, 1000);
    }
  });
}

function computerTurn() {
  console.log();
  console.log("O's turn: ");
  renderNode(currentNode);

  if (false) {
    // Quick little debug view
    nodes[currentNode].neighbors.forEach(function(n) {
      var p = (nodes[n].xWins + nodes[n].oWins) > 0 ? nodes[n].oWins / (nodes[n].xWins + nodes[n].oWins) : 0;
      console.log("Chance of winning for " + n + ": " + p + (nodes[n].warning ? "; WARNING" : ""));
    });
  }

  var bestMove = _(nodes[currentNode].neighbors).max(function(n) {
    // Avoid giving the player a chance to win.
    if (nodes[n].warning) return -1;
    return (nodes[n].xWins + nodes[n].oWins) > 0 ? nodes[n].oWins / (nodes[n].xWins + nodes[n].oWins) : 0;
  });
  currentNode = bestMove;
  
  nextTurn();
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
      setTimeout(computerTurn, 1000);
    }
  }
}


// var testNode = makeNode("O",
//   "-------",
//   "-------",
//   "-------",
//   "-------",
//   "-------",
//   "-X--O-X"
//   );
// renderNode(testNode);
// // console.log("victory:", getVictory(testNode));
// createNode(testNode);
// discoverNeighbors(testNode);
// nodes[testNode].neighbors.forEach(function(n) {
//   console.log();
//   renderNode(n);
// });
// console.log(nodes[testNode]);
startDiscover();