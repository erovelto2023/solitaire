"use client"

import { useDrop } from "react-dnd"
import { Card } from "@/components/card"
import type { CardType, GameState } from "@/lib/types"
import { canAddToTableau } from "@/lib/game-utils"
import { motion } from "framer-motion"

interface TableauPileProps {
  pile: CardType[]
  index: number
  onCardMove: (stateUpdater: (prevState: GameState) => GameState) => void
  gameState: GameState
}

export function TableauPile({ pile, index, onCardMove, gameState }: TableauPileProps) {
  const topCard = pile.length > 0 ? pile[pile.length - 1] : null

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: "CARD",
      canDrop: (item: { card: CardType; fromIndex: number; stackPosition: number }) => {
        // Get the target card (if any)
        const targetCard = pile.length > 0 ? pile[pile.length - 1] : null

        // Check if the move is valid
        return canAddToTableau(item.card, targetCard)
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

      // Remove the card(s) from the source
      if (fromIndex === -1) {
        // From waste pile
        if (newState.waste.length > 0) {
          const cardToMove = { ...newState.waste[newState.waste.length - 1], faceUp: true }
          newState.waste.pop()
          newState.tableau[index] = [...newState.tableau[index], cardToMove]
        }
      } else if (fromIndex >= 0 && fromIndex <= 6 && fromIndex !== index) {
        // From tableau (prevent dropping on the same pile)
        const tableau = [...newState.tableau]
        const sourcePile = [...tableau[fromIndex]]
        
        // Get all cards from the stack position to the end
        const movingCards = sourcePile.splice(stackPosition).map(c => ({ ...c, faceUp: true }))
        
        // Update the source pile
        if (sourcePile.length > 0 && !sourcePile[sourcePile.length - 1].faceUp) {
          sourcePile[sourcePile.length - 1].faceUp = true
        }
        
        // Update both piles
        newState.tableau[fromIndex] = sourcePile
        newState.tableau[index] = [...newState.tableau[index], ...movingCards]
      }

      return newState
    })
  }

  return (
    <div className="relative min-h-[96px]">
      <motion.div
        ref={drop as unknown as React.RefObject<HTMLDivElement>}
        className={`absolute inset-0 rounded-lg ${
          isOver && canDrop ? "bg-green-500/5" : isOver ? "bg-red-500/5" : "bg-transparent"
        } transition-colors duration-200`}
        style={{ minHeight: pile.length > 0 ? `${(pile.length - 1) * 30 + 96}px` : "96px" }}
      >
        {pile.map((card, i) => (
          <Card
            key={`${card.suit}-${card.rank}`}
            card={card}
            index={index}
            stackPosition={i}
            isDraggable={card.faceUp}
            isStackDraggable={card.faceUp && i < pile.length - 1}
            gameState={gameState}
            onCardMove={onCardMove}
          />
        ))}
        {pile.length === 0 && (
          <div className="w-16 h-24 rounded-lg border border-amber-500/20 flex items-center justify-center">
            <div className="text-2xl text-amber-500/20">♠</div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
