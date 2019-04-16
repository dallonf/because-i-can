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
        self.pending_card: Optional[None] = None


# Constants
MATCH_SIZE = 4
SUITS = ('hearts', 'clubs', 'diamonds', 'spades')
RANKS = list(range(1, 10)) + ['jack', 'queen', 'king', 'ace']
CARDS = [Card(suit=suit, rank=rank) for suit in SUITS for rank in RANKS]


# set up
players: List[Player] = [Player(number=i) for i in range(NUM_PLAYERS)]
deck = list(CARDS)
random.shuffle(deck)
# deal out starting hands
for _ in range(MATCH_SIZE):
    for p in players:
        p.hand.append(deck.pop())


class TakeTurnResult(NamedTuple):
    next_card: Card
    is_winning: bool


def take_turn(player: Player, card: Card) -> TakeTurnResult:
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

    next_card = card

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
            next_card = old_card

    return TakeTurnResult(next_card=next_card, is_winning=hand_is_winning(player.hand))


def hand_is_winning(hand: Hand) -> bool:
    rank = hand[0].rank
    for card in hand:
        if card.rank != rank:
            return False
    return True


def format_card(card: Card) -> str:
    return f'{card.rank} of {card.suit}'


def format_hand(hand: Hand) -> List[str]:
    return [format_card(card) for card in hand]


def format_players(players: List[Player]) -> List[str]:
    return [f'{player.number}:{format_card(player.pending_card) if player.pending_card else "..."}' for player in players]


# test
dealer = players[0]
player_after_dealer = players[1]
rounds = 0
winner = None
discard: List[Card] = []
while len(deck):
    rounds += 1
    # each iteration of this loop is a "round"
    # first, the dealer will draw a card and take their turn
    new_card = deck.pop()
    dealer_turn = take_turn(dealer, new_card)
    if dealer_turn.is_winning:
        winner = dealer
        break
    player_after_dealer.pending_card = dealer_turn.next_card

    # to simulate the parallel nature of the game, loop in reverse order through each player
    # that has a pending card
    players_in_order = [
        player for player in players[::-1] if player.pending_card]
    for player in players_in_order:
        turn = take_turn(player, player.pending_card)
        player.pending_card = None
        if turn.is_winning:
            winner = player
            break
        # hand the card off to either the next player, or if none, the discard pile
        next_player_index = player.number + 1
        if (next_player_index < len(players)):
            players[next_player_index].pending_card = turn.next_card
        else:
            discard.append(turn.next_card)
    if winner:
        break


print("rounds before end: ", rounds)
print("winner ID: ", winner.number if winner else "N/A")
