# Because I Can

This is a collection of a bunch of random scripts and apps I build when I just wanna code something. Most are half-finished and abandoned, but all of them do something interesting in their current state.

Most scripts are written with Node.js because I gravitate toward JavaScript for things like this. One of these days I might try Python, Lisp, or some other trendy language to see how it works.

## Screen Puzzle Solver
(May 2013)

So I was playing an interesting game called [Lexico](http://www.bananattack.com/blog/lexico/). It had a particular puzzle where you had to turn screens on and off to do... something (the game's puzzles were intentionally unintelligable), but each screen could only be turned on if the rest of them were in the right configuration. Throughout the course of the game, you had to put these screens in many different configurations, so naturally, I wrote a script to find the solutions.

### How to use it

Change the `START` and `FINISH` properties. Each one is a string of 6 characters, and you can use "0" (screen is off), "1" (screen is on), or "?" (in `FINISH` only, means that the screen can be either on or off in the solution) `START` is how the screens are current set , and `FINISH` is what you want the screens to be.

Then run `node screen_puzzle.js`.

### How it works

It uses a depth-first search algorithm to find the shortest path (or at least a path of a reasonable length) between your current configuration and your target. Most of the searching logic happens in the `step()` function, and the game logic is implemented in `findNeighbors()`. Beyond that, I'm not really sure how it works; it was a year ago, and my brain was already fried from Lexico's other puzzles.