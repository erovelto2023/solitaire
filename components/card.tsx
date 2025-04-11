"use client"

import { useDrag } from "react-dnd"
import type { CardType, GameState } from "@/lib/types"
import { canMoveToAnyFoundation } from "@/lib/game-utils"
import { motion } from "framer-motion"

interface CardProps {
  card: CardType
  index: number
  stackPosition: number
  isDraggable?: boolean
  isStackDraggable?: boolean
  wastePosition?: number
  isWaste?: boolean
  gameState: GameState
  onCardMove: (stateUpdater: (prevState: GameState) => GameState) => void
}

const suitSymbols = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
}

const suitColors = {
  hearts: "text-red-500",
  diamonds: "text-red-500",
  clubs: "text-gray-900",
  spades: "text-gray-900",
}

const rankDisplay = (rank: number): string => {
  switch (rank) {
    case 1:
      return "A"
    case 11:
      return "J"
    case 12:
      return "Q"
    case 13:
      return "K"
    default:
      return rank.toString()
  }
}

export function Card({
  card,
  index,
  stackPosition,
  isDraggable = true,
  isStackDraggable = false,
  wastePosition,
  isWaste = false,
  gameState,
  onCardMove,
}: CardProps) {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "CARD",
      item: { card, fromIndex: index, stackPosition },
      canDrag: () => isDraggable || isStackDraggable,
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [card, index, stackPosition, isDraggable, isStackDraggable],
  )

  const handleDoubleClick = () => {
    if (!card.faceUp || (!isDraggable && !isStackDraggable)) return

    const foundationIndex = canMoveToAnyFoundation(card, gameState.foundations)
    if (foundationIndex !== null) {
      onCardMove((prevState: GameState) => {
        const newState = { ...prevState }

        // Remove the card from its current location
        if (isWaste) {
          if (newState.waste.length > 0) {
            newState.waste.pop()
          }
        } else {
          const tableau = [...newState.tableau]
          const pile = [...tableau[index]]
          pile.pop()
          tableau[index] = pile

          // Flip the new top card if needed
          if (pile.length > 0 && !pile[pile.length - 1].faceUp) {
            pile[pile.length - 1].faceUp = true
          }

          newState.tableau = tableau
        }

        // Add the card to the foundation
        newState.foundations[foundationIndex] = [...newState.foundations[foundationIndex], { ...card, faceUp: true }]

        return newState
      })
    }
  }

  return (
    <motion.div
      ref={drag as unknown as React.RefObject<HTMLDivElement>}
      onDoubleClick={handleDoubleClick}
      className={`absolute w-16 h-24 select-none ${isDragging ? "opacity-50" : "opacity-100"} ${
        isDraggable || isStackDraggable ? "cursor-grab active:cursor-grabbing" : ""
      }`}
      style={{
        top: isWaste ? 0 : `${stackPosition * 30}px`,
        left: isWaste && wastePosition !== undefined ? `${wastePosition * 20}px` : 0,
        zIndex: isWaste ? 10 + (wastePosition || 0) : stackPosition + 1,
      }}
      whileHover={isDraggable || isStackDraggable ? { scale: 1.02, y: -2 } : {}}
      data-testid={`card-${card.suit}-${card.rank}`}
    >
      {card.faceUp ? (
        <div
          className={`w-full h-full rounded-lg bg-white border-2 border-gray-300 shadow-xl flex flex-col justify-between p-2 ${
            isDraggable || isStackDraggable ? "hover:shadow-2xl hover:border-gray-400" : ""
          }`}
        >
          <div className={`text-sm font-bold ${suitColors[card.suit]}`}>
            {rankDisplay(card.rank)}
            {suitSymbols[card.suit]}
          </div>
          <div className={`text-4xl font-bold text-center ${suitColors[card.suit]}`}>{suitSymbols[card.suit]}</div>
          <div className={`text-sm font-bold rotate-180 ${suitColors[card.suit]}`}>
            {rankDisplay(card.rank)}
            {suitSymbols[card.suit]}
          </div>
        </div>
      ) : (
        <div className="w-full h-full rounded-lg bg-gradient-to-br from-red-800 to-red-950 border-2 border-red-700 shadow-xl">
          <div className="w-full h-full rounded-lg flex items-center justify-center bg-[url('/card-back-pattern.png')] bg-repeat">
            <div className="w-10 h-16 rounded-md bg-red-900/30 flex items-center justify-center border border-red-700/50">
              <div className="w-8 h-12 rounded-sm bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 2L15 8L21 9L16.5 14L18 20L12 17L6 20L7.5 14L3 9L9 8L12 2Z"
                    fill="#9f7425"
                    fillOpacity="0.4"
                    stroke="#9f7425"
                    strokeWidth="1"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
