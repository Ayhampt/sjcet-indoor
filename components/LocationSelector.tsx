'use client';

import React, { useState } from 'react';
import { Room } from '@/types/map.d';
import { QRScanner } from './ui/QRScanner';

interface LocationSelectorProps {
  startLocation: Room | null;
  endLocation: Room | null;
  onStartSelect: (room: Room) => void;
  onEndSelect: (room: Room) => void;
  availableRooms: Room[];
  currentFloor: number;
}

export function LocationSelector({
  startLocation,
  endLocation,
  onStartSelect,
  onEndSelect,
  availableRooms,
  currentFloor,
}: LocationSelectorProps) {
  const [activeSelector, setActiveSelector] = useState<'start' | 'end' | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [qrMode, setQRMode] = useState<'start' | 'end'>('end');
  const [showDropdown, setShowDropdown] = useState<'start' | 'end' | null>(null);

  const handleQRScan = (scannedData: string) => {
    // Parse QR code data - format: "room_id:ROOM_ID"
    const roomId = scannedData.replace('room_id:', '');
    const room = availableRooms.find((r) => r.id === roomId);
    
    if (room) {
      if (qrMode === 'start') {
        onStartSelect(room);
      } else {
        onEndSelect(room);
      }
      setShowQR(false);
    }
  };

  const currentFloorRooms = availableRooms.filter((r) => {
    const roomFloor = parseInt(r.id.split('_')[2]?.charAt(0) || '0');
    return roomFloor === currentFloor;
  });

  return (
    <div className="space-y-4 p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase">
          Route Planning
        </h3>
        <button
          onClick={() => {
            setQRMode('end');
            setShowQR(true);
          }}
          className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-400"
          title="Scan QR code"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>

      {/* QR Scanner Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-slate-900 dark:text-white">
                Scan {qrMode === 'start' ? 'Starting' : 'Ending'} Location
              </h4>
              <button
                onClick={() => setShowQR(false)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                ✕
              </button>
            </div>
            <QRScanner onScan={handleQRScan} onError={(err) => console.error(err)} />
          </div>
        </div>
      )}

      {/* Start Location */}
      <div>
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
          From
        </label>
        <div className="relative mt-2">
          <button
            onClick={() => setShowDropdown(showDropdown === 'start' ? null : 'start')}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-left text-sm font-medium text-slate-900 dark:text-white hover:border-blue-400 dark:hover:border-blue-500 transition-colors flex items-center justify-between"
          >
            <span className="truncate">
              {startLocation ? startLocation.name : 'Select starting location'}
            </span>
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>

          {showDropdown === 'start' && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
              {currentFloorRooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => {
                    onStartSelect(room);
                    setShowDropdown(null);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm border-b border-slate-100 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors ${
                    startLocation?.id === room.id ? 'bg-blue-100 dark:bg-blue-900' : ''
                  }`}
                >
                  <p className="font-medium text-slate-900 dark:text-white">{room.name}</p>
                  <p className="text-xs text-slate-500">{room.id}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Swap Button */}
      <button
        onClick={() => {
          const temp = startLocation;
          if (endLocation) onStartSelect(endLocation);
          if (temp) onEndSelect(temp);
        }}
        className="w-full p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-600 dark:text-slate-400"
        title="Swap start and end locations"
      >
        <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      </button>

      {/* End Location */}
      <div>
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
          To
        </label>
        <div className="relative mt-2">
          <button
            onClick={() => setShowDropdown(showDropdown === 'end' ? null : 'end')}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-left text-sm font-medium text-slate-900 dark:text-white hover:border-blue-400 dark:hover:border-blue-500 transition-colors flex items-center justify-between"
          >
            <span className="truncate">
              {endLocation ? endLocation.name : 'Select ending location'}
            </span>
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>

          {showDropdown === 'end' && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
              {currentFloorRooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => {
                    onEndSelect(room);
                    setShowDropdown(null);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm border-b border-slate-100 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors ${
                    endLocation?.id === room.id ? 'bg-blue-100 dark:bg-blue-900' : ''
                  }`}
                >
                  <p className="font-medium text-slate-900 dark:text-white">{room.name}</p>
                  <p className="text-xs text-slate-500">{room.id}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick QR Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-2">
        <button
          onClick={() => {
            setQRMode('start');
            setShowQR(true);
          }}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          QR From
        </button>
        <button
          onClick={() => {
            setQRMode('end');
            setShowQR(true);
          }}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-xs font-semibold hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          QR To
        </button>
      </div>
    </div>
  );
}
