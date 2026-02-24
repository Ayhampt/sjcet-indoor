'use client';

import React from 'react';

export function LoadingSkeleton() {
  return (
    <div className="w-full h-screen bg-white dark:bg-slate-950 flex flex-col">
      {/* Header skeleton */}
      <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center gap-4 px-6">
        <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="hidden md:block">
          <div className="w-32 h-6 rounded bg-slate-200 dark:bg-slate-800 animate-pulse mb-2" />
          <div className="w-48 h-3 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </div>
        <div className="flex-1" />
        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </div>

      {/* Main content skeleton */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar skeleton - hidden on mobile */}
        <div className="hidden md:flex w-80 border-r border-slate-200 dark:border-slate-800 flex-col p-4 gap-4">
          <div className="space-y-3">
            <div className="w-24 h-3 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="w-full h-10 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
          </div>
          <div className="space-y-3 flex-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        </div>

        {/* Map skeleton */}
        <div className="flex-1 bg-slate-100 dark:bg-slate-900">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin">
                <div className="w-8 h-8 border-4 border-slate-200 dark:border-slate-800 border-t-blue-600 rounded-full" />
              </div>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Loading NaviCampus...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
