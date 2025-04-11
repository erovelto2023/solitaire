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
}

export function TableauPile({ pile, index, onCardMove }: TableauPileProps) {
  // Fix the drop handler to properly handle card movements
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: "CARD",
      canDrop: (item: { card: CardType; fromIndex: number; stackPosition: number }) => {
        // Don't allow dropping a card onto its own pile
        if (item.fromIndex === index) return false

        // Check if the card can be added to this tableau pile
        const targetCard = pile.length > 0 ? pile[pile.length - 1] : null
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
  ) // Add dependency to ensure the drop handler updates when the pile changes

  const handleDrop = (card: CardType, fromIndex: number, stackPosition: number) => {
    onCardMove((prevState: GameState) => {
      const newState = { ...prevState }
      let cardsToMove: CardType[] = []

      // Remove the card(s) from their original location
      if (fromIndex === -1) {
        // From waste pile
        const wasteIndex = newState.waste.findIndex((c) => c.suit === card.suit && c.rank === card.rank)
        if (wasteIndex !== -1) {
          cardsToMove = [newState.waste[wasteIndex]]
          newState.waste = newState.waste.filter((_, i) => i !== wasteIndex)
        }
      } else if (fromIndex >= 0 && fromIndex <= 6) {
        // From tableau - might be moving multiple cards
        const tableau = [...newState.tableau]
        const sourcePile = [...tableau[fromIndex]]

        // Ensure we're not trying to access an invalid position
        if (stackPosition >= 0 && stackPosition < sourcePile.length) {
          // Get all cards from the stack position to the end
          cardsToMove = sourcePile.splice(stackPosition)
          tableau[fromIndex] = sourcePile

          // Flip the new top card if needed
          if (tableau[fromIndex].length > 0 && !tableau[fromIndex][tableau[fromIndex].length - 1].faceUp) {
            tableau[fromIndex][tableau[fromIndex].length - 1].faceUp = true
          }

          newState.tableau = tableau
        }
      }

      // Add the card(s) to this tableau pile
      if (cardsToMove.length > 0) {
        newState.tableau[index] = [...newState.tableau[index], ...cardsToMove]
      }

      return newState
    })
  }

  return (
    <motion.div
      ref={drop}
      className={`w-16 min-h-[6rem] relative ${
        isOver && canDrop ? "bg-red-800/30 rounded-lg" : isOver && !canDrop ? "bg-red-900/20 rounded-lg" : ""
      }`}
      animate={{
        boxShadow: isOver && canDrop ? "0 0 15px 5px rgba(245, 158, 11, 0.2)" : "0 0 0px 0px rgba(245, 158, 11, 0)",
      }}
      transition={{ duration: 0.3 }}
    >
      {pile.length === 0 ? (
        <div className="w-16 h-24 rounded-lg border-2 border-dashed border-red-600/50 dark:border-red-600/30"></div>
      ) : (
        pile.map((card, cardIndex) => (
          <Card
            key={`${card.suit}-${card.rank}-${cardIndex}`}
            card={card}
            index={index}
            isLast={cardIndex === pile.length - 1}
            isDraggable={card.faceUp}
            stackPosition={cardIndex}
            gameState={
              onCardMove
                ? {
                    ...(pile[0].faceUp
                      ? { stock: [], waste: [], foundations: [[], [], [], []], tableau: [[], [], [], [], [], [], []] }
                      : undefined),
                  }
                : undefined
            }
            onCardMove={onCardMove}
          />
        ))
      )}
    </motion.div>
  )
}
