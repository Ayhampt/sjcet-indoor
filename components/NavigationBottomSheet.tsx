'use client';

import React, { useState } from 'react';

interface NavigationBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  estimatedTime?: number;
  distance?: number;
  instructions?: string[];
  destinationName?: string;
  nextFloorChange?: {
    direction: 'up' | 'down';
    floors: number;
  } | null;
}

export function NavigationBottomSheet({
  isOpen,
  onClose,
  estimatedTime,
  distance,
  instructions = [],
  destinationName,
  nextFloorChange,
}: NavigationBottomSheetProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);

  if (!isOpen) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragY(e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const delta = e.clientY - dragY;

    if (delta > 100) {
      onClose();
      setIsDragging(false);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isOpen ? 'opacity-40' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl transition-transform duration-300 z-50 max-h-96 overflow-y-auto ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-4">
          <div className="w-12 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Content */}
        <div className="px-6 pb-8 space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {destinationName}
            </h2>
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {estimatedTime} minutes
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                {distance} meters
              </span>
            </div>
          </div>

          {/* Floor change warning */}
          {nextFloorChange && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                You need to go {nextFloorChange.direction === 'up' ? 'up' : 'down'}{' '}
                {nextFloorChange.floors} floor{nextFloorChange.floors > 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* Instructions */}
          {instructions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Turn-by-turn directions
              </h3>
              <div className="space-y-2">
                {instructions.map((instruction, index) => (
                  <div
                    key={index}
                    className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {instruction}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action button */}
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Got it, let me navigate
          </button>
        </div>
      </div>
    </>
  );
}
