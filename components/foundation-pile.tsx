"use client"

import { useDrop } from "react-dnd"
import { Card } from "@/components/card"
import type { CardType, GameState } from "@/lib/types"
import { canAddToFoundation } from "@/lib/game-utils"
import { motion } from "framer-motion"

interface FoundationPileProps {
  pile: CardType[]
  index: number
  onCardMove: (stateUpdater: (prevState: GameState) => GameState) => void
  gameState: GameState
}

export function FoundationPile({ pile, index, onCardMove, gameState }: FoundationPileProps) {
  const topCard = pile.length > 0 ? pile[pile.length - 1] : null

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: "CARD",
      canDrop: (item: { card: CardType; fromIndex: number; stackPosition: number }) => {
        return canAddToFoundation(item.card, pile)
      },
      drop: (item: { card: CardType; fromIndex: number; stackPosition: number }) => {
        handleDrop(item.card, item.fromIndex, item.stackPosition)
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
      }),
    }),
    [pile],
  )

  const handleDrop = (card: CardType, fromIndex: number, stackPosition: number) => {
    onCardMove((prevState: GameState) => {
      const newState = { ...prevState }

      // Remove the card from its original location
      if (fromIndex === -1) {
        // From waste pile
        if (newState.waste.length > 0) {
          const topCard = newState.waste[newState.waste.length - 1]
          if (topCard.suit === card.suit && topCard.rank === card.rank) {
            newState.waste.pop()
          }
        }
      } else if (fromIndex >= 0 && fromIndex <= 6) {
        // From tableau
        const tableau = [...newState.tableau]
        const pile = [...tableau[fromIndex]]
        
        // Only allow moving one card at a time to foundation
        if (stackPosition === pile.length - 1) {
          pile.pop()
          tableau[fromIndex] = pile

          // Flip the new top card if needed
          if (pile.length > 0 && !pile[pile.length - 1].faceUp) {
            pile[pile.length - 1].faceUp = true
          }

          newState.tableau = tableau
        }
      }

      // Add the card to the foundation
      newState.foundations[index] = [...newState.foundations[index], { ...card, faceUp: true }]

      return newState
    })
  }

  return (
    <div className="relative w-16 h-24">
      <motion.div
        ref={drop as unknown as React.RefObject<HTMLDivElement>}
        className={`absolute inset-0 rounded-lg ${
          isOver && canDrop ? "bg-green-500/5" : isOver ? "bg-red-500/5" : "bg-transparent"
        } transition-colors duration-200`}
        whileHover={{ scale: 1.02 }}
      >
        {topCard ? (
          <div className="relative w-full h-full">
            <Card
              card={topCard}
              index={index}
              stackPosition={0}
              isDraggable={false}
              gameState={gameState}
              onCardMove={onCardMove}
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center border border-amber-500/20 rounded-lg">
            <div className="text-2xl text-amber-500/20">♠</div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
