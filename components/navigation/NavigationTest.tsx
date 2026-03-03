'use client';

import React, { useState } from 'react';
import { FloorData, Room } from '@/types/map.d';
import { useNavigation } from '@/lib/use-navigation';

interface NavigationTestProps {
  floorsData: FloorData[];
}

/**
 * Test component to validate navigation routes
 */
export function NavigationTest({ floorsData }: NavigationTestProps) {
  const {
    navigationState,
    navigateTo,
    clearNavigation,
    visiblePathSegments,
  } = useNavigation({ floorsData, startFloor: 0 });

  const [testResults, setTestResults] = useState<
    Array<{ roomId: string; roomName: string; success: boolean; message: string }>
  >([]);

  const testRooms = [
    { id: 'SP_G_103', name: 'Room 103 - Waiting Room (Direct Access)' },
    { id: 'SP_G_104', name: 'Room 104 - Toilet (Direct Access)' },
    { id: 'SP_G_105', name: 'Room 105 - Lecture Hall (Direct Access)' },
    { id: 'SP_G_106', name: 'Room 106 - Lecture Hall (Direct Access)' },
    { id: 'SP_G_107', name: 'Room 107 - Toilet (Direct Access)' },
    { id: 'SP_G_108', name: 'Room 108 - Waiting Room (STAIRS ONLY)' },
  ];

  const runTests = () => {
    const results = testRooms.map((testRoom) => {
      try {
        const room = floorsData[0]?.rooms.find((r) => r.id === testRoom.id) as Room | undefined;

        if (!room) {
          return {
            roomId: testRoom.id,
            roomName: testRoom.name,
            success: false,
            message: 'Room not found in floor data',
          };
        }

        // Simulate navigation
        navigateTo(room);

        // Check if path was generated
        if (navigationState?.path && navigationState.path.length > 0) {
          const hasStairAccess = navigationState.path.some(
            (node) =>
              node.id.includes('STAIR') || node.id.includes('108')
          );

          // Validate room 108 requirement
          if (testRoom.id === 'SP_G_108' && !hasStairAccess) {
            return {
              roomId: testRoom.id,
              roomName: testRoom.name,
              success: false,
              message: '❌ Room 108 requires stair access but path does not include stairs',
            };
          }

          return {
            roomId: testRoom.id,
            roomName: testRoom.name,
            success: true,
            message: `✓ Route found: ${navigationState.path.length} nodes, ${navigationState.distance}m, ${navigationState.estimatedTime}min`,
          };
        }

        return {
          roomId: testRoom.id,
          roomName: testRoom.name,
          success: false,
          message: 'No path generated',
        };
      } catch (error) {
        return {
          roomId: testRoom.id,
          roomName: testRoom.name,
          success: false,
          message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    });

    setTestResults(results);
  };

  const passCount = testResults.filter((r) => r.success).length;
  const totalCount = testResults.length;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Navigation System Test
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Test navigation routes to all critical rooms including special constraints
        </p>
      </div>

      {/* Test Controls */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={runTests}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition"
        >
          Run Tests
        </button>
        <button
          onClick={() => {
            clearNavigation();
            setTestResults([]);
          }}
          className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 font-medium transition"
        >
          Clear Results
        </button>
      </div>

      {/* Test Results Summary */}
      {testResults.length > 0 && (
        <div className="mb-6 p-4 rounded-lg bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Tests</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalCount}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Passed</p>
              <p
                className={`text-2xl font-bold ${
                  passCount === totalCount
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-orange-600 dark:text-orange-400'
                }`}
              >
                {passCount}
                {' '}
                /
                {' '}
                {totalCount}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="space-y-3">
          {testResults.map((result) => (
            <div
              key={result.roomId}
              className={`p-4 rounded-lg border-l-4 ${
                result.success
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {result.roomName}
                  </p>
                  <p
                    className={`text-sm mt-1 ${
                      result.success
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-red-700 dark:text-red-300'
                    }`}
                  >
                    {result.message}
                  </p>
                </div>
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    result.success ? 'bg-green-500' : 'bg-red-500'
                  }`}
                >
                  {result.success ? '✓' : '✕'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Visible Path Segments */}
      {navigationState && visiblePathSegments.length > 0 && (
        <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Current Path Nodes (Floor 0)
          </h3>
          <div className="flex flex-wrap gap-2">
            {visiblePathSegments.map((node) => (
              <span
                key={node.id}
                className="px-2 py-1 bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 rounded text-xs font-medium"
              >
                {node.id}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
