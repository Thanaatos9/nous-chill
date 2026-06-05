"use client";

import { useEffect, useState } from "react";

const PIP_POSITIONS: Record<number, number[][]> = {
  1: [[1, 1]],
  2: [[0, 2], [2, 0]],
  3: [[0, 2], [1, 1], [2, 0]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
};

interface DieProps {
  value: number;
  rolling: boolean;
  delay?: number;
}

export default function Die({ value, rolling, delay = 0 }: DieProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!rolling) {
      setVisible(false);
      const t = setTimeout(() => setVisible(true), delay + 50);
      return () => clearTimeout(t);
    }
  }, [value, rolling, delay]);

  const pips = PIP_POSITIONS[value] || [];

  return (
    <div
      className={`relative flex items-center justify-center ${rolling ? "die-rolling" : "die-glow"}`}
      style={{ animationDelay: rolling ? `${delay}ms` : "0ms" }}
    >
      {/* Die face */}
      <div
        className="relative w-36 h-36 rounded-2xl"
        style={{
          background: "linear-gradient(145deg, #1e1b4b, #0f0c2e)",
          border: "2px solid rgba(139, 92, 246, 0.5)",
          boxShadow: "inset 0 2px 4px rgba(255,255,255,0.05), inset 0 -2px 4px rgba(0,0,0,0.5)",
        }}
      >
        {/* Pip grid */}
        <div className="absolute inset-4 grid grid-cols-3 grid-rows-3">
          {Array.from({ length: 9 }, (_, i) => {
            const row = Math.floor(i / 3);
            const col = i % 3;
            const hasPip = pips.some(([r, c]) => r === row && c === col);
            return (
              <div key={i} className="flex items-center justify-center">
                {hasPip && visible && (
                  <div
                    className="pip-appear rounded-full"
                    style={{
                      width: "18px",
                      height: "18px",
                      background: "radial-gradient(circle at 35% 35%, #c4b5fd, #7c3aed)",
                      boxShadow: "0 0 8px rgba(139, 92, 246, 0.8)",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
