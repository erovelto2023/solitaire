"use client"

import { motion } from "framer-motion"
import type { CardType } from "@/lib/types"

interface DeckPileProps {
  stock: CardType[]
  onDraw: () => void
}

export function DeckPile({ stock, onDraw }: DeckPileProps) {
  return (
    <motion.div
      className={`w-16 h-24 rounded-lg bg-black/10 backdrop-blur-sm cursor-pointer transition-all duration-200 ${
        stock.length === 0 ? "opacity-50" : "hover:bg-black/20"
      }`}
      onClick={onDraw}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {stock.length > 0 ? (
        <div className="w-full h-full rounded-lg bg-gradient-to-br from-red-800 to-red-950 border border-red-600 flex items-center justify-center">
          <div className="w-10 h-16 rounded-md bg-white/5 flex items-center justify-center border border-red-700/50">
            <div className="w-8 h-12 rounded-sm bg-gradient-to-br from-amber-600/20 to-amber-800/20 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2L15 8L21 9L16.5 14L18 20L12 17L6 20L7.5 14L3 9L9 8L12 2Z"
                  fill="#9f7425"
                  fillOpacity="0.3"
                  stroke="#9f7425"
                  strokeWidth="1"
                />
              </svg>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-xl text-amber-500/20">↻</div>
        </div>
      )}
    </motion.div>
  )
}
