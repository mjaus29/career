"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  BookOpen,
  Clock,
  Award,
  Calendar,
  Target,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DailyProgress {
  id: string;
  date: string;
  gfeCards: number;
  femHours: number;
  jsmPercent: number;
  createdAt: string;
  updatedAt: string;
}

interface ChartData {
  date: string;
  gfeCards: number;
  femHours: number;
  jsmPercent: number;
}

export default function DailyTracker() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [gfeCards, setGfeCards] = useState(0);
  const [femHours, setFemHours] = useState(0);
  const [jsmPercent, setJsmPercent] = useState(0);
  const [dailyData, setDailyData] = useState<DailyProgress[]>([]);
  const [loading, setLoading] = useState(true);

  // Constants for 20-day goals
  const GFE_TOTAL_TARGET = 574; // 30 cards * 20 days
  const FEM_TOTAL_TARGET = 80; // 4 hours * 20 days
  const TOTAL_DAYS = 20;

  // Calculate current progress
  const safeData = Array.isArray(dailyData) ? dailyData : [];
  const totalGfeCards = safeData.reduce((sum, day) => sum + day.gfeCards, 0);
  const totalFemHours = safeData.reduce((sum, day) => sum + day.femHours, 0);
  const currentJsmPercent =
    safeData.length > 0
      ? Math.max(...safeData.map((day) => day.jsmPercent))
      : 0;
  const daysCompleted = safeData.length;
  const daysRemaining = Math.max(0, TOTAL_DAYS - daysCompleted);

  // Calculate required daily targets for remaining days
  const gfeCardsNeeded = Math.max(0, GFE_TOTAL_TARGET - totalGfeCards);
  const femHoursNeeded = Math.max(0, FEM_TOTAL_TARGET - totalFemHours);
  const newGfeDaily =
    daysRemaining > 0 ? Math.ceil(gfeCardsNeeded / daysRemaining) : 0;
  const newFemDaily =
    daysRemaining > 0 ? (femHoursNeeded / daysRemaining).toFixed(1) : 0;

  // Progress percentages
  const gfePercent = Math.min((totalGfeCards / GFE_TOTAL_TARGET) * 100, 100);
  const femPercent = Math.min((totalFemHours / FEM_TOTAL_TARGET) * 100, 100);

  // Load data from database
  useEffect(() => {
    loadDailyData();
  }, []);

  // Load data for selected date - always show what's in the database
  useEffect(() => {
    const safeData = Array.isArray(dailyData) ? dailyData : [];

    // Fix timezone issue: use local date components
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const today = `${year}-${month}-${day}`;

    const dayData = safeData.find((day) => {
      const dayDate = new Date(day.date).toISOString().split("T")[0];
      return dayDate === today;
    });

    // Always load database data if it exists
    if (dayData) {
      setGfeCards(dayData.gfeCards);
      setFemHours(dayData.femHours);
      setJsmPercent(dayData.jsmPercent);
    } else {
      // Only reset to defaults if no database data exists AND we're loading fresh data
      if (safeData.length === 0 || loading) {
        setGfeCards(0);
        setFemHours(0);
        setJsmPercent(currentJsmPercent > 0 ? currentJsmPercent : 0);
      }
    }
  }, [selectedDate, dailyData, currentJsmPercent, loading]);

  const loadDailyData = async () => {
    try {
      const response = await fetch("/api/daily-progress");
      const data = await response.json();
      setDailyData(data);
    } catch (error) {
      console.error("Failed to load daily progress:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async () => {
    try {
      // Store current values before save
      const currentValues = { gfeCards, femHours, jsmPercent };

      // Fix timezone issue: use local date components instead of toISOString()
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      const response = await fetch("/api/daily-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: dateString,
          gfeCards,
          femHours,
          jsmPercent,
        }),
      });

      if (response.ok) {
        // Reload data first
        await loadDailyData();

        // Then ensure form shows the saved values
        setGfeCards(currentValues.gfeCards);
        setFemHours(currentValues.femHours);
        setJsmPercent(currentValues.jsmPercent);
      } else {
        console.error(
          "Failed to save progress - server error:",
          response.status
        );
      }
    } catch (error) {
      console.error("Failed to save progress:", error);
    }
  };

  // Prepare chart data
  const chartData: ChartData[] = safeData.map((day) => ({
    date: new Date(day.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    gfeCards: day.gfeCards,
    femHours: day.femHours,
    jsmPercent: day.jsmPercent,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <TrendingUp className="w-12 h-12 text-purple-400" />
            Daily Learning Tracker
          </h1>
          <p className="text-purple-300 text-lg">
            20-Day Challenge: 100% JSM Next.js • 574 GFE Cards • 80 FEM Hours
          </p>
        </div>

        {/* Date Picker */}
        <div className="mb-8 flex justify-center relative z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-6 h-6 text-purple-400" />
              <label className="text-white font-semibold">Select Date:</label>
            </div>
            <DatePicker
              selected={selectedDate}
              onChange={(date: Date | null) => date && setSelectedDate(date)}
              dateFormat="MMMM d, yyyy"
              maxDate={new Date()}
              className="bg-gray-700/50 text-white border border-gray-600 rounded-lg p-3 w-48"
              portalId="date-picker-portal"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* JSM Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-green-400" />
                <h2 className="text-3xl font-bold text-white">JSM</h2>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-green-400">
                  {jsmPercent}%
                </div>
                <div className="text-sm text-gray-400">complete</div>
              </div>
            </div>

            <div className="relative h-8 bg-gray-700/50 rounded-full overflow-hidden mb-4">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-4"
                style={{ width: `${jsmPercent}%` }}
              >
                <span className="text-sm font-bold text-white">✓</span>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setJsmPercent(Math.max(0, jsmPercent - 5))}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
              >
                -5%
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={jsmPercent}
                onChange={(e) => setJsmPercent(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
              />
              <button
                onClick={() => setJsmPercent(Math.min(100, jsmPercent + 5))}
                className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors"
              >
                +5%
              </button>
            </div>

            <div className="text-center">
              <input
                type="number"
                value={jsmPercent}
                onChange={(e) =>
                  setJsmPercent(
                    Math.max(0, Math.min(100, Number(e.target.value)))
                  )
                }
                className="bg-gray-700/50 text-white border border-gray-600 rounded-lg p-2 w-20 text-center"
                min="0"
                max="100"
              />
            </div>
          </div>
          {/* GFE Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-blue-400" />
                <h2 className="text-3xl font-bold text-white">GFE Cards</h2>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-blue-400">
                  {gfeCards}
                </div>
                <div className="text-sm text-gray-400">today</div>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setGfeCards(Math.max(0, gfeCards - 5))}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
              >
                -5
              </button>
              <input
                type="range"
                min="0"
                max="50"
                value={gfeCards}
                onChange={(e) => setGfeCards(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <button
                onClick={() => setGfeCards(gfeCards + 5)}
                className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors"
              >
                +5
              </button>
            </div>

            <div className="text-center">
              <input
                type="number"
                value={gfeCards}
                onChange={(e) => setGfeCards(Number(e.target.value))}
                className="bg-gray-700/50 text-white border border-gray-600 rounded-lg p-2 w-20 text-center"
                min="0"
              />
            </div>
          </div>

          {/* FEM Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-orange-400" />
                <h2 className="text-3xl font-bold text-white">FEM Hours</h2>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-orange-400">
                  {femHours}h
                </div>
                <div className="text-sm text-gray-400">today</div>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setFemHours(Math.max(0, femHours - 0.5))}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
              >
                -0.5h
              </button>
              <input
                type="range"
                min="0"
                max="8"
                step="0.5"
                value={femHours}
                onChange={(e) => setFemHours(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <button
                onClick={() => setFemHours(femHours + 0.5)}
                className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg transition-colors"
              >
                +0.5h
              </button>
            </div>

            <div className="text-center">
              <input
                type="number"
                value={femHours}
                onChange={(e) => setFemHours(Number(e.target.value))}
                step="0.5"
                className="bg-gray-700/50 text-white border border-gray-600 rounded-lg p-2 w-20 text-center"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="text-center mb-8">
          <button
            onClick={saveProgress}
            className="px-8 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-colors shadow-lg"
          >
            Save Progress
          </button>
        </div>

        {/* Progress Charts */}
        {chartData.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-green-400" />
                JSM Progress
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#F9FAFB",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="jsmPercent"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-400" />
                GFE Cards Progress
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#F9FAFB",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="gfeCards"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-orange-400" />
                FEM Hours Progress
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#F9FAFB",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="femHours"
                    stroke="#F97316"
                    strokeWidth={3}
                    dot={{ fill: "#F97316", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Overall Progress & Dynamic Targets */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Overall Progress */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Award className="w-6 h-6 text-purple-400" />
              Overall Progress
            </h3>

            {/* JSM Progress */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-semibold">JSM Complete</span>
                <span className="text-green-400 font-bold">
                  {currentJsmPercent}%
                </span>
              </div>
              <div className="relative h-4 bg-gray-700/50 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${currentJsmPercent}%` }}
                ></div>
              </div>
            </div>

            {/* GFE Progress */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-semibold">GFE Cards</span>
                <span className="text-blue-400 font-bold">
                  {totalGfeCards} / {GFE_TOTAL_TARGET}
                </span>
              </div>
              <div className="relative h-4 bg-gray-700/50 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${gfePercent}%` }}
                ></div>
              </div>
              <div className="text-right mt-1">
                <span className="text-sm text-gray-400">
                  {Math.round(gfePercent)}% complete
                </span>
              </div>
            </div>

            {/* FEM Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-semibold">FEM Hours</span>
                <span className="text-orange-400 font-bold">
                  {totalFemHours.toFixed(1)} / {FEM_TOTAL_TARGET}
                </span>
              </div>
              <div className="relative h-4 bg-gray-700/50 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${femPercent}%` }}
                ></div>
              </div>
              <div className="text-right mt-1">
                <span className="text-sm text-gray-400">
                  {Math.round(femPercent)}% complete
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Targets */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Target className="w-6 h-6 text-green-400" />
              Adjusted Daily Targets
            </h3>

            <div className="space-y-4">
              <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="text-2xl font-bold text-green-400">
                  {daysCompleted} / {TOTAL_DAYS}
                </div>
                <div className="text-sm text-gray-400">Days Completed</div>
              </div>

              {daysRemaining > 0 ? (
                <>
                  <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="text-2xl font-bold text-blue-400">
                      {newGfeDaily} cards
                    </div>
                    <div className="text-sm text-gray-400">
                      per day for {daysRemaining} remaining days
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {gfeCardsNeeded} cards still needed
                    </div>
                  </div>

                  <div className="text-center p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <div className="text-2xl font-bold text-orange-400">
                      {newFemDaily} hours
                    </div>
                    <div className="text-sm text-gray-400">
                      per day for {daysRemaining} remaining days
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {femHoursNeeded.toFixed(1)} hours still needed
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <div className="text-xl font-bold text-purple-400">
                    🎉 Challenge Complete!
                  </div>
                  <div className="text-sm text-gray-400">
                    You've finished your 20-day journey
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {safeData.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6">
              Recent Activity
            </h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...safeData]
                .reverse()
                .slice(0, 8)
                .map((day) => (
                  <div
                    key={day.id}
                    className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50"
                  >
                    <div className="text-sm text-gray-400 mb-2">
                      {new Date(day.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-green-400 font-semibold">
                        {day.jsmPercent}%
                      </div>
                      <div className="text-blue-400 font-semibold">
                        {day.gfeCards} cards
                      </div>
                      <div className="text-orange-400 font-semibold">
                        {day.femHours}h
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
