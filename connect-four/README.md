# Connect Four
(December 2014)

After discovering the [Monte Carlo Tree Search](http://mcts.ai/code/java.html) algorithm, I thought I'd try the Connect Four project again (previously, I had failed to create a Connect Four AI using a [depth-first search](../tic-tac-toe)).

And wow! It works pretty well! Most of the time, I can't beat it.

## How to use it

First, run `node connect-four.js`.

You're X, and you go first. Type the number that corresponds to your move and press Enter. Then wait a moment for the AI to take its turn and repeat.

## How it works

This uses a basic [Monte Carlo Tree Search](http://en.wikipedia.org/wiki/Monte_Carlo_tree_search). The exact code was heavily based on (read: copied from) the [Java example from mcts.ai](http://mcts.ai/code/java.html)  I'm impressed by how well the algorithm works! If you haven't heard of it before, in a nutshell, it's similar to the A* pathfinding algorithm in that it uses a heuristic to guide its search. The cool thing about it is that it runs simulated playthroughs of the game - with each player just taking random moves - and records who wins. It does several thousand of these simulations, and focuses on the parts of the tree (that is, the possible moves) that are showing the most promise. So the amount of domain-specific logic is very low!

I did have to make a few tweaks to the algorithm, namely, to make the simulation assume that players - human or AI - will immediately capitalize on a possible win. (That is, the AI considers *not* completing a line of four to be an illegal move). Without this modification, the AI would be hopelessly optimistic and forget to block the player from winning because it determined some other move had the highest chance of success.

This was a very interesting introduction to the Monte Carlo algorithm. I don't think it'll be the last time I use it!