'use client';

import { useState, useCallback, useMemo } from 'react';
import { FloorData, NavigationState, PathNode, Room } from '@/types/map.d';
import {
  buildNodeMap,
  buildRoomIndex,
  findClosestNode,
  generateInstructions,
  searchRooms,
  mergeFloorsIntoGraph,
} from './graph-builder';
import {
  buildGraph,
  dijkstra,
  reconstructPath,
  calculateDistance,
  estimateTime,
} from './dijkstra';

interface UseNavigationOptions {
  floorsData: FloorData[];
  startFloor?: number;
}

export function useNavigation(options: UseNavigationOptions) {
  const { floorsData, startFloor = 0 } = options;

  const [currentFloor, setCurrentFloor] = useState(startFloor);
  const [navigationState, setNavigationState] = useState<NavigationState | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Room | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [instructions, setInstructions] = useState<string[]>([]);

  // Build indices once
  const roomIndex = useMemo(() => buildRoomIndex(floorsData), [floorsData]);
  const nodeMap = useMemo(() => buildNodeMap(floorsData), [floorsData]);

  // Search for rooms
  const searchResults = useMemo(() => {
    return searchRooms(searchQuery, roomIndex);
  }, [searchQuery, roomIndex]);

  // Navigate to a destination
  const navigateTo = useCallback(
    (destinationRoom: Room) => {
      try {
        setSelectedDestination(destinationRoom);

        // Find the floor containing the destination
        const destinationFloor = floorsData.find(
          (floor) => floor.floorLevel === (destinationRoom as any).floorLevel
        );

        if (!destinationFloor) {
          console.error('Destination floor not found');
          return;
        }

        // Merge all floors into a unified graph
        const { allNodes, allEdges } = mergeFloorsIntoGraph(floorsData);
        const graph = buildGraph(allNodes, allEdges);

        // Find starting node (entry point)
        const startFloor = floorsData.find((f) => f.floorLevel === currentFloor);
        if (!startFloor) return;

        const startNode = startFloor.navigation.nodes[0]; // Default to first node
        const startNodeId = startNode.id;

        // Find the closest navigation node to the destination room
        const nodesOnDestFloor = allNodes.filter(
          (n) => floorsData.find((f) => f.navigation.nodes.includes(n as any))?.floorLevel === destinationFloor.floorLevel
        );

        const destinationNode = findClosestNode(
          destinationRoom,
          nodesOnDestFloor.map((n) => ({ ...n, floorLevel: destinationFloor.floorLevel }))
        );

        // Run Dijkstra's algorithm
        const result = dijkstra(graph, startNodeId, destinationNode.id);

        // Reconstruct path
        const path = reconstructPath(
          result.previous,
          startNodeId,
          destinationNode.id,
          nodeMap,
          currentFloor
        );

        // Calculate distance and time
        const distance = calculateDistance(path);
        const time = estimateTime(distance);

        // Generate turn-by-turn instructions
        const steps = generateInstructions(path, nodeMap);

        // Update state
        setNavigationState({
          startNodeId,
          destinationRoomId: destinationRoom.id,
          currentFloor,
          path,
          estimatedTime: time,
          distance,
        });

        setInstructions(steps);
      } catch (error) {
        console.error('Navigation error:', error);
        setNavigationState(null);
      }
    },
    [floorsData, currentFloor, nodeMap]
  );

  // Clear navigation
  const clearNavigation = useCallback(() => {
    setNavigationState(null);
    setSelectedDestination(null);
    setInstructions([]);
  }, []);

  // Get visible path segments for current floor
  const visiblePathSegments = useMemo(() => {
    if (!navigationState) return [];
    return navigationState.path.filter((node) => node.floor === currentFloor);
  }, [navigationState, currentFloor]);

  // Check if we need to go upstairs/downstairs
  const nextFloorChange = useMemo(() => {
    if (!navigationState) return null;

    const currentPathIndex = navigationState.path.findIndex((n) => n.floor === currentFloor);
    if (currentPathIndex === -1) return null;

    for (let i = currentPathIndex; i < navigationState.path.length; i++) {
      if (navigationState.path[i].floor !== currentFloor) {
        return {
          direction: navigationState.path[i].floor > currentFloor ? 'up' : 'down',
          floors: Math.abs(navigationState.path[i].floor - currentFloor),
        };
      }
    }

    return null;
  }, [navigationState, currentFloor]);

  return {
    // State
    currentFloor,
    navigationState,
    selectedDestination,
    searchQuery,
    searchResults,
    visiblePathSegments,
    nextFloorChange,
    instructions,

    // Actions
    setCurrentFloor,
    navigateTo,
    clearNavigation,
    setSearchQuery,
  };
}
