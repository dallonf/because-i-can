# Tic-Tac-Toe
(May 2013)

Shortly after building a depth-first search to [solve a puzzle](../lexico-puzzle-solver), I was inspired to build an AI that could actually play and win a game. Of course, Tic-Tac-Toe is the easiest, so I started there.

My primary goal was to make a predictive AI that could consistently win - although Tic-Tac-Toe is usually a very reactive game (most turns, there's only one move you can make that doesn't result in your immediate defeat), it's sometimes possible to "trap" the other player into a situation where they cannot prevent you from winning.

In practice, it doesn't really find those situations. I'm not convinced that the AI is working optimally or even correctly (some of the stats it reports in debug mode don't look right), but for now, I'm pretty much convinced that it can't work like I hoped it would just due to the nature of the game.

Oh, and don't worry. There's plenty of references to [WarGames](https://en.wikipedia.org/wiki/WarGames) in the code.

## How to use it

First, run `node tic-tac-toe.js`. Wait a minute for it to finish its calculations. (I could cache them all, but never got around to optimizing it).

You're X, and you go first. Type the number that corresponds to your move and press Enter. Then wait a moment for the AI to take its turn and repeat.

## How it works

Before starting the game, the script runs a depth-first search of every possible outcome. Fortunately, Tic-Tac-Toe is a simple enough game that this is a pretty quick process.

On the AI's turn, it looks at each possible move and chooses the one that has the highest chance of victory. It actually makes this decision immediately (all of its thinking was done already during the search), but I noticed that it looks weird when it responds that quickly, so I added a delay.

## Connect Four

After learning that Tic-Tac-Toe simply wasn't the best game to test a predictive AI, I tried to port it over to play Connect Four instead: `connect-four-failed.js`.

Connect Four, as it turns out, is a much more complex game. It is impossible to scan all possible outcomes of the game because there are simply too many.

I did, however, build a cool-looking visualizer for the scanning process. If you should feel inspired to try running the code, the keyboard shortcut to exit is Ctrl-C.

I later re-attempted Connect Four using a Monte Carlo Tree Search algorithm to [much greater success](../connect-four).