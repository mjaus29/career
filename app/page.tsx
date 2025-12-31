"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, BookOpen, Clock, Award } from "lucide-react";

interface ProgressItem {
  name: string;
  value: number;
  target: number | null;
  unit: string;
}

export default function ProgressDashboard() {
  const [jsm, setJsm] = useState(0);
  const [gfe, setGfe] = useState(0);
  const [fem, setFem] = useState(0);
  const [loading, setLoading] = useState(true);

  const gfeTarget = 574;
  const femTarget = 4;

  const gfePercent = Math.min((gfe / gfeTarget) * 100, 100);
  const femPercent = Math.min((fem / femTarget) * 100, 100);

  // Load data from database
  useEffect(() => {
    async function loadProgress() {
      try {
        const response = await fetch("/api/progress");
        const data = await response.json();

        data.forEach((item: ProgressItem) => {
          if (item.name === "JSM") setJsm(item.value);
          if (item.name === "GFE") setGfe(item.value);
          if (item.name === "FEM") setFem(item.value);
        });
      } catch (error) {
        console.error("Failed to load progress:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProgress();
  }, []);

  // Save to database
  const saveProgress = async (
    name: string,
    value: number,
    target: number | null,
    unit: string
  ) => {
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, value, target, unit }),
      });
    } catch (error) {
      console.error("Failed to save progress:", error);
    }
  };

  const updateJsm = (value: number) => {
    setJsm(value);
    saveProgress("JSM", value, 100, "percent");
  };

  const updateGfe = (value: number) => {
    setGfe(value);
    saveProgress("GFE", value, gfeTarget, "flashcards");
  };

  const updateFem = (value: number) => {
    setFem(value);
    saveProgress("FEM", value, femTarget, "hours");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <TrendingUp className="w-12 h-12 text-purple-400" />
            Progress Dashboard
          </h1>
          <p className="text-purple-300 text-lg">Track your learning journey</p>
        </div>

        <div className="grid gap-6">
          {/* JSM Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-green-400" />
                <h2 className="text-3xl font-bold text-white">JSM</h2>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-green-400">{jsm}%</div>
                <div className="text-sm text-gray-400">Complete</div>
              </div>
            </div>

            <div className="relative h-8 bg-gray-700/50 rounded-full overflow-hidden mb-4">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-4"
                style={{ width: `${jsm}%` }}
              >
                <span className="text-sm font-bold text-white">✓</span>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={jsm}
              onChange={(e) => updateJsm(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
          </div>

          {/* GFE Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-blue-400" />
                <h2 className="text-3xl font-bold text-white">GFE</h2>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-blue-400">{gfe}</div>
                <div className="text-sm text-gray-400">
                  of {gfeTarget} flashcards
                </div>
              </div>
            </div>

            <div className="relative h-8 bg-gray-700/50 rounded-full overflow-hidden mb-4">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-4"
                style={{ width: `${gfePercent}%` }}
              >
                <span className="text-sm font-bold text-white">
                  {Math.round(gfePercent)}%
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => updateGfe(Math.max(0, gfe - 10))}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
              >
                -10
              </button>
              <input
                type="range"
                min="0"
                max={gfeTarget}
                value={gfe}
                onChange={(e) => updateGfe(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <button
                onClick={() => updateGfe(Math.min(gfeTarget, gfe + 10))}
                className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors"
              >
                +10
              </button>
            </div>
          </div>

          {/* FEM Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-orange-400" />
                <h2 className="text-3xl font-bold text-white">FEM</h2>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-orange-400">{fem}h</div>
                <div className="text-sm text-gray-400">
                  daily / {femTarget}h target
                </div>
              </div>
            </div>

            <div className="relative h-8 bg-gray-700/50 rounded-full overflow-hidden mb-4">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-4"
                style={{ width: `${femPercent}%` }}
              >
                <span className="text-sm font-bold text-white">
                  {Math.round(femPercent)}%
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => updateFem(Math.max(0, fem - 0.5))}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
              >
                -0.5h
              </button>
              <input
                type="range"
                min="0"
                max={femTarget}
                step="0.5"
                value={fem}
                onChange={(e) => updateFem(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <button
                onClick={() => updateFem(Math.min(femTarget, fem + 0.5))}
                className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg transition-colors"
              >
                +0.5h
              </button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-8 bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-4">
            Overall Progress
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-green-400">{jsm}%</div>
              <div className="text-sm text-gray-400">JSM Complete</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400">
                {Math.round(gfePercent)}%
              </div>
              <div className="text-sm text-gray-400">GFE Progress</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-400">
                {Math.round(femPercent)}%
              </div>
              <div className="text-sm text-gray-400">FEM Daily Goal</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
