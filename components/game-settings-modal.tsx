"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import type { GameSettings } from "@/lib/types"

interface GameSettingsModalProps {
  settings: GameSettings
  onSave: (settings: GameSettings) => void
  onCancel: () => void
}

export function GameSettingsModal({ settings, onSave, onCancel }: GameSettingsModalProps) {
  const [drawCount, setDrawCount] = useState(settings.drawCount)

  const handleSave = () => {
    onSave({
      drawCount,
    })
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gradient-to-b from-gray-900 to-gray-800 p-8 rounded-lg shadow-2xl border border-amber-500 w-full max-w-md"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        transition={{ type: "spring", damping: 15 }}
      >
        <h2 className="text-2xl font-bold mb-6 text-amber-400 font-serif">Game Settings</h2>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-amber-300 mb-3">Draw Count</h3>
          <RadioGroup
            value={drawCount.toString()}
            onValueChange={(value) => setDrawCount(Number.parseInt(value))}
            className="flex flex-col space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="draw-1" className="border-amber-500 text-amber-500" />
              <Label htmlFor="draw-1" className="text-amber-200">
                Draw 1 Card
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3" id="draw-3" className="border-amber-500 text-amber-500" />
              <Label htmlFor="draw-3" className="text-amber-200">
                Draw 3 Cards
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            onClick={onCancel}
            variant="outline"
            className="border-amber-600/50 hover:bg-black/50 hover:border-amber-500 text-amber-400"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white border-none"
          >
            Save Settings
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
