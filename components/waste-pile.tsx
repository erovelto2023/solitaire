"use client"

import { Card } from "@/components/card"
import type { CardType, GameState } from "@/lib/types"

interface WastePileProps {
  waste: CardType[]
  onCardMove: (stateUpdater: (prevState: GameState) => GameState) => void
  gameState: GameState
}

export function WastePile({ waste, onCardMove, gameState }: WastePileProps) {
  // Show up to 3 cards from the waste pile
  const visibleCards = waste.slice(-3)

  return (
    <div className="relative w-[96px] h-24">
      {visibleCards.map((card, i) => (
        <Card
          key={`${card.suit}-${card.rank}`}
          card={card}
          index={-1}
          stackPosition={0}
          isDraggable={i === visibleCards.length - 1}
          isStackDraggable={false}
          isWaste={true}
          wastePosition={i}
          gameState={gameState}
          onCardMove={onCardMove}
        />
      ))}
      {waste.length === 0 && (
        <div className="w-16 h-24 rounded-lg border border-amber-500/20 flex items-center justify-center">
          <div className="text-2xl text-amber-500/20">♠</div>
        </div>
      )}
    </div>
  )
}
