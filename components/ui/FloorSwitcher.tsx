'use client';

import React from 'react';

interface FloorSwitcherProps {
  currentFloor: number;
  availableFloors: number[];
  onFloorChange: (floor: number) => void;
}

export function FloorSwitcher({
  currentFloor,
  availableFloors,
  onFloorChange,
}: FloorSwitcherProps) {
  // Sort floors in descending order for vertical layout
  const sortedFloors = [...availableFloors].sort((a, b) => b - a);

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 bg-white dark:bg-slate-900 backdrop-blur-md p-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-lg z-40">
      {/* Scroll up button */}
      <button
        onClick={() => {
          const index = sortedFloors.indexOf(currentFloor);
          if (index < sortedFloors.length - 1) {
            onFloorChange(sortedFloors[index + 1]);
          }
        }}
        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
        title="Go up"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7-7m0 0l-7 7m7-7v12"
          />
        </svg>
      </button>

      {/* Floor buttons */}
      <div className="flex flex-col gap-1">
        {sortedFloors.map((floor) => (
          <button
            key={floor}
            onClick={() => onFloorChange(floor)}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              currentFloor === floor
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50 ring-2 ring-blue-300 dark:ring-blue-700'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title={`Floor ${floor === 0 ? 'Ground' : floor}`}
          >
            {floor === 0 ? 'G' : floor === -1 ? 'B1' : floor}
          </button>
        ))}
      </div>

      {/* Scroll down button */}
      <button
        onClick={() => {
          const index = sortedFloors.indexOf(currentFloor);
          if (index > 0) {
            onFloorChange(sortedFloors[index - 1]);
          }
        }}
        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
        title="Go down"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7 7 7-7m0 6v4h-2v-4h-2v4h-2v-4h-2v4h-2v-4H5z"
          />
        </svg>
      </button>
    </div>
  );
}
