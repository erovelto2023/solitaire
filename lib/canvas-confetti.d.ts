declare module 'canvas-confetti' {
  interface ConfettiConfig {
    particleCount?: number;
    spread?: number;
    origin?: {
      x?: number;
      y?: number;
    };
  }

  function confetti(config?: ConfettiConfig): Promise<null>;
  export default confetti;
}
