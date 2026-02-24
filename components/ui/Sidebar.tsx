'use client';

import React from 'react';
import { Room } from '@/types/map.d';

interface SidebarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchResults: (Room & { floorLevel: number })[];
  onRoomSelect: (room: Room & { floorLevel: number }) => void;
  selectedRoom?: Room;
  estimatedTime?: number;
  distance?: number;
  instructions?: string[];
  navigationActive?: boolean;
  onClearNavigation?: () => void;
  currentFloor?: number;
  onFloorChange?: (floor: number) => void;
  availableFloors?: number[];
  nextFloorChange?: {
    direction: 'up' | 'down';
    floors: number;
  } | null;
}

export function Sidebar({
  searchQuery,
  onSearchChange,
  searchResults,
  onRoomSelect,
  selectedRoom,
  estimatedTime,
  distance,
  instructions,
  navigationActive,
  onClearNavigation,
  currentFloor = 0,
  onFloorChange,
  availableFloors = [0, 1, 2],
  nextFloorChange,
}: SidebarProps) {
  return (
    <aside className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col h-full shadow-sm">
      {/* Search section */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 space-y-3">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
          Search Destination
        </label>
        <div className="relative group">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search rooms, labs, facilities..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
          />
        </div>
      </div>

      {/* Navigation status or search results */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {navigationActive && selectedRoom ? (
          // Live navigation status
          <div className="p-6 space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Live Navigation
                </span>
              </div>

              {/* Metrics grid - 2 columns */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-white/70 text-xs mb-2">Estimated Arrival</p>
                  <h3 className="text-2xl font-bold">
                    {estimatedTime} <span className="text-sm font-normal opacity-80">min</span>
                  </h3>
                </div>
                <div>
                  <p className="text-white/70 text-xs mb-2">Distance</p>
                  <h3 className="text-2xl font-bold">
                    {distance} <span className="text-sm font-normal opacity-80">m</span>
                  </h3>
                </div>
              </div>

              {/* Instructions */}
              {instructions && instructions.length > 0 && (
                <div className="space-y-3 mb-6 pb-6 border-b border-white/20">
                  {instructions.slice(0, 2).map((instruction, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <div className="h-1 w-1 rounded-full bg-white mt-1.5 flex-shrink-0" />
                      <p className="text-white/90">{instruction}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Floor change warning */}
              {nextFloorChange && (
                <div className="bg-white/20 rounded-lg p-3 text-xs mb-6">
                  <p className="font-semibold">
                    Proceed {nextFloorChange.direction} {nextFloorChange.floors}{' '}
                    floor{nextFloorChange.floors > 1 ? 's' : ''}
                  </p>
                </div>
              )}

              <button
                onClick={onClearNavigation}
                className="w-full bg-white text-blue-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors"
              >
                Clear Navigation
              </button>
            </div>

            {/* Destination room info */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 space-y-3 border border-slate-200 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-500 uppercase">Destination</p>
              <h4 className="font-bold text-slate-900 dark:text-white text-lg">{selectedRoom.name}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">{selectedRoom.id}</p>
              {selectedRoom.description && (
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {selectedRoom.description}
                </p>
              )}
            </div>
          </div>
        ) : searchQuery ? (
          // Search results
          <div className="p-4 space-y-2">
            {searchResults.length > 0 ? (
              <>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-3">
                  {searchResults.length} Result{searchResults.length !== 1 ? 's' : ''}
                </p>
                {searchResults.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => onRoomSelect(room)}
                    className="w-full text-left p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors space-y-1 group"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600">
                        {room.name}
                      </h4>
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                        Floor {room.floorLevel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{room.id}</p>
                    {room.type && (
                      <p className="text-xs text-slate-500 capitalize">
                        {room.type.replace('_', ' ')}
                      </p>
                    )}
                  </button>
                ))}
              </>
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-slate-500">No rooms found</p>
                <p className="text-xs text-slate-400 mt-1">Try a different search term</p>
              </div>
            )}
          </div>
        ) : (
          // Default: Quick access
          <div className="p-5 space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                Points of Interest
              </p>
              <div className="grid grid-cols-2 gap-2 space-y-0">
                {[
                  { icon: '🚻', label: 'Restrooms', type: 'restroom' },
                  { icon: '☕', label: 'Cafeteria', type: 'cafeteria' },
                  { icon: '📚', label: 'Library', type: 'library' },
                  { icon: '🔬', label: 'Labs', type: 'lab' },
                ].map((item) => (
                  <button
                    key={item.type}
                    className="p-3 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <div className="text-xs mt-1">{item.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floor selector at bottom */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-4 space-y-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Floor</p>
        <div className="flex gap-2">
          {availableFloors.map((floor) => (
            <button
              key={floor}
              onClick={() => onFloorChange?.(floor)}
              className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-all ${
                currentFloor === floor
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {floor === 0 ? 'G' : `${floor}`}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
