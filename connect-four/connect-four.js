var _ = require('underscore'),
    prompt = require ('prompt'),
    charm = require('charm')();

charm.pipe(process.stdout);

// Node key format:
// 00: turn
// 01 02 03 04 05 06 07 // Droppable row
// 08 09 10 11 12 13 14
// 15 16 17 18 19 20 21
// 22 23 24 25 26 27 28
// 29 30 31 32 33 34 35
// 36 37 38 39 40 41 42

var START = "X"; // X's turn
for (var i = 0; i < 42; i++) {
  START += "-"; //all spaces blank
}

var currentNode;

// Interface

function startGame() {
  currentNode = START;
  prompt.start();
  nextTurn();
}

function nextTurn() {
  if (isTie(currentNode)) {
    console.log();
    renderNode(currentNode);
    console.log("It's a tie.")
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

function renderNode (node) {
  for (var y = 1; y < node.length; y += 7) {
    var row = " ";
    for (var x = 0; x < 7; x++) {
      row += renderCell(node, y + x) + " ";
    }
    console.log(row);
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

function playerTurn() {

  console.log();
  console.log("X's turn: ");
  renderNode(currentNode);
  console.log("Press the key for the move you would like to make: ");
  prompt.get(['move'], function(err, result) {
    var slot = parseInt(result && result.move, 10);
    var nextNode = takeMove(currentNode, slot);
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

  currentNode = chooseComputerMove();

  nextTurn();
}

// AI
var EPSILON = 1e-6;
var ITERATIONS = 1000;

function chooseComputerMove() {
  // Monte Carlo Tree Search
  var rootNode = makeMCTSNode(currentNode);
  for (var i = 0; i < ITERATIONS; i++) {
    think(rootNode);
  };
  return _.max(rootNode.children, function(c) {
    return c.totalValue;
  }).state;
}

function makeMCTSNode(gameState) {
  return {
    state: gameState,
    nVisits: 0,
    totalValue: 0
  };
}

function chooseRandomMove(node) {
  var neighbors = discoverNeighbors(node);
  var rand = Math.floor(Math.random() * neighbors.length);
  return neighbors[rand];
}

function think(mctsNode) {
  var visited = [];
  var cur = mctsNode;
  visited.push(cur);
  while (!isLeaf(cur)) {
    cur = selectChild(cur);
    visited.push(cur);
  }
  expandNode(cur);
  var newNode = selectChild(cur);
  visited.push(newNode);
  var simulatedVictor = calculateSimulatedVictor(newNode.state);
  var value = simulatedVictor === mctsNode.state[0] ? 1 : 0;
  visited.forEach(function(v) {
    updateStats(v, value);
  });
}

function isLeaf(mctsNode) {
  return !mctsNode.children;
}

function selectChild(mctsNode) {
  return _.max(mctsNode.children, function(c) {
    var exploitation = c.totalValue / (c.nVisits + EPSILON);
    var exploration = Math.sqrt(Math.log(mctsNode.nVisits + 1) / (c.nVisits + EPSILON));
    var tieBreaker = Math.random() * EPSILON;
    return exploitation + exploration + tieBreaker;
  });
}

function expandNode(mctsNode) {
  mctsNode.children = discoverNeighbors(mctsNode.state).map(function(n) {
    return makeMCTSNode(n);
  });
}

function calculateSimulatedVictor(state) {
  var currentState = state;
  while (isBlank(getVictory(currentState)) && !isTie(currentState)) {
    currentState = chooseRandomMove(currentState);
  }
  return getVictory(currentState);
}

function updateStats(mctsNode, value) {
  mctsNode.nVisits++;
  mctsNode.totalValue += value;
}

// Game logic

function opposite(a) {
  if (a === "X") return "O";
  if (a === "O") return "X";
  return "-";
}

function isBlank(a) {
  return a === "-";
}

function isTie(node) {
  return node.indexOf('-') === -1;
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

function takeMove(node, slot) {
  var grid = node.slice(1);
  var turn = node[0];
  var nextTurn = opposite(turn);
  var i = slot - 1;
  if (i > 6)  return;

  if (grid[i] === "-") {
    var slicePoint = i;
    // Find the lowest available slot
    while (slicePoint + 7 < 42 && grid[slicePoint + 7] === "-") {
      slicePoint += 7;
    }
    var neighbor = nextTurn + grid.slice(0, slicePoint) + turn + grid.slice(slicePoint + 1);
    return neighbor;
  }
}

function discoverNeighbors(node) {
  var neighbors = [];
  for (var i = 1; i <= 7; i++) {
    neighbors.push(takeMove(node, i));
  }
  return neighbors.filter(function(n) { return n; });
}

startGame();