'use client';

import React from 'react';
import { Room } from '@/types/map.d';

interface DestinationCardProps {
  room: Room & { floorLevel?: number };
  onNavigate: () => void;
  estimatedTime?: number;
  distance?: number;
}

export function DestinationCard({
  room,
  onNavigate,
  estimatedTime,
  distance,
}: DestinationCardProps) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 max-w-lg w-full mx-4 pointer-events-none z-10">
      <div className="bg-white dark:bg-slate-900 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex items-center gap-4 shadow-xl pointer-events-auto animate-slide-up hover:shadow-2xl transition-shadow">
        {/* Room image placeholder */}
        <div className="h-20 w-24 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex-shrink-0 overflow-hidden flex items-center justify-center">
          <svg
            className="w-10 h-10 text-white opacity-90"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z" />
          </svg>
        </div>

        {/* Room info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">
            {room.name}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
            {room.id}
          </p>
          {estimatedTime && distance && (
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {estimatedTime}m
              </span>
              <span className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
                {distance}m
              </span>
            </div>
          )}
        </div>

        {/* Navigate button */}
        <button
          onClick={onNavigate}
          className="flex-shrink-0 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
