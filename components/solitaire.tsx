"use client"

import { useEffect, useState } from "react"
import { DeckPile } from "@/components/deck-pile"
import { FoundationPile } from "@/components/foundation-pile"
import { TableauPile } from "@/components/tableau-pile"
import { WastePile } from "@/components/waste-pile"
import { Button } from "@/components/ui/button"
import { RefreshCw, Undo, Trophy, Volume2, VolumeX, Settings } from "lucide-react"
import { createDeck, dealCards, isGameWon } from "@/lib/game-utils"
import type { GameState, GameSettings } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import { GameSettingsModal } from "@/components/game-settings-modal"

export function Solitaire() {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [gameWon, setGameWon] = useState(false)
  const [moveHistory, setMoveHistory] = useState<GameState[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [debugMode, setDebugMode] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    drawCount: 3, // Default to 3 cards
  })

  // Initialize game
  useEffect(() => {
    console.log("Initializing new game...")
    const deck = createDeck()
    console.log("Created deck:", deck)
    const initialState = dealCards(deck)
    console.log("Initial game state:", initialState)
    initialState.drawCount = gameSettings.drawCount // Set the draw count
    setGameState(initialState)
    setMoveHistory([])
    setGameWon(false)
    if (soundEnabled) {
      playSound("shuffle")
    }
  }, [gameSettings.drawCount, soundEnabled])

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
    initialState.drawCount = gameSettings.drawCount // Set the draw count
    setGameState(initialState)
    setMoveHistory([])
    setGameWon(false)
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
      if (soundEnabled) {
        playSound("undo")
      }
    }
  }

  const drawCard = () => {
    if (!gameState) return

    saveGameState((prevState) => {
      const newState = { ...prevState }
      const drawCount = newState.drawCount || 1 // Default to 1 if not set

      if (newState.stock.length === 0) {
        // Reset stock from waste pile if empty
        newState.stock = [...newState.waste].reverse()
        newState.waste = []
      } else {
        // Draw cards from stock to waste based on drawCount
        for (let i = 0; i < drawCount; i++) {
          if (newState.stock.length > 0) {
            const card = newState.stock.pop()!
            card.faceUp = true
            newState.waste.push(card)
          } else {
            break // No more cards to draw
          }
        }
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

  const updateSettings = (newSettings: GameSettings) => {
    setGameSettings(newSettings)
    setShowSettings(false)

    // If the game is in progress, ask if they want to restart
    if (gameState && (moveHistory.length > 0)) {
      if (confirm("Do you want to start a new game with these settings?")) {
        // Update the current game's draw count without restarting
        setGameState((prevState) => {
          if (!prevState) return null
          return {
            ...prevState,
            drawCount: newSettings.drawCount,
          }
        })
      }
    } else {
      // No game in progress, just update settings for next game
      startNewGame()
    }
  }

  if (!gameState) return <div>Loading...</div>

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 bg-gradient-to-br from-green-900 via-green-950 to-emerald-950">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <div className="relative">
          {/* Game controls */}
          <div className="flex justify-between mb-6 items-center">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={startNewGame}
                className="bg-green-950/50 border-green-800 hover:bg-green-900/60 hover:border-green-700"
              >
                <RefreshCw className="h-4 w-4 text-green-400" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={undoMove}
                disabled={moveHistory.length === 0}
                className="bg-green-950/50 border-green-800 hover:bg-green-900/60 hover:border-green-700 disabled:opacity-30"
              >
                <Undo className="h-4 w-4 text-green-400" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleSound}
                className="bg-green-950/50 border-green-800 hover:bg-green-900/60 hover:border-green-700"
              >
                {soundEnabled ? (
                  <Volume2 className="h-4 w-4 text-green-400" />
                ) : (
                  <VolumeX className="h-4 w-4 text-green-400" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowSettings(true)}
                className="bg-green-950/50 border-green-800 hover:bg-green-900/60 hover:border-green-700"
              >
                <Settings className="h-4 w-4 text-green-400" />
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-green-400 font-mono bg-green-950/50 px-4 py-2 rounded-md border border-green-800">
                Draw: {gameState?.drawCount}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-4 mb-6">
            <DeckPile stock={gameState?.stock || []} onDraw={drawCard} />
            <WastePile waste={gameState?.waste || []} onCardMove={saveGameState} gameState={gameState} />
            <div className="col-span-1"></div>
            {gameState && [0, 1, 2, 3].map((index) => (
              <FoundationPile
                key={`foundation-${index}`}
                pile={gameState.foundations[index]}
                index={index}
                onCardMove={saveGameState}
                gameState={gameState}
              />
            ))}
          </div>

          <div className="grid grid-cols-7 gap-4">
            {gameState && gameState.tableau.map((pile, index) => (
              <TableauPile
                key={`tableau-${index}`}
                pile={pile}
                index={index}
                onCardMove={saveGameState}
                gameState={gameState}
              />
            ))}
          </div>

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
                  <p className="mb-6 text-red-300">You've conquered the game!</p>
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

          {showSettings && (
            <GameSettingsModal settings={gameSettings} onSave={updateSettings} onCancel={() => setShowSettings(false)} />
          )}
        </div>
      </div>
    </main>
  )
}
