## TV Tropes Crawler
(March 2014)

This is a basic webcrawler that attempts to rank [TV Tropes](http://tvtropes.org/) entries by frequency of usage. It's a bit of a work in progress at the moment, as it will occasionally miss a link or consider an actual work of fiction to be a trope, and the results aren't formatted very well. Also, it would be cool if it could save its state to file and resume progress, because it takes an awfully long time to run.

## How to use it

Set the `ROOT_PAGE` variable to the URL of the root page you'd like to scan. Be careful - the names scrolling by in your console will be intruiging, but if you copy them into your browser, [you will never escape](http://xkcd.com/609/).

Then run `node tvropes.js`. When it's done (which takes a *long* time), the script will output a `tropes.json` file, which is formatted like this:

    {
      "trope/url": 1000 // examples of usage
    }

## How it works

It's a pretty basic webcrawler. If it finds HTML linking to what it determines to be child pages, it adds those links to the queue. If it finds examples of tropes, it counts them and eventually includes the link in the output.

This process is actually a bit tricky and error-prone because the TV Tropes website's markup is decidedly non-semantic.