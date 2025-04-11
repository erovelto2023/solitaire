"use client"

import { useEffect, useState } from "react"
import { DeckPile } from "@/components/deck-pile"
import { FoundationPile } from "@/components/foundation-pile"
import { TableauPile } from "@/components/tableau-pile-fixed"
import { WastePile } from "@/components/waste-pile"
import { Button } from "@/components/ui/button"
import { RefreshCw, Undo, Trophy, Volume2, VolumeX } from "lucide-react"
import { createDeck, dealCards, isGameWon } from "@/lib/game-utils"
import type { GameState } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"

export function Solitaire() {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [gameWon, setGameWon] = useState(false)
  const [moveHistory, setMoveHistory] = useState<GameState[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [moves, setMoves] = useState(0)
  const [debugMode, setDebugMode] = useState(false)

  // Initialize game
  useEffect(() => {
    startNewGame()
  }, [])

  // Check for win condition
  useEffect(() => {
    if (gameState && isGameWon(gameState)) {
      setGameWon(true)
      if (soundEnabled) {
        playSound("win")
      }
      // Trigger confetti
      confetti({
        particleCount: 200,
        spread: 70,
        origin: { y: 0.6 },
      })
    }
  }, [gameState, soundEnabled])

  const startNewGame = () => {
    const deck = createDeck()
    const initialState = dealCards(deck)
    setGameState(initialState)
    setMoveHistory([])
    setGameWon(false)
    setMoves(0)
    if (soundEnabled) {
      playSound("shuffle")
    }
  }

  const saveGameState = (stateUpdater: (prevState: GameState) => GameState) => {
    if (!gameState) return

    // Save the current state to history before updating
    setMoveHistory((prev) => [...prev, JSON.parse(JSON.stringify(gameState))])

    // Update the state using the provided updater function
    setGameState((prevState) => {
      if (!prevState) return null
      const newState = stateUpdater(JSON.parse(JSON.stringify(prevState)))

      // Debug the state change
      if (debugMode) {
        console.log("Previous state:", prevState)
        console.log("New state:", newState)
      }

      // Increment move counter
      setMoves((prev) => prev + 1)

      // Play sound
      if (soundEnabled) {
        playSound("card")
      }

      return newState
    })
  }

  const undoMove = () => {
    if (moveHistory.length > 0) {
      const previousState = moveHistory[moveHistory.length - 1]
      setGameState(previousState)
      setMoveHistory((prev) => prev.slice(0, -1))
      setMoves((prev) => Math.max(0, prev - 1))
      if (soundEnabled) {
        playSound("undo")
      }
    }
  }

  const drawCard = () => {
    if (!gameState) return

    saveGameState((prevState) => {
      const newState = { ...prevState }

      if (newState.stock.length === 0) {
        // Reset stock from waste pile if empty
        newState.stock = [...newState.waste].reverse()
        newState.waste = []
      } else {
        // Draw a card from stock to waste
        const card = newState.stock.pop()!
        card.faceUp = true
        newState.waste.push(card)
      }

      return newState
    })
  }

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled)
  }

  const toggleDebug = () => {
    setDebugMode(!debugMode)
    console.log(`Debug mode ${!debugMode ? "enabled" : "disabled"}`)
  }

  const playSound = (type: "card" | "shuffle" | "win" | "undo") => {
    // In a real implementation, we would play actual sounds here
    console.log(`Playing sound: ${type}`)
  }

  if (!gameState) return <div>Loading...</div>

  return (
    <div className="w-full max-w-5xl mx-auto">
      <AnimatePresence>
        {gameWon && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-b from-gray-900 to-gray-800 p-8 rounded-lg shadow-2xl text-center border border-amber-500"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <motion.div
                className="text-amber-500 mb-4 flex justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <Trophy size={60} />
              </motion.div>
              <h2 className="text-3xl font-bold mb-4 text-amber-400 font-serif">Ruby Victory!</h2>
              <p className="mb-6 text-red-300">You've conquered the game in {moves} moves!</p>
              <Button
                onClick={startNewGame}
                className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white border-none"
              >
                Play Again
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between mb-6 items-center">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={startNewGame}
            className="bg-black/30 backdrop-blur-sm border-amber-600/50 hover:bg-black/50 hover:border-amber-500"
          >
            <RefreshCw className="h-4 w-4 text-amber-500" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={undoMove}
            disabled={moveHistory.length === 0}
            className="bg-black/30 backdrop-blur-sm border-amber-600/50 hover:bg-black/50 hover:border-amber-500 disabled:opacity-30"
          >
            <Undo className="h-4 w-4 text-amber-500" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSound}
            className="bg-black/30 backdrop-blur-sm border-amber-600/50 hover:bg-black/50 hover:border-amber-500"
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4 text-amber-500" />
            ) : (
              <VolumeX className="h-4 w-4 text-amber-500" />
            )}
          </Button>
          {debugMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleDebug}
              className="bg-black/30 backdrop-blur-sm border-amber-600/50 hover:bg-black/50 hover:border-amber-500 text-amber-500"
            >
              Debug: ON
            </Button>
          )}
        </div>
        <div className="text-amber-400 font-mono bg-black/30 px-3 py-1 rounded-m backdrop-blur-sm border border-amber-600/30">
          Moves: {moves}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4 mb-6">
        <DeckPile stock={gameState.stock} onDraw={drawCard} />
        <WastePile waste={gameState.waste} onCardMove={saveGameState} gameState={gameState} />
        <div className="col-span-1"></div>
        {[0, 1, 2, 3].map((index) => (
          <FoundationPile
            key={`foundation-${index}`}
            pile={gameState.foundations[index]}
            index={index}
            onCardMove={saveGameState}
          />
        ))}
      </div>

      <div className="grid grid-cols-7 gap-4">
        {gameState.tableau.map((pile, index) => (
          <TableauPile key={`tableau-${index}`} pile={pile} index={index} onCardMove={saveGameState} />
        ))}
      </div>

      {/* Hidden debug button */}
      <div className="fixed bottom-2 right-2 opacity-20 hover:opacity-100">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleDebug}
          className="bg-black/30 backdrop-blur-sm border-amber-600/50 hover:bg-black/50 hover:border-amber-500 text-xs"
        >
          {debugMode ? "Disable Debug" : "Enable Debug"}
        </Button>
      </div>
    </div>
  )
}
