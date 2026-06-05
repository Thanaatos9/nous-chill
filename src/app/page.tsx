"use client";

import { useState, useCallback } from "react";
import Die from "@/components/Die";

function rollD6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export default function Home() {
  const [dice, setDice] = useState<[number, number]>([1, 1]);
  const [rolling, setRolling] = useState(false);
  const [total, setTotal] = useState<number | null>(null);
  const [rollCount, setRollCount] = useState(0);

  const roll = useCallback(() => {
    if (rolling) return;
    setRolling(true);
    setTotal(null);

    setTimeout(() => {
      const d1 = rollD6();
      const d2 = rollD6();
      setDice([d1, d2]);
      setRolling(false);
      setTotal(d1 + d2);
      setRollCount((c) => c + 1);
    }, 750);
  }, [rolling]);

  const isCritical = total === 12;
  const isSnakeEyes = dice[0] === 1 && dice[1] === 1;

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center select-none"
      style={{
        background: "radial-gradient(ellipse at center, #1a0533 0%, #0d0d1a 60%, #000000 100%)",
      }}
    >
      {/* Title */}
      <div className="mb-12 text-center">
        <h1
          className="text-5xl font-black tracking-widest uppercase"
          style={{
            background: "linear-gradient(135deg, #c4b5fd, #7c3aed, #4f46e5)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 20px rgba(139, 92, 246, 0.5))",
          }}
        >
          Dice Forge
        </h1>
        <p className="mt-2 text-purple-400/60 text-sm tracking-[0.3em] uppercase">
          Lance les dés
        </p>
      </div>

      {/* Dice area */}
      <div className="flex items-center gap-10 mb-12">
        <Die value={dice[0]} rolling={rolling} delay={0} />
        <div
          className="text-3xl font-bold"
          style={{ color: "rgba(139, 92, 246, 0.4)" }}
        >
          +
        </div>
        <Die value={dice[1]} rolling={rolling} delay={80} />
      </div>

      {/* Result */}
      <div className="mb-12 h-20 flex flex-col items-center justify-center">
        {total !== null && !rolling && (
          <div className="result-pop text-center">
            <span
              className="text-7xl font-black"
              style={{
                background: isCritical
                  ? "linear-gradient(135deg, #ffd700, #ff8c00)"
                  : "linear-gradient(135deg, #f0abfc, #a855f7)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: isCritical
                  ? "drop-shadow(0 0 20px rgba(255, 215, 0, 0.6))"
                  : "drop-shadow(0 0 20px rgba(168, 85, 247, 0.5))",
              }}
            >
              {total}
            </span>
            <p className="text-sm tracking-widest uppercase mt-1" style={{ color: "rgba(196, 181, 253, 0.5)" }}>
              {isCritical ? "CRITICAL !" : isSnakeEyes ? "Snake Eyes..." : `= ${dice[0]} + ${dice[1]}`}
            </p>
          </div>
        )}
        {rolling && (
          <div className="text-purple-400/40 text-2xl tracking-widest animate-pulse">
            ...
          </div>
        )}
      </div>

      {/* Roll button */}
      <button
        onClick={roll}
        disabled={rolling}
        className="group relative px-16 py-5 rounded-full font-bold text-lg tracking-widest uppercase transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: rolling
            ? "rgba(109, 40, 217, 0.3)"
            : "linear-gradient(135deg, #7c3aed, #4f46e5)",
          boxShadow: rolling
            ? "none"
            : "0 0 30px rgba(124, 58, 237, 0.4), 0 4px 15px rgba(0,0,0,0.4)",
          border: "1px solid rgba(196, 181, 253, 0.2)",
          color: "#e9d5ff",
          transform: rolling ? "scale(0.97)" : "scale(1)",
        }}
      >
        {rolling ? "Rolling..." : "Lancer les dés"}
      </button>

      {/* Roll counter */}
      {rollCount > 0 && (
        <p className="mt-8 text-purple-900/60 text-xs tracking-widest">
          {rollCount} {rollCount === 1 ? "lancer" : "lancers"}
        </p>
      )}
    </main>
  );
}
