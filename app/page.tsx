"use client"

import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { TouchBackend } from "react-dnd-touch-backend"
import { ThemeProvider } from "next-themes"
import { Solitaire } from "@/components/solitaire"
import Image from "next/image"
import { useEffect, useState } from "react"

export default function Home() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.matchMedia("(max-width: 768px)").matches)
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <DndProvider backend={isMobile ? TouchBackend : HTML5Backend}>
        <div className="relative min-h-screen bg-gradient-to-br from-red-900 via-red-950 to-red-900 overflow-hidden">
          {/* Character images */}
          <div className="absolute left-[5%] top-[50%] -translate-y-1/2 w-48 h-[600px] pointer-events-none">
            <div className="relative w-full h-full">
              <Image
                src="/images/mario.png"
                alt="Mario"
                fill
                style={{ objectFit: "contain" }}
                className="drop-shadow-2xl"
                priority
              />
            </div>
          </div>
          <div className="absolute right-[5%] top-[50%] -translate-y-1/2 w-48 h-[600px] pointer-events-none">
            <div className="relative w-full h-full">
              <Image
                src="/images/zoey.png"
                alt="Zoey"
                fill
                style={{ objectFit: "contain" }}
                className="drop-shadow-2xl"
                priority
              />
            </div>
          </div>

          {/* Game content */}
          <main className="relative z-10 flex min-h-screen flex-col items-center justify-start pt-8">
            <div className="w-full max-w-5xl mx-auto px-4">
              <h1 className="text-5xl font-bold text-center mb-8 text-yellow-500 drop-shadow-lg font-serif tracking-wide">
                Zoey & Mario's
                <span className="block text-4xl mt-2 text-yellow-400">Ruby Casino Solitaire</span>
              </h1>

              <div className="relative">
                <div className="absolute inset-0 bg-green-950 rounded-xl shadow-2xl transform rotate-1"></div>
                <div className="absolute inset-0 bg-green-950 rounded-xl shadow-2xl transform -rotate-1"></div>
                <div className="relative bg-green-900 rounded-xl p-8 shadow-2xl border-4 border-green-950">
                  <Solitaire />
                </div>
              </div>
            </div>
          </main>
        </div>
      </DndProvider>
    </ThemeProvider>
  )
}
