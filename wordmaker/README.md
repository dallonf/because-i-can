## Word Maker
(March 2012)

This scripts randomly generates words that conform to certain letter usage patterns. It was designed to generate fantasy names or placeholder text (like Lorem Ipsum).

The result is mostly successful and it can usually generate pronounceable gibberish. (although sometimes it takes some creativity to pronounce)

## How to use it

Prime `words.txt` with a few paragraphs of text in the target language. (I find that unfamiliar languages produce more convinving results - using a known language has an uncanny valley effect). I've taken a few paragraphs from the Node.js documentation for a quick example.

Then run `wordmaker.js`. It should output a bunch of words.

## How it works

The script first scans `words.txt` to determine statistics:

* The distribution of word lengths (that is, number of letters per word)
* The overall distribution of letters
* The distribution of letters according to the preceding letter (or the beginning of a word)

The last element is effectively a [Markov Chain](http://en.wikipedia.org/wiki/Markov_chain) (not to be confused with a more complex Hidden Markov Model).

Finally, the script generates a word by:

1. Selecting a word length
2. Choosing a starting letter
3. Choosing more letters to fit the word length based on the previous letter chosen.

## Wishlist

1. Punctuation and capitalization would help the text look a little bit more convincing
2. It would be awesome if the letters were chosen based on the previous *two* letters - this would help to reduce certain odd patterns that can occur (example: "Ptpemeli" is unpronounceable because a "p" wouldn't follow "pt"; "Fuemoddaysssere" has three "s"s in a row, which would never happen in English).