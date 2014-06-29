# Brute Force Hacking Display
(June 2014)

I'm currently in the planning phases for a game where you play as a hacker. I thought it might be a cool mechanic to crack certain passwords by brute forcing them. (Wheatley style: "AAAA... that's not it. AAAC... wait, did I try B?")

Obviously, I would want to simplify the passwords; like in Batman: Arkham City, I would want four-letter passwords using only capital letters.

But due to the exponential nature of a brute force cracking attempt, I wanted to prototype the display first. Would the timing work out as something fun?

Turns out, it could be a pretty cool mechanic. Some passwords are quick and some take a while, which keeps you guessing, but it never takes so long that it would become tedious, especially in a game where there's a lot more going on.

## How to use it

You can add new passwords in the `TARGETS` array and change the speed of guesses as the `GUESSES_PER_SECOND` constant. Keep in mind that there are 456,976 possible combinations between AAAA and ZZZZ.

Finally, run `node hack.js`.

If you feel like making it crazier, you can also add possible characters to the `CHARS` string.