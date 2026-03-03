'use client';

import React, { useEffect, useState } from 'react';
import { MapCanvas } from '@/components/map/MapCanvas';
import { Sidebar } from '@/components/ui/Sidebar';
import { FloorSwitcher } from '@/components/ui/FloorSwitcher';
import { NavigationBottomSheet } from '@/components/NavigationBottomSheet';
import { DestinationCard } from '@/components/DestinationCard';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { useNavigation } from '@/lib/use-navigation';
import { FloorData } from '@/types/map.d';
import floorG from '@/data/floors/st-peters/floor-0.json';
import floor1 from '@/data/floors/st-peters/floor-1.json';
import floor2 from '@/data/floors/st-peters/floor-2.json';

const FLOORS_DATA: FloorData[] = [floorG, floor1, floor2];

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  const {
    currentFloor,
    navigationState,
    selectedDestination,
    searchQuery,
    searchResults,
    visiblePathSegments,
    nextFloorChange,
    instructions,
    setCurrentFloor,
    navigateTo,
    clearNavigation,
    setSearchQuery,
  } = useNavigation({ floorsData: FLOORS_DATA, startFloor: 0 });

  useEffect(() => {
    setIsClient(true);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isClient) {
    return <LoadingSkeleton />;
  }

  const currentFloorData = FLOORS_DATA.find((f) => f.floorLevel === currentFloor);

  return (
    <div className="w-full h-screen bg-slate-100 dark:bg-slate-900 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 backdrop-blur-md flex items-center justify-between px-4 md:px-6 z-30 flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="bg-blue-600 p-1.5 md:p-2 rounded-lg">
            <svg className="w-5 md:w-6 h-5 md:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm md:text-lg font-bold text-slate-900 dark:text-white">NaviCampus</h1>
            <p className="text-[10px] md:text-xs text-slate-500 hidden md:block">St. Peters Engineering College</p>
          </div>
        </div>

        {/* Center search bar - mobile safe, hidden on mobile */}
        <div className="flex-1 max-w-2xl mx-4 md:mx-8 hidden lg:block">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search rooms, labs, or facilities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
            />
          </div>
        </div>

        {/* Right actions - hide some on mobile */}
        <div className="flex items-center gap-2 md:gap-3">
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors hidden md:block">
            <svg className="w-6 h-6 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <div className="w-7 md:w-8 h-7 md:h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600" />
        </div>
      </header>

      {/* Main content - Grid layout for desktop, flex for mobile */}
      <div className="flex flex-1 w-full h-full overflow-hidden">
        {/* Sidebar - fixed width on desktop */}
        {!isMobile && (
          <Sidebar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchResults={searchResults}
            onRoomSelect={navigateTo}
            selectedRoom={selectedDestination}
            estimatedTime={navigationState?.estimatedTime}
            distance={navigationState?.distance}
            instructions={instructions}
            navigationActive={!!navigationState}
            onClearNavigation={clearNavigation}
            currentFloor={currentFloor}
            onFloorChange={setCurrentFloor}
            availableFloors={FLOORS_DATA.map((f) => f.floorLevel)}
            nextFloorChange={nextFloorChange}
          />
        )}

        {/* Map area - flex-1 to take remaining space */}
        <main className="flex-1 relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center">
          {currentFloorData && (
            <>
              <MapCanvas
                floorData={currentFloorData}
                pathSegments={visiblePathSegments}
                onRoomClick={(roomId) => {
                  const room = currentFloorData.rooms.find((r) => r.id === roomId);
                  if (room) {
                    navigateTo({ ...room, floorLevel: currentFloor });
                  }
                }}
                selectedRoomId={selectedDestination?.id}
                userLocation={{ x: 150, y: 100 }}
              />

              {/* Quick info card - location badge */}
              <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    GPS Strong
                  </span>
                </div>
                <span className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
                <span className="text-xs font-medium text-slate-900 dark:text-white">
                  {currentFloorData.metadata.name}
                </span>
              </div>

              {/* Right control bar - grouped and aligned */}
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3">
                {/* Zoom controls */}
                <div className="flex flex-col bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <button className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <div className="h-px bg-slate-200 dark:bg-slate-700" />
                  <button className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                </div>
                {/* Locate me button */}
                <button className="w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </>
          )}

          {/* Mobile bottom sheet for navigation details */}
          {isMobile && navigationState && (
            <NavigationBottomSheet
              isOpen={showBottomSheet}
              onClose={() => setShowBottomSheet(false)}
              estimatedTime={navigationState.estimatedTime}
              distance={navigationState.distance}
              instructions={instructions}
              destinationName={selectedDestination?.name}
              nextFloorChange={nextFloorChange}
            />
          )}

          {/* Mobile floating button to show navigation details */}
          {isMobile && navigationState && !showBottomSheet && (
            <button
              onClick={() => setShowBottomSheet(true)}
              className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center z-20 active:scale-95 transition-transform"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          )}

          {/* Destination preview card - desktop only */}
          {!isMobile && selectedDestination && navigationState && (
            <DestinationCard
              room={selectedDestination}
              onNavigate={() => {
                console.log('Already navigating to:', selectedDestination.name);
              }}
              estimatedTime={navigationState.estimatedTime}
              distance={navigationState.distance}
            />
          )}

          {/* Floor switcher - positioned inside map */}
          <FloorSwitcher
            currentFloor={currentFloor}
            availableFloors={FLOORS_DATA.map((f) => f.floorLevel)}
            onFloorChange={setCurrentFloor}
          />
        </main>
      </div>
    </div>
  );
}
