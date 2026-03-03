'use client';

import React from 'react';
import { NavigationState, PathNode } from '@/types/map.d';

interface PathDisplayProps {
  navigationState: NavigationState | null;
  instructions: string[];
  onClearPath?: () => void;
}

/**
 * Displays the navigation path with instructions and metrics
 */
export function PathDisplay({
  navigationState,
  instructions,
  onClearPath,
}: PathDisplayProps) {
  if (!navigationState) {
    return null;
  }

  const { distance, estimatedTime, path } = navigationState;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Route Info</h2>
        {onClearPath && (
          <button
            onClick={onClearPath}
            className="text-sm px-3 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition"
          >
            Clear
          </button>
        )}
      </div>

      {/* Distance and Time */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
            Distance
          </p>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
            {distance}
            {' '}
            <span className="text-sm font-normal">m</span>
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">
            Est. Time
          </p>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
            {estimatedTime}
            {' '}
            <span className="text-sm font-normal">min</span>
          </p>
        </div>
      </div>

      {/* Path Nodes */}
      <div className="mb-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Path Nodes</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {path.map((node, index) => (
            <div
              key={index}
              className="flex items-center gap-3 text-sm p-2 rounded bg-slate-50 dark:bg-slate-700/50"
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-900 dark:text-slate-100 font-medium truncate">
                  {node.id}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {'('}
                  {node.x}
                  ,
                  {' '}
                  {node.y}
                  {')'}
                  {' Floor '}
                  {node.floor}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Turn-by-turn Instructions */}
      {instructions.length > 0 && (
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Directions</h3>
          <div className="space-y-3">
            {instructions.map((instruction, index) => (
              <div
                key={index}
                className="flex gap-3 text-sm p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border-l-4 border-blue-500"
              >
                <div className="flex-shrink-0 font-bold text-blue-600 dark:text-blue-400 w-6">
                  {index + 1}
                </div>
                <p className="text-slate-700 dark:text-slate-300">{instruction}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No instructions message */}
      {instructions.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
          Follow the highlighted path on the map
        </p>
      )}
    </div>
  );
}

/**
 * Node Type Legend Component
 */
export function NodeLegend() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Node Types</h3>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-purple-500" />
          <span className="text-slate-700 dark:text-slate-300">Junction Nodes</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-orange-500" />
          <span className="text-slate-700 dark:text-slate-300">Stair Access</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500" />
          <span className="text-slate-700 dark:text-slate-300">Start Point</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500" />
          <span className="text-slate-700 dark:text-slate-300">Destination</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-slate-500" />
          <span className="text-slate-700 dark:text-slate-300">QR Point</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-pink-500" />
          <span className="text-slate-700 dark:text-slate-300">Portal (Stairs)</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Route Summary Card
 */
interface RouteSummaryProps {
  distance?: number;
  time?: number;
  nodeCount?: number;
  hasStairs?: boolean;
}

export function RouteSummary({
  distance = 0,
  time = 0,
  nodeCount = 0,
  hasStairs = false,
}: RouteSummaryProps) {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md p-4">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs font-semibold opacity-80 uppercase tracking-wide">Distance</p>
          <p className="text-xl font-bold mt-1">{distance}m</p>
        </div>
        <div>
          <p className="text-xs font-semibold opacity-80 uppercase tracking-wide">Time</p>
          <p className="text-xl font-bold mt-1">{time}min</p>
        </div>
        <div>
          <p className="text-xs font-semibold opacity-80 uppercase tracking-wide">Nodes</p>
          <p className="text-xl font-bold mt-1">{nodeCount}</p>
        </div>
      </div>
      {hasStairs && (
        <div className="mt-3 pt-3 border-t border-white/30 text-sm flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-orange-300" />
          This route includes stairs
        </div>
      )}
    </div>
  );
}
