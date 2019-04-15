suits = ('hearts', 'clubs', 'diamonds', 'spades')
ranks = list(range(1,10)) + ['jack', 'queen', 'king', 'ace']
cards = [{ 'suit': suit, 'rank': rank } for suit in suits for rank in ranks]

print(cards)