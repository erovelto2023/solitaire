export interface CardType {
  suit: "hearts" | "diamonds" | "clubs" | "spades"
  rank: number
  faceUp: boolean
}

export interface GameState {
  stock: CardType[]
  waste: CardType[]
  foundations: CardType[][]
  tableau: CardType[][]
  drawCount: number // Add drawCount to track how many cards to draw
}

export interface GameSettings {
  drawCount: number
}
