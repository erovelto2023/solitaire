import type { CardType, GameState } from "./types"

// Create a shuffled deck of cards
export function createDeck(): CardType[] {
  const suits = ["hearts", "diamonds", "clubs", "spades"] as const
  const deck: CardType[] = []

  for (const suit of suits) {
    for (let rank = 1; rank <= 13; rank++) {
      deck.push({ suit, rank, faceUp: false })
    }
  }

  return shuffleDeck(deck)
}

function shuffleDeck(deck: CardType[]): CardType[] {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Deal cards to set up the initial game state
export function dealCards(deck: CardType[]): GameState {
  const gameState: GameState = {
    stock: [],
    waste: [],
    foundations: [[], [], [], []],
    tableau: [[], [], [], [], [], [], []],
    drawCount: 3, // Default to 3 cards
  }

  const deckCopy = [...deck]

  // Deal cards to tableau piles (7 piles)
  for (let i = 0; i < 7; i++) {
    // For each pile, deal i+1 cards
    for (let j = 0; j <= i; j++) {
      if (deckCopy.length === 0) break
      const card = deckCopy.pop()!
      // Only the top card of each pile should be face up
      card.faceUp = (j === i)
      gameState.tableau[i].push(card)
    }
  }

  // Remaining cards go to the stock pile, face down
  gameState.stock = deckCopy.map(card => ({ ...card, faceUp: false }))

  return gameState
}

// Check if a card can be added to a tableau pile
export function canAddToTableau(card: CardType, targetCard: CardType | null): boolean {
  // If there's no target card, only a king can be placed
  if (!targetCard) {
    return card.rank === 13 // King
  }

  // Check if the card is one rank lower and opposite color
  const isOppositeColor =
    (targetCard.suit === "hearts" || targetCard.suit === "diamonds") ===
    (card.suit === "clubs" || card.suit === "spades")

  return targetCard.rank === card.rank + 1 && isOppositeColor
}

// Check if a card can be added to a foundation pile
export function canAddToFoundation(card: CardType, pile: CardType[]): boolean {
  // If the pile is empty, only an ace can be placed
  if (pile.length === 0) {
    return card.rank === 1 // Ace
  }

  const topCard = pile[pile.length - 1]

  // Check if the card is the same suit and one rank higher
  return card.suit === topCard.suit && card.rank === topCard.rank + 1
}

// Add a new function to check if a card can be moved to any foundation pile
export function canMoveToAnyFoundation(card: CardType, foundations: CardType[][]): number | null {
  for (let i = 0; i < foundations.length; i++) {
    if (canAddToFoundation(card, foundations[i])) {
      return i
    }
  }
  return null
}

// Deal tableau
export function dealTableau(): { tableau: CardType[][]; stock: CardType[] } {
  const deck = createDeck()
  const tableau: CardType[][] = Array(7)
    .fill(null)
    .map(() => [])

  // Deal cards to tableau
  for (let i = 0; i < 7; i++) {
    for (let j = i; j < 7; j++) {
      const card = deck.pop()
      if (card) {
        // Only flip the top card of each pile
        card.faceUp = i === j
        tableau[j].push(card)
      }
    }
  }

  // Remaining cards go to stock
  return { tableau, stock: deck }
}

// Check if the game is won
export function isGameWon(gameState: GameState): boolean {
  // Game is won when all foundation piles have 13 cards (Ace through King)
  return gameState.foundations.every((pile) => pile.length === 13)
}
