var _ = require('underscore'),
    prompt = require ('prompt'),
    charm = require('charm')(),
    debug = require('debug');

var debugMCTS = debug('mcts');
var debugSim = debug('sim');
var debugVictory = debug('victory');

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
      console.log();
      charm.foreground('cyan');
      console.log("X's turn: ");
      charm.foreground('white');
      playerTurn();
    } else if (currentNode[0] === "O") {
      console.log();
      charm.foreground('red');
      console.log("O's turn: ");
      charm.foreground('white');
      computerTurn();
    }
  }
}

function renderNode (node) {
  for (var y = 1; y < node.length; y += 7) {
    var row = " ";
    for (var x = 0; x < 7; x++) {
      renderCell(node, y + x);
      charm.write(" ");
    }
    console.log(); // newline
  }
}

function renderCell(node, index) {
  if (node[index] === "-") {
    if (index <= 7) {
      charm.write("[" + index + "]");
    } else {
      charm.write(" - ");
    }
  } else {
    if (node[index] === 'X') {
      charm.foreground('cyan');
    } else if (node[index] === 'O') {
      charm.foreground('red');
    }
    charm.write(" " + node[index] + " ");
    charm.foreground('white');
  }
}

function playerTurn() {
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
      setTimeout(nextTurn, 1000);
    }
  });
}

function computerTurn() {
  renderNode(currentNode);
  console.log();

  currentNode = chooseComputerMove(currentNode);

  setTimeout(nextTurn, 1000);
}

// AI
var EPSILON = 1e-6;
var ITERATIONS = 1000;

function chooseComputerMove(state) {
  // Monte Carlo Tree Search
  var rootNode = makeMCTSNode(state);
  for (var i = 0; i < ITERATIONS; i++) {
    think(rootNode);
  };
  return _.max(rootNode.children, function(c) {
    debugMCTS("%s", c.state + " " + c.totalValue + " " + c.nVisits);
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

function chooseRandomMove(node, options) {
  var neighbors = discoverNeighbors(node, options);
  var turn = node[0];
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
  if (!isTerminal(cur)) {
    expandNode(cur);
    var cur = selectChild(cur);
    visited.push(cur);
  }
  var simulatedVictor = calculateSimulatedVictor(cur.state);
  var value = 0.5;
  if (simulatedVictor === mctsNode.state[0]) {
    value = 1;
  } else if (simulatedVictor === opposite(mctsNode.state[0])) {
    value = 0;
  }
  visited.forEach(function(v) {
    updateStats(v, value);
  });
}

function isLeaf(mctsNode) {
  return !mctsNode.children;
}

function isTerminal(mctsNode) {
  return isTie(mctsNode.state) || !isBlank(getVictory(mctsNode.state));
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
  mctsNode.children = discoverNeighbors(mctsNode.state, { victoryOnly: true }).map(function(n) {
    return makeMCTSNode(n);
  });
}

function calculateSimulatedVictor(state) {
  var currentState = state;
  while (isBlank(getVictory(currentState)) && !isTie(currentState)) {
    currentState = chooseRandomMove(currentState, { victoryOnly: true });
    // Enable this to test simulations
    // console.log();
    // renderNode(currentState);
  }
  return getVictory(currentState);
}

function updateStats(mctsNode, value) {
  mctsNode.nVisits++;
  mctsNode.totalValue += value;
}

function discoverNeighbors(node, options) {
  var options = options || {};
  if (!isBlank(getVictory(node))) {
    // The game is over; no further moves are possible
    return [];
  }

  var neighbors = [];
  for (var i = 1; i <= 7; i++) {
    neighbors.push(takeMove(node, i));
  }
  neighbors = neighbors.filter(function(n) { return n; });

  if (options.victoryOnly) {
    var possibleVictories = neighbors.filter(function(n) {
      return getVictory(n) === node[0];
    });
    if (possibleVictories.length) {
      neighbors = possibleVictories;
    }
  }

  return neighbors;
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
        if ((cursor) % 7 === 0 || cursor > 35) { // If it's on the edge
          break;
        }
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
        if ((cursor - 1) % 7 === 0 || cursor <= 7) { // If it's on the edge
          break;
        }
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
        if (cursor % 7 === 0 || cursor <= 7) { // If it's on the edge
          break;
        }
        cursor -= 6; // 1*7 up, 1 right
        if (node[cursor] === player) {
          consecutive += 1;
        } else {
          break;
        }
      } while (cursor > 1);
      // Check down and left
      cursor = i;
      do {
        if ((cursor - 1) % 7 === 0 || cursor > 35) { // If it's on the edge
          break;
        }
        cursor += 6; // 1*7 down, 1 left
        if (node[cursor] === player) {
          consecutive += 1;
        } else {
          break;
        }
      } while (cursor < node.length);
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

startGame();