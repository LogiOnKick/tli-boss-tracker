import React, { useState, useEffect, useRef } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  BarChart2,
  Calculator,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  X,
  TrendingUp,
  GitCompareArrows,
} from "lucide-react";

/* Additional CSS for the app */
const globalStyles = `
  /* Remove spinner buttons from number inputs across all browsers */
  input[type=number]::-webkit-inner-spin-button, 
  input[type=number]::-webkit-outer-spin-button { 
    -webkit-appearance: none; 
    margin: 0; 
  }
  input[type=number] {
    -moz-appearance: textfield; /* Firefox */
    appearance: textfield; /* Other browsers */
  }
  /* Simple loading indicator style */
  .initial-loading {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #111827; /* bg-gray-900 */
    color: #D1D5DB; /* text-gray-300 */
    font-family: sans-serif;
    font-size: 1.5rem;
  }
`;

// --- Helper function for localStorage ---
const loadState = (key, defaultValue) => {
  try {
    const serializedState = localStorage.getItem(key);
    if (serializedState === null) {
      return defaultValue;
    }
    // Ensure numeric values that might have been stored as strings are parsed correctly
    const parsed = JSON.parse(serializedState);
    if (typeof defaultValue === "object" && defaultValue !== null) {
      for (const k in defaultValue) {
        if (typeof defaultValue[k] === "number" && typeof parsed[k] === "string") {
          parsed[k] = parseFloat(parsed[k]);
          if (isNaN(parsed[k])) parsed[k] = defaultValue[k]; // Fallback if parsing fails
        }
      }
    }
    return parsed;
  } catch (e) {
    console.warn(`Error loading state for key "${key}" from localStorage:`, e);
    return defaultValue;
  }
};

const saveState = (key, state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(key, serializedState);
  } catch (e) {
    console.warn(`Error saving state for key "${key}" to localStorage:`, e);
  }
};

// Main App Component
export default function App() {
  const [currentPage, setCurrentPage] = useState(() => loadState("currentPage", "tracker"));
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupAction, setPopupAction] = useState(null);
  const [isLoadingStyles, setIsLoadingStyles] = useState(true); // State to track Tailwind loading

  // Load Tailwind CSS via CDN and manage loading state
  useEffect(() => {
    const scriptId = "tailwind-cdn-script";
    let script = document.getElementById(scriptId);

    const handleLoad = () => {
      // Use requestAnimationFrame to wait for styles to apply (might help)
      requestAnimationFrame(() => setIsLoadingStyles(false));
    };

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://cdn.tailwindcss.com";
      script.onload = handleLoad;
      // Handle potential script loading errors
      script.onerror = () => {
        console.error("Tailwind CDN script failed to load.");
        setIsLoadingStyles(false); // Stop loading even if script fails
      };
      document.head.appendChild(script);
    } else {
      // If script already exists, assume it's loaded or will load
      // Check if Tailwind object is available (simple check)
      if (window.tailwind) {
        handleLoad();
      } else {
        // If script exists but tailwind isn't ready, attach onload listener
        script.addEventListener("load", handleLoad);
        script.addEventListener("error", handleLoad); // Also handle error case
      }
    }

    // Cleanup function to remove listeners if component unmounts before load
    return () => {
      if (script) {
        script.removeEventListener("load", handleLoad);
        script.removeEventListener("error", handleLoad);
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  useEffect(() => {
    saveState("currentPage", currentPage);
  }, [currentPage]);

  const showConfirm = (message, onConfirm) => {
    setPopupMessage(message);
    setPopupAction(() => onConfirm);
    setShowPopup(true);
  };

  const Popup = () => {
    if (!showPopup) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
              <AlertTriangle className="text-yellow-500 mr-3" size={24} />
              <h3 className="text-xl font-semibold text-gray-100">Confirmation</h3>
            </div>
            <button
              onClick={() => setShowPopup(false)}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Close popup"
            >
              <X size={24} />
            </button>
          </div>
          <p className="mb-6 text-gray-300">{popupMessage}</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowPopup(false)}
              className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (popupAction) popupAction();
                setShowPopup(false);
              }}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderPage = () => {
    switch (currentPage) {
      case "tracker":
        return <RunTracker showConfirm={showConfirm} />;
      case "calculator":
        return <ProfitCalculator />;
      case "stratEfficiency":
        return <StratEfficiencyCalculator />;
      default:
        setCurrentPage("tracker"); // Fallback to tracker if unknown page
        return <RunTracker showConfirm={showConfirm} />;
    }
  };

  // Render loading indicator if styles are not ready
  if (isLoadingStyles) {
    return (
      <>
        <style>{globalStyles}</style>
        <div className="initial-loading">Loading Styles...</div>
      </>
    );
  }

  // Render the full app once styles are loaded
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-sans">
      <style>{globalStyles}</style>
      <Popup />

      <header className="bg-gray-800 p-4 shadow-lg">
        <div className="container mx-auto flex flex-wrap justify-between items-center">
          <h1 className="text-3xl font-bold text-purple-400">Logi TLI Boss Tracker</h1>
          <nav className="flex space-x-1 sm:space-x-2 mt-2 sm:mt-0">
            <button
              onClick={() => setCurrentPage("tracker")}
              className={`px-3 py-2 sm:px-4 rounded-md transition-all duration-150 ease-in-out text-xs sm:text-base ${
                currentPage === "tracker" ? "bg-purple-600 text-white shadow-md" : "hover:bg-gray-700 text-gray-300"
              }`}
            >
              <div className="flex items-center space-x-1 sm:space-x-2">
                <BarChart2 size={18} />
                <span>Run Tracker</span>
              </div>
            </button>
            <button
              onClick={() => setCurrentPage("calculator")}
              className={`px-3 py-2 sm:px-4 rounded-md transition-all duration-150 ease-in-out text-xs sm:text-base ${
                currentPage === "calculator" ? "bg-purple-600 text-white shadow-md" : "hover:bg-gray-700 text-gray-300"
              }`}
            >
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Calculator size={18} />
                <span>Profit Calc</span>
              </div>
            </button>
            <button
              onClick={() => setCurrentPage("stratEfficiency")}
              className={`px-3 py-2 sm:px-4 rounded-md transition-all duration-150 ease-in-out text-xs sm:text-base ${
                currentPage === "stratEfficiency"
                  ? "bg-purple-600 text-white shadow-md"
                  : "hover:bg-gray-700 text-gray-300"
              }`}
            >
              <div className="flex items-center space-x-1 sm:space-x-2">
                <GitCompareArrows size={18} />
                <span>Strat Compare</span>
              </div>
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 sm:p-6">{renderPage()}</main>

      <footer className="bg-gray-800 p-4 text-center text-gray-500 text-sm">
        <p>&copy; Logi TLI Boss Tracker - May 2025</p>
      </footer>
    </div>
  );
}

