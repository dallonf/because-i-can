import random
import itertools
from typing import List, Union, Optional, NamedTuple

# Configuration
# TODO: what is the maximum number of players before the game breaks down?
NUM_PLAYERS = 7

# Data types


class Card(NamedTuple):
    suit: str
    rank: Union[str, int]


Hand = List[Card]


class Player:

    @property
    def number(self):
        return self._number

    def __init__(self, number: int):
        self._number: int = number
        self.hand: Hand = []
        self.pendingCard: Optional[None] = None


# Constants
MATCH_SIZE = 4
SUITS = ('hearts', 'clubs', 'diamonds', 'spades')
RANKS = list(range(1, 10)) + ['jack', 'queen', 'king', 'ace']
CARDS = [Card(suit=suit, rank=rank) for suit in SUITS for rank in RANKS]


# set up
players = [Player(number=i) for i in range(NUM_PLAYERS)]
deck = list(CARDS)
random.shuffle(deck)
# deal out starting hands
for _ in range(MATCH_SIZE):
    for player in players:
        player.hand.append(deck.pop())


def take_turn(player: Player, card: Card):
    "Returns the card passed to the next player"
    # group cards for easier processing
    groups = dict()
    for c in player.hand:
        group = None
        if c.rank in groups:
            group = groups[c.rank]
        else:
            group = []
            groups[c.rank] = group
        group.append(c)
    sorted_groups = [{'count': len(v), 'rank': k}
                     for (k, v) in groups.items()]
    sorted_groups.sort(key=lambda group: group['count'])

    if card.rank in groups.keys():
        # we'll sacrifice a card from the smallest group, but only
        # if that would make a bigger group than that card already belongs to
        size_of_match = len(groups[card.rank]) + 1
        # find the smallest group, we'll sacrifice a card from it
        smallest_group = sorted_groups[0]
        if smallest_group['count'] < size_of_match:
            old_card = next(
                c for c in player.hand if c.rank == smallest_group['rank'])
            player.hand.remove(old_card)
            player.hand.append(card)
            return old_card

    # this card doesn't help us make a match, pass it on
    return card


def hand_is_winning(hand: Hand):
    rank = hand[0].rank
    for card in hand:
        if card.rank != rank:
            return False
    return True


def format_card(card: Card):
    return f'{card.rank} of {card.rank}'


def format_hand(hand: Hand):
    return [format_card(card) for card in hand]


# test
player = players[0]
print(format_hand(player.hand))
while len(deck) and not hand_is_winning(player.hand):
    card = deck.pop()
    print("got card:", format_card(card))
    take_turn(player, card)
    print(format_hand(player.hand))