// --- Run Tracker Page Component ---
function RunTracker({ showConfirm }) {
  const initialTimerState = {
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
    isRunning: false,
    elapsedTimeWhenPaused: 0, // Total elapsed milliseconds when paused
    timerStartTime: 0, // Timestamp when timer was last started/resumed
  };
  const initialRunsState = {
    total: 0,
    drops: 0,
    noDrops: 0,
    dropStreak: 0,
    noDropStreak: 0,
    keyCost: 14,
    dropValue: 52,
    marketTax: 12.5,
    totalSpent: 0,
    totalEarned: 0,
    netProfit: 0,
  };

  const [timer, setTimer] = useState(() => loadState("runTrackerTimer", initialTimerState));
  const [runs, setRuns] = useState(() => loadState("runTrackerRuns", initialRunsState));
  const [actionsHistory, setActionsHistory] = useState(() => loadState("runTrackerActionsHistory", []));
  const [profitHistory, setProfitHistory] = useState(() =>
    loadState("runTrackerProfitHistory", [{ run: 0, profit: 0 }])
  );

  // Save states to localStorage
  useEffect(() => {
    saveState("runTrackerTimer", timer);
  }, [timer]);
  useEffect(() => {
    saveState("runTrackerRuns", runs);
  }, [runs]);
  useEffect(() => {
    saveState("runTrackerActionsHistory", actionsHistory);
  }, [actionsHistory]);
  useEffect(() => {
    saveState("runTrackerProfitHistory", profitHistory);
  }, [profitHistory]);

  // useEffect hook for handling the timer logic
  useEffect(() => {
    let interval = null;
    if (timer.isRunning) {
      interval = setInterval(() => {
        const now = Date.now();
        const totalElapsedMilliseconds = timer.elapsedTimeWhenPaused + (now - timer.timerStartTime);

        const totalSeconds = Math.floor(totalElapsedMilliseconds / 1000);
        const milliseconds = totalElapsedMilliseconds % 1000;
        const seconds = totalSeconds % 60;
        const minutes = Math.floor(totalSeconds / 60) % 60;
        const hours = Math.floor(totalSeconds / 3600);

        setTimer((prevTimer) => ({
          ...prevTimer, // Keep isRunning, elapsedTimeWhenPaused, timerStartTime
          hours,
          minutes,
          seconds,
          milliseconds,
        }));
      }, 10); // Update every 10ms
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer.isRunning, timer.timerStartTime, timer.elapsedTimeWhenPaused]);

  // Effect to initialize timer on component mount if it was running
  useEffect(() => {
    if (timer.isRunning && timer.timerStartTime > 0) {
      // If timer was running, recalculate current display based on time passed
      const now = Date.now();
      const totalElapsedMilliseconds = timer.elapsedTimeWhenPaused + (now - timer.timerStartTime);
      const totalSeconds = Math.floor(totalElapsedMilliseconds / 1000);
      const milliseconds = totalElapsedMilliseconds % 1000;
      const currentSeconds = totalSeconds % 60;
      const currentMinutes = Math.floor(totalSeconds / 60) % 60;
      const currentHours = Math.floor(totalSeconds / 3600);
      setTimer((t) => ({ ...t, hours: currentHours, minutes: currentMinutes, seconds: currentSeconds, milliseconds }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount

  const currentTotalElapsedSeconds = timer.isRunning
    ? Math.floor((timer.elapsedTimeWhenPaused + (Date.now() - timer.timerStartTime)) / 1000)
    : Math.floor(timer.elapsedTimeWhenPaused / 1000);

  const runsPerHour =
    currentTotalElapsedSeconds > 0 && runs.total > 0 ? (runs.total / currentTotalElapsedSeconds) * 3600 : 0;

  const expectedProfitPerHour = runs.total > 0 && runsPerHour > 0 ? (runs.netProfit / runs.total) * runsPerHour : 0;

  const startTimer = () => {
    setTimer((prevTimer) => ({
      ...prevTimer,
      isRunning: true,
      timerStartTime: Date.now(), // Set new start time
      // elapsedTimeWhenPaused remains the same as it's the base
    }));
  };

  const pauseTimer = () => {
    setTimer((prevTimer) => ({
      ...prevTimer,
      isRunning: false,
      elapsedTimeWhenPaused: prevTimer.elapsedTimeWhenPaused + (Date.now() - prevTimer.timerStartTime),
      // timerStartTime is now irrelevant until resume
    }));
  };

  const resetTimer = () => {
    setTimer(initialTimerState); // Reset to initial, localStorage will pick it up
  };

  const calculateNetProfit = (grossProfit) => {
    const tax = grossProfit * (runs.marketTax / 100);
    return grossProfit - tax;
  };

  const handleDrop = () => {
    const runCost = parseFloat(runs.keyCost) || 0;
    const dropGrossValue = parseFloat(runs.dropValue) || 0;
    const dropNetValue = calculateNetProfit(dropGrossValue);

    setActionsHistory((prev) => [...prev, { runs: { ...runs }, profitHistory: [...profitHistory] }]);

    const newRuns = {
      ...runs,
      total: runs.total + 1,
      drops: runs.drops + 1,
      dropStreak: runs.dropStreak + 1,
      noDropStreak: 0,
      totalSpent: runs.totalSpent + runCost,
      totalEarned: runs.totalEarned + dropNetValue,
      netProfit: runs.totalEarned + dropNetValue - (runs.totalSpent + runCost),
    };
    setRuns(newRuns);
    setProfitHistory((prev) => [...prev, { run: newRuns.total, profit: newRuns.netProfit }]);
  };

  const handleNoDrop = () => {
    const runCost = parseFloat(runs.keyCost) || 0;
    setActionsHistory((prev) => [...prev, { runs: { ...runs }, profitHistory: [...profitHistory] }]);
    const newRuns = {
      ...runs,
      total: runs.total + 1,
      noDrops: runs.noDrops + 1,
      noDropStreak: runs.noDropStreak + 1,
      dropStreak: 0,
      totalSpent: runs.totalSpent + runCost,
      netProfit: runs.totalEarned - (runs.totalSpent + runCost),
    };
    setRuns(newRuns);
    setProfitHistory((prev) => [...prev, { run: newRuns.total, profit: newRuns.netProfit }]);
  };

  const handleUndo = () => {
    if (actionsHistory.length > 0) {
      const lastAction = actionsHistory[actionsHistory.length - 1];
      setRuns(lastAction.runs);
      setProfitHistory(lastAction.profitHistory);
      setActionsHistory(actionsHistory.slice(0, -1));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = value === "" ? "" : parseFloat(value);
    setRuns((prevRuns) => ({
      ...prevRuns,
      [name]: parsedValue === "" ? "" : isNaN(parsedValue) ? 0 : parsedValue,
    }));
  };

  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    if (value === "" && (name === "keyCost" || name === "dropValue")) {
      // Only for numeric fields that should default to 0
      setRuns((prevRuns) => ({
        ...prevRuns,
        [name]: 0,
      }));
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-5 sm:p-6 rounded-xl shadow-xl flex flex-col">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 flex items-center text-purple-300">
            <Clock className="mr-2" size={24} /> Run Timer
          </h2>
          <div className="text-4xl sm:text-5xl font-mono text-center mb-4 text-gray-100 tabular-nums">
            {String(timer.hours).padStart(2, "0")}:{String(timer.minutes).padStart(2, "0")}:
            {String(timer.seconds).padStart(2, "0")}.
            <span className="text-2xl sm:text-3xl">{String(timer.milliseconds).padStart(3, "0").slice(0, 2)}</span>
          </div>
          <div className="flex justify-center space-x-3 sm:space-x-4 mb-4">
            {!timer.isRunning ? (
              <button
                onClick={startTimer}
                className="bg-green-600 hover:bg-green-500 p-3 rounded-full shadow-md transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-400"
                aria-label="Start timer"
              >
                <Play size={28} className="text-white" />
              </button>
            ) : (
              <button
                onClick={pauseTimer}
                className="bg-yellow-500 hover:bg-yellow-400 p-3 rounded-full shadow-md transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                aria-label="Pause timer"
              >
                <Pause size={28} className="text-white" />
              </button>
            )}
            <button
              onClick={resetTimer}
              className="bg-red-600 hover:bg-red-500 p-3 rounded-full shadow-md transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-400"
              aria-label="Reset timer"
            >
              <RotateCcw size={28} className="text-white" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <button
              onClick={handleDrop}
              className="bg-green-600 hover:bg-green-500 p-3 rounded-lg shadow-md transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center">
                <div className="flex items-center">
                  <CheckCircle size={20} className="mr-1 sm:mr-2 text-white" />
                  <span className="font-semibold text-sm sm:text-base text-white">Got Drop!</span>
                </div>
                <div className="bg-green-700 rounded-full px-2 py-0.5 text-xs sm:text-sm font-bold text-white mt-1 sm:mt-0">
                  {runs.dropStreak}
                </div>
              </div>
            </button>
            <button
              onClick={handleNoDrop}
              className="bg-red-600 hover:bg-red-500 p-3 rounded-lg shadow-md transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center">
                <div className="flex items-center">
                  <XCircle size={20} className="mr-1 sm:mr-2 text-white" />
                  <span className="font-semibold text-sm sm:text-base text-white">No Drop</span>
                </div>
                <div className="bg-red-700 rounded-full px-2 py-0.5 text-xs sm:text-sm font-bold text-white mt-1 sm:mt-0">
                  {runs.noDropStreak}
                </div>
              </div>
            </button>
          </div>
          <button
            onClick={handleUndo}
            disabled={actionsHistory.length === 0}
            className={`mt-4 py-2.5 rounded-lg shadow-md transition-all active:scale-95 w-full flex justify-center items-center focus:outline-none focus:ring-2 ${
              actionsHistory.length === 0
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-yellow-500 hover:bg-yellow-400 text-white focus:ring-yellow-300"
            }`}
          >
            <div className="flex items-center">
              <RotateCcw size={20} className="mr-2" />
              <span className="font-semibold text-sm sm:text-base">Undo Last Run</span>
            </div>
          </button>
        </div>

        <div className="bg-gray-800 p-5 sm:p-6 rounded-xl shadow-xl">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-purple-300">Run Configuration</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="keyCost" className="block text-sm font-medium text-gray-400 mb-1">
                Key Cost (FE)
              </label>
              <input
                id="keyCost"
                type="number"
                name="keyCost"
                value={runs.keyCost}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder="e.g. 14"
                className="w-full bg-gray-700 text-white rounded-md p-2.5 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none"
              />
            </div>
            <div>
              <label htmlFor="dropValue" className="block text-sm font-medium text-gray-400 mb-1">
                Drop Value (FE)
              </label>
              <input
                id="dropValue"
                type="number"
                name="dropValue"
                value={runs.dropValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder="e.g. 52"
                className="w-full bg-gray-700 text-white rounded-md p-2.5 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-5 sm:p-6 rounded-xl shadow-xl">
          <div className="flex flex-wrap justify-between items-center mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-purple-300">Run Statistics</h2>
            <button
              onClick={() => {
                showConfirm("Are you sure you want to reset all statistics? This action cannot be undone.", () => {
                  setRuns((prev) => ({
                    ...initialRunsState,
                    keyCost: prev.keyCost,
                    dropValue: prev.dropValue,
                    marketTax: prev.marketTax,
                  })); // Keep config
                  setProfitHistory([{ run: 0, profit: 0 }]);
                  setActionsHistory([]);
                  resetTimer();
                });
              }}
              className="bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded-md text-sm text-white shadow transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              Reset Stats
            </button>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:gap-y-4">
            <div>
              <p className="text-xs sm:text-sm text-gray-400">Total Runs</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-100">{runs.total}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-400">Total Drops</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-100">{runs.drops}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-400">Drop Rate</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-100">
                {runs.total > 0 ? ((runs.drops / runs.total) * 100).toFixed(1) + "%" : "0.0%"}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-400">Runs/Hour</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-100">{runsPerHour.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-400">Total Spent</p>
              <p className="text-xl sm:text-2xl font-bold text-red-400">{runs.totalSpent.toFixed(1)} FE</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-400">Total Earned (Net)</p>
              <p className="text-xl sm:text-2xl font-bold text-green-400">{runs.totalEarned.toFixed(1)} FE</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-400">Net Profit</p>
              <p className={`text-xl sm:text-2xl font-bold ${runs.netProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                {runs.netProfit.toFixed(1)} FE
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-400">Est. Profit/Hour</p>
              <p
                className={`text-xl sm:text-2xl font-bold ${
                  expectedProfitPerHour >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {expectedProfitPerHour.toFixed(1)} FE/hr
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-800 p-5 sm:p-6 rounded-xl shadow-xl mt-6">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-purple-300">Profit Over Runs</h2>
        <div className="h-64 sm:h-72">
          <ProfitChart data={profitHistory} />
        </div>
      </div>
    </div>
  );
}

// --- Profit Calculator Page Component ---
const ProfitCalculator = () => {
  const initialCalcState = {
    keyCost: 14,
    dropValue: 52,
    dropRate: 50,
    runsPerHour: 80,
    numberOfRuns: 80,
    marketTax: 12.5,
  };
  const [calc, setCalc] = useState(() => loadState("profitCalculatorState", initialCalcState));

  useEffect(() => {
    saveState("profitCalculatorState", calc);
  }, [calc]);

  const expectedDrops = (parseFloat(calc.numberOfRuns) || 0) * ((parseFloat(calc.dropRate) || 0) / 100);
  const grossProfitFromDrops = expectedDrops * (parseFloat(calc.dropValue) || 0);
  const taxAmountOnDrops = grossProfitFromDrops * ((parseFloat(calc.marketTax) || 0) / 100);
  const netProfitFromDrops = grossProfitFromDrops - taxAmountOnDrops;
  const totalCostOfRuns = (parseFloat(calc.keyCost) || 0) * (parseFloat(calc.numberOfRuns) || 0);
  const calcRunsPerHour = parseFloat(calc.runsPerHour) || 0;
  const calcNumberOfRuns = parseFloat(calc.numberOfRuns) || 0;

  const results = {
    totalCost: totalCostOfRuns,
    expectedDrops: expectedDrops,
    grossProfit: grossProfitFromDrops,
    taxAmount: taxAmountOnDrops,
    netProfit: netProfitFromDrops - totalCostOfRuns,
    timeNeeded: calcRunsPerHour > 0 ? calcNumberOfRuns / calcRunsPerHour : 0,
    profitPerHour:
      calcRunsPerHour > 0 && calcNumberOfRuns > 0
        ? (netProfitFromDrops - totalCostOfRuns) / (calcNumberOfRuns / calcRunsPerHour)
        : 0,
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = value === "" ? "" : parseFloat(value);
    setCalc((prevCalc) => ({
      ...prevCalc,
      [name]: parsedValue === "" ? "" : isNaN(parsedValue) ? 0 : parsedValue,
    }));
  };

  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    if (value === "") {
      setCalc((prevCalc) => ({ ...prevCalc, [name]: 0 }));
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
      <div className="bg-gray-800 p-5 sm:p-6 rounded-xl shadow-xl">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-purple-300">Profit Projections</h2>
        <div className="space-y-4">
          {/* Input fields remain the same, ensure 'value' prop uses calc state */}
          <div>
            <label htmlFor="calcKeyCost" className="block text-sm font-medium text-gray-400 mb-1">
              Key Cost (FE)
            </label>
            <input
              id="calcKeyCost"
              type="number"
              name="keyCost"
              value={calc.keyCost}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              placeholder="e.g. 14"
              className="w-full bg-gray-700 text-white rounded-md p-2.5 focus:ring-2 focus:ring-purple-400 outline-none"
            />
          </div>
          <div>
            <label htmlFor="calcDropValue" className="block text-sm font-medium text-gray-400 mb-1">
              Drop Value (FE)
            </label>
            <input
              id="calcDropValue"
              type="number"
              name="dropValue"
              value={calc.dropValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              placeholder="e.g. 52"
              className="w-full bg-gray-700 text-white rounded-md p-2.5 focus:ring-2 focus:ring-purple-400 outline-none"
            />
          </div>
          <div>
            <label htmlFor="calcDropRate" className="block text-sm font-medium text-gray-400 mb-1">
              Drop Rate (%)
            </label>
            <input
              id="calcDropRate"
              type="number"
              name="dropRate"
              value={calc.dropRate}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              placeholder="e.g. 50"
              min="0"
              max="100"
              className="w-full bg-gray-700 text-white rounded-md p-2.5 focus:ring-2 focus:ring-purple-400 outline-none"
            />
          </div>
          <div>
            <label htmlFor="calcRunsPerHour" className="block text-sm font-medium text-gray-400 mb-1">
              Runs Per Hour
            </label>
            <input
              id="calcRunsPerHour"
              type="number"
              name="runsPerHour"
              value={calc.runsPerHour}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              placeholder="e.g. 20"
              className="w-full bg-gray-700 text-white rounded-md p-2.5 focus:ring-2 focus:ring-purple-400 outline-none"
            />
          </div>
          <div>
            <label htmlFor="calcNumberOfRuns" className="block text-sm font-medium text-gray-400 mb-1">
              Number of Runs
            </label>
            <input
              id="calcNumberOfRuns"
              type="number"
              name="numberOfRuns"
              value={calc.numberOfRuns}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              placeholder="e.g. 100"
              className="w-full bg-gray-700 text-white rounded-md p-2.5 focus:ring-2 focus:ring-purple-400 outline-none"
            />
          </div>
          <div className="mt-5 text-sm text-gray-400 bg-gray-700/50 p-3 rounded-md border border-gray-600">
            <p>
              <span className="font-semibold">Note:</span> Market Tax is fixed at {calc.marketTax}% (1 FE per 8 FE
              sold).
            </p>
          </div>
        </div>
      </div>
      <div className="bg-gray-800 p-5 sm:p-6 rounded-xl shadow-xl">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-purple-300">Projected Results</h2>
        <div className="space-y-3 sm:space-y-4">
          {/* Results display remains the same */}
          <div className="flex justify-between items-baseline">
            <p className="text-sm sm:text-base text-gray-400">Total Cost:</p>
            <p className="text-lg sm:text-xl font-bold text-red-400">{results.totalCost.toFixed(2)} FE</p>
          </div>
          <div className="flex justify-between items-baseline">
            <p className="text-sm sm:text-base text-gray-400">Expected Drops:</p>
            <p className="text-lg sm:text-xl font-bold text-gray-100">{results.expectedDrops.toFixed(2)}</p>
          </div>
          <div className="flex justify-between items-baseline">
            <p className="text-sm sm:text-base text-gray-400">Gross Profit (Before Tax):</p>
            <p className="text-lg sm:text-xl font-bold text-green-400">{results.grossProfit.toFixed(2)} FE</p>
          </div>
          <div className="flex justify-between items-baseline">
            <p className="text-sm sm:text-base text-gray-400">Market Tax ({calc.marketTax}%):</p>
            <p className="text-lg sm:text-xl font-bold text-yellow-400">{results.taxAmount.toFixed(2)} FE</p>
          </div>
          <hr className="border-gray-700 my-2" />
          <div className="flex justify-between items-baseline">
            <p className="text-sm sm:text-base text-gray-400 font-semibold">Net Profit (After Tax):</p>
            <p
              className={`text-xl sm:text-2xl font-bold ${results.netProfit >= 0 ? "text-green-400" : "text-red-400"}`}
            >
              {results.netProfit.toFixed(2)} FE
            </p>
          </div>
          <hr className="border-gray-700 my-2" />
          <div className="flex justify-between items-baseline">
            <p className="text-sm sm:text-base text-gray-400">Time Needed:</p>
            <p className="text-lg sm:text-xl font-bold text-gray-100">{results.timeNeeded.toFixed(2)} hrs</p>
          </div>
          <div className="flex justify-between items-baseline">
            <p className="text-sm sm:text-base text-gray-400">Est. Profit/Hour:</p>
            <p
              className={`text-lg sm:text-xl font-bold ${
                results.profitPerHour >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {results.profitPerHour.toFixed(2)} FE/hr
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Profit Chart Component ---
function ProfitChart({ data }) {
  const chartRef = useRef(null); // Ref for the SVG container
  const [svgWidth, setSvgWidth] = useState(0); // Width of the SVG container

  // Observe the width of the chart container
  useEffect(() => {
    const chartElement = chartRef.current;
    if (!chartElement) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        setSvgWidth(entries[0].contentRect.width);
      }
    });
    resizeObserver.observe(chartElement);
    return () => resizeObserver.unobserve(chartElement);
  }, []);

  if (!data || data.length <= 1) {
    return (
      <div ref={chartRef} className="flex items-center justify-center h-full text-gray-500">
        Track some runs to see your profit graph!
      </div>
    );
  }

  const svgHeight = 250;
  const paddingX = 40;
  const paddingY = 25; // Increased Y padding for labels

  const profits = data.map((d) => d.profit);
  let maxProfit = Math.max(0, ...profits);
  let minProfit = Math.min(0, ...profits);

  if (maxProfit === 0 && minProfit === 0 && data.length > 1) {
    maxProfit = 1;
    minProfit = -1;
  } else if (maxProfit === minProfit) {
    const absVal = Math.abs(maxProfit === 0 ? 1 : maxProfit * 0.1) || 1;
    maxProfit = maxProfit + absVal;
    minProfit = minProfit - absVal;
  }
  const profitRange = maxProfit - minProfit;

  const getX = (index) => {
    if (data.length <= 1 || svgWidth === 0) return paddingX;
    return paddingX + (index / (data.length - 1)) * (svgWidth - 2 * paddingX);
  };

  const getY = (profit) => {
    if (profitRange === 0) return svgHeight / 2;
    return svgHeight - paddingY - ((profit - minProfit) / profitRange) * (svgHeight - 2 * paddingY);
  };

  const pathD = data
    .map((point, i) => {
      const x = getX(i);
      const y = getY(point.profit);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  const circles = data.map((point, i) => ({
    key: `point-${i}`,
    cx: getX(i),
    cy: getY(point.profit),
    fill: point.profit >= 0 ? "#68D391" : "#FC8181", // green-400 or red-400
  }));

  const yAxisLabels = () => {
    const labels = [];
    if (profitRange === 0 && data.length > 1) {
      // Handle case where all profits are the same (e.g. all 0)
      labels.push({ value: data[0].profit, y: svgHeight / 2 });
    } else {
      labels.push({ value: maxProfit, y: getY(maxProfit) });
      if (minProfit < 0 && maxProfit > 0 && getY(0) > paddingY && getY(0) < svgHeight - paddingY) {
        labels.push({ value: 0, y: getY(0) });
      }
      labels.push({ value: minProfit, y: getY(minProfit) });
    }

    const uniqueLabels = [];
    const yPositions = new Set();
    labels.forEach((label) => {
      const roundedY = Math.round(label.y);
      if (!yPositions.has(roundedY) && label.y >= paddingY && label.y <= svgHeight - paddingY) {
        // Ensure labels are within bounds
        uniqueLabels.push(label);
        yPositions.add(roundedY);
      }
    });
    return uniqueLabels;
  };

  return (
    <div ref={chartRef} className="w-full h-full">
      {svgWidth > 0 && ( // Only render SVG if width is known
        <svg width="100%" height={svgHeight} className="overflow-visible">
          {/* Y-axis Grid Lines */}
          {yAxisLabels().map((label, i) => (
            <line
              key={`grid-y-${i}`}
              x1={paddingX}
              y1={label.y.toFixed(2)}
              x2={svgWidth - paddingX}
              y2={label.y.toFixed(2)}
              stroke="#4A5568"
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
          ))}
          {/* X-axis (Zero Profit Line) */}
          {getY(0) > paddingY && getY(0) < svgHeight - paddingY && profitRange !== 0 && (
            <line
              x1={paddingX}
              y1={getY(0).toFixed(2)}
              x2={svgWidth - paddingX}
              y2={getY(0).toFixed(2)}
              stroke="#A0AEC0"
              strokeWidth="1"
            />
          )}
          {/* Profit Line */}
          <path
            d={pathD}
            fill="none"
            stroke={data.length > 0 && data[data.length - 1].profit >= 0 ? "#68D391" : "#FC8181"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Data Points */}
          {circles.map((circle) => (
            <circle
              key={circle.key}
              cx={circle.cx.toFixed(2)}
              cy={circle.cy.toFixed(2)}
              r="3"
              fill={circle.fill}
              stroke="#2D3748"
              strokeWidth="1"
            />
          ))}
          {/* Y-axis Labels (Text) */}
          {yAxisLabels().map((label, i) => (
            <text
              key={`label-y-${i}`}
              x={paddingX - 8}
              y={label.y.toFixed(2)}
              dy="0.32em"
              textAnchor="end"
              fontSize="10"
              fill="#A0AEC0"
            >
              {label.value.toFixed(0)}
            </text>
          ))}
          {/* X-axis Labels (Run Numbers) */}
          {data.length > 1 && (
            <>
              <text x={paddingX} y={svgHeight - paddingY + 15} textAnchor="start" fontSize="10" fill="#A0AEC0">
                0
              </text>
              <text x={svgWidth - paddingX} y={svgHeight - paddingY + 15} textAnchor="end" fontSize="10" fill="#A0AEC0">
                {data[data.length - 1].run}
              </text>
            </>
          )}
        </svg>
      )}
    </div>
  );
}

// --- StratEfficiencyCalculator ---
function StratEfficiencyCalculator() {
  const initialStratState = {
    name: "",
    keyCost: "", // This is the upfront investment per run
    dropChance: "",
    dropValue: "",
    rph: "", // Runs Per Hour
  };

  const [strat1, setStrat1] = useState(() =>
    loadState("strat1Data", {
      ...initialStratState,
      name: "3 Key Keegan",
      keyCost: 13.5,
      dropChance: 50,
      dropValue: 48,
      rph: 81,
    })
  );
  const [strat2, setStrat2] = useState(() =>
    loadState("strat2Data", {
      ...initialStratState,
      name: "4 Key Keegan Uber",
      keyCost: 31.5,
      dropChance: 100,
      dropValue: 48,
      rph: 40,
    })
  );

  const marketTax = 12.5; // Fixed market tax

  useEffect(() => {
    saveState("strat1Data", strat1);
  }, [strat1]);
  useEffect(() => {
    saveState("strat2Data", strat2);
  }, [strat2]);

  const handleInputChange = (e, stratSetter) => {
    const { name, value } = e.target;
    const parsedValue = name === "name" || value === "" ? value : parseFloat(value);
    stratSetter((prev) => ({
      ...prev,
      [name]: parsedValue === "" || name === "name" ? parsedValue : isNaN(parsedValue) ? 0 : parsedValue,
    }));
  };

  const handleInputBlur = (e, stratSetter) => {
    const { name, value } = e.target;
    if (value === "" && name !== "name") {
      stratSetter((prev) => ({ ...prev, [name]: 0 }));
    }
  };

  const calculateStratMetrics = (strat) => {
    if (strat.keyCost === "" || strat.dropChance === "" || strat.dropValue === "" || strat.rph === "") {
      return {
        investmentPerRun: 0,
        totalHourlyInvestment: 0,
        grossRevenuePerRun: 0,
        netRevenuePerRun: 0,
        netProfitPerRun: 0,
        profitPerHour: 0,
        isValid: false,
      };
    }
    const keyCost = parseFloat(strat.keyCost) || 0;
    const dropChance = parseFloat(strat.dropChance) || 0;
    const dropValue = parseFloat(strat.dropValue) || 0;
    const rph = parseFloat(strat.rph) || 0;

    const investmentPerRun = keyCost;
    const totalHourlyInvestment = rph > 0 ? investmentPerRun * rph : 0; // Calculate total hourly investment
    const grossRevenuePerRun = dropValue * (dropChance / 100);
    const netRevenuePerRun = grossRevenuePerRun * (1 - marketTax / 100);
    const netProfitPerRun = netRevenuePerRun - investmentPerRun;
    const profitPerHour = rph > 0 ? netProfitPerRun * rph : 0;

    return {
      investmentPerRun,
      totalHourlyInvestment,
      grossRevenuePerRun,
      netRevenuePerRun,
      netProfitPerRun,
      profitPerHour,
      isValid: true,
    };
  };

  const metrics1 = calculateStratMetrics(strat1);
  const metrics2 = calculateStratMetrics(strat2);

  let comparisonResult = "";
  let targetRphInfo = "";

  if (metrics1.isValid && metrics2.isValid && (metrics1.profitPerHour !== 0 || metrics2.profitPerHour !== 0)) {
    if (metrics1.profitPerHour !== metrics2.profitPerHour) {
      const difference = Math.abs(metrics1.profitPerHour - metrics2.profitPerHour);
      if (metrics1.profitPerHour > metrics2.profitPerHour) {
        comparisonResult = `${strat1.name || "3 Key Keegan"} is ${difference.toFixed(1)} FE/hr more profitable.`;
        if (metrics2.netProfitPerRun > 0) {
          const targetRPH2 = metrics1.profitPerHour / metrics2.netProfitPerRun;
          if (isFinite(targetRPH2) && targetRPH2 > 0) {
            targetRphInfo = `${strat2.name || "4 Key Keegan Uber"} would need approx. ${targetRPH2.toFixed(
              1
            )} RPH to match.`;
          }
        } else if (metrics1.profitPerHour > 0) {
          targetRphInfo = `${
            strat2.name || "4 Key Keegan Uber"
          } is currently not profitable per run, cannot match by increasing RPH.`;
        }
      } else {
        comparisonResult = `${strat2.name || "4 Key Keegan Uber"} is ${difference.toFixed(1)} FE/hr more profitable.`;
        if (metrics1.netProfitPerRun > 0) {
          const targetRPH1 = metrics2.profitPerHour / metrics1.netProfitPerRun;
          if (isFinite(targetRPH1) && targetRPH1 > 0) {
            targetRphInfo = `${strat1.name || "3 Key Keegan"} would need approx. ${targetRPH1.toFixed(
              1
            )} RPH to match.`;
          }
        } else if (metrics2.profitPerHour > 0) {
          targetRphInfo = `${
            strat1.name || "3 Key Keegan"
          } is currently not profitable per run, cannot match by increasing RPH.`;
        }
      }
    } else {
      comparisonResult = "Both strategies are currently equally profitable per hour.";
    }
  }

  const renderStratInputs = (strat, setStrat, idPrefix) => (
    <div className="bg-gray-800 p-5 sm:p-6 rounded-xl shadow-xl space-y-4">
      <input
        type="text"
        name="name"
        value={strat.name}
        onChange={(e) => handleInputChange(e, setStrat)}
        placeholder="Strategy Name"
        className="w-full bg-gray-700 text-white rounded-md p-2.5 mb-2 text-lg font-semibold focus:ring-2 focus:ring-purple-400 outline-none"
      />
      <div>
        <label htmlFor={`${idPrefix}KeyCost`} className="block text-sm font-medium text-gray-400 mb-1">
          Total Key Cost / Run (FE)
        </label>
        <input
          id={`${idPrefix}KeyCost`}
          type="number"
          name="keyCost"
          value={strat.keyCost}
          onChange={(e) => handleInputChange(e, setStrat)}
          onBlur={(e) => handleInputBlur(e, setStrat)}
          placeholder="e.g. 13.5"
          className="w-full bg-gray-700 text-white rounded-md p-2.5 focus:ring-2 focus:ring-purple-400 outline-none"
        />
      </div>
      <div>
        <label htmlFor={`${idPrefix}DropChance`} className="block text-sm font-medium text-gray-400 mb-1">
          Drop Chance (%)
        </label>
        <input
          id={`${idPrefix}DropChance`}
          type="number"
          name="dropChance"
          value={strat.dropChance}
          onChange={(e) => handleInputChange(e, setStrat)}
          onBlur={(e) => handleInputBlur(e, setStrat)}
          placeholder="e.g. 50"
          min="0"
          max="100"
          className="w-full bg-gray-700 text-white rounded-md p-2.5 focus:ring-2 focus:ring-purple-400 outline-none"
        />
      </div>
      <div>
        <label htmlFor={`${idPrefix}DropValue`} className="block text-sm font-medium text-gray-400 mb-1">
          Item Drop Value (FE)
        </label>
        <input
          id={`${idPrefix}DropValue`}
          type="number"
          name="dropValue"
          value={strat.dropValue}
          onChange={(e) => handleInputChange(e, setStrat)}
          onBlur={(e) => handleInputBlur(e, setStrat)}
          placeholder="e.g. 48"
          className="w-full bg-gray-700 text-white rounded-md p-2.5 focus:ring-2 focus:ring-purple-400 outline-none"
        />
      </div>
      <div>
        <label htmlFor={`${idPrefix}Rph`} className="block text-sm font-medium text-gray-400 mb-1">
          Runs Per Hour (RPH)
        </label>
        <input
          id={`${idPrefix}Rph`}
          type="number"
          name="rph"
          value={strat.rph}
          onChange={(e) => handleInputChange(e, setStrat)}
          onBlur={(e) => handleInputBlur(e, setStrat)}
          placeholder="e.g. 80"
          className="w-full bg-gray-700 text-white rounded-md p-2.5 focus:ring-2 focus:ring-purple-400 outline-none"
        />
      </div>
    </div>
  );

  const renderMetricsDisplay = (strat, metrics, stratNameDefault) => {
    if (
      !metrics.isValid &&
      (strat.keyCost === "" || strat.dropChance === "" || strat.dropValue === "" || strat.rph === "")
    ) {
      return (
        <div className="bg-gray-700/50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-purple-200 mb-2">{strat.name || stratNameDefault}</h4>
          <p className="text-sm text-gray-500">Enter all values to calculate metrics.</p>
        </div>
      );
    }
    return (
      <div className="bg-gray-700/50 p-4 rounded-lg space-y-1">
        <h4 className="text-lg font-semibold text-purple-200 mb-2">{strat.name || stratNameDefault}</h4>
        <p className="text-sm text-gray-400">
          Cost / Run: <span className="font-bold ml-1 text-red-400">{metrics.investmentPerRun.toFixed(2)} FE</span>
        </p>
        {/* Display Total Hourly Investment */}
        <p className="text-sm text-gray-400">
          Total Hourly Investment:{" "}
          <span className="font-bold ml-1 text-red-300">{metrics.totalHourlyInvestment.toFixed(2)} FE/hr</span>
        </p>
        <p className="text-sm text-gray-400">
          Gross Revenue / Run:{" "}
          <span className="font-bold ml-1 text-yellow-400">{metrics.grossRevenuePerRun.toFixed(2)} FE</span>
        </p>
        <p className="text-sm text-gray-400">
          Net Revenue / Run (After Tax):{" "}
          <span className="font-bold ml-1 text-green-300">{metrics.netRevenuePerRun.toFixed(2)} FE</span>
        </p>
        <hr className="border-gray-600 my-1" />
        <p className="text-sm text-gray-400">
          Net Profit / Run:{" "}
          <span className={`font-bold ml-1 ${metrics.netProfitPerRun >= 0 ? "text-green-400" : "text-red-400"}`}>
            {metrics.netProfitPerRun.toFixed(2)} FE
          </span>
        </p>
        <p className="text-sm text-gray-400">
          Est. Profit / Hour:{" "}
          <span className={`font-bold ml-1 ${metrics.profitPerHour >= 0 ? "text-green-400" : "text-red-400"}`}>
            {metrics.profitPerHour.toFixed(1)} FE/hr
          </span>
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <h2 className="text-2xl sm:text-3xl font-semibold text-purple-300 mb-6 flex items-center">
        <GitCompareArrows className="mr-3" size={28} /> Strategy Efficiency Comparator
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderStratInputs(strat1, setStrat1, "s1")}
        {renderStratInputs(strat2, setStrat2, "s2")}
      </div>
      {(metrics1.isValid || metrics2.isValid) && (
        <div className="bg-gray-800 p-5 sm:p-6 rounded-xl shadow-xl mt-6">
          <h3 className="text-xl sm:text-2xl font-semibold text-purple-300 mb-4">Comparison Results</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {renderMetricsDisplay(strat1, metrics1, "Strategy 1")}
            {renderMetricsDisplay(strat2, metrics2, "Strategy 2")}
          </div>
          {comparisonResult && (
            <div className="mt-4 p-4 bg-purple-600/20 border border-purple-500 rounded-lg text-center">
              <p className="text-md sm:text-lg font-semibold text-purple-200">{comparisonResult}</p>
              {targetRphInfo && <p className="text-sm text-purple-300 mt-1">{targetRphInfo}</p>}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-4 text-center">
            Market Tax of {marketTax}% is applied to drop values for Net Revenue and subsequent Profit calculations.
          </p>
        </div>
      )}
    </div>
  );
}
