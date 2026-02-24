import { FloorData, NavigationNode, Room } from '@/types/map.d';

/**
 * Builds a searchable room index across all floors
 */
export function buildRoomIndex(floorsData: FloorData[]): Map<string, Room & { floorLevel: number }> {
  const roomIndex = new Map<string, Room & { floorLevel: number }>();

  floorsData.forEach((floor) => {
    floor.rooms.forEach((room) => {
      const enrichedRoom = { ...room, floorLevel: floor.floorLevel };
      roomIndex.set(room.id, enrichedRoom);
      // Also index by name (lowercase) for search functionality
      roomIndex.set(room.name.toLowerCase(), enrichedRoom);
    });
  });

  return roomIndex;
}

/**
 * Builds a node map for quick lookup during pathfinding
 */
export function buildNodeMap(floorsData: FloorData[]): Map<string, NavigationNode & { floorLevel: number }> {
  const nodeMap = new Map<string, NavigationNode & { floorLevel: number }>();

  floorsData.forEach((floor) => {
    floor.navigation.nodes.forEach((node) => {
      const enrichedNode = { ...node, floorLevel: floor.floorLevel };
      nodeMap.set(node.id, enrichedNode);
    });
  });

  return nodeMap;
}

/**
 * Finds the closest navigation node to a given room
 */
export function findClosestNode(
  room: Room,
  nodesOnFloor: (NavigationNode & { floorLevel: number })[],
  exclude?: string[]
): NavigationNode & { floorLevel: number } {
  let closestNode = nodesOnFloor[0];
  let minDistance = Infinity;

  nodesOnFloor.forEach((node) => {
    if (exclude?.includes(node.id)) return;

    const dx = node.x - (room.x + room.w / 2);
    const dy = node.y - (room.y + room.h / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < minDistance) {
      minDistance = distance;
      closestNode = node;
    }
  });

  return closestNode;
}

/**
 * Searches for rooms matching a query string
 */
export function searchRooms(
  query: string,
  roomIndex: Map<string, Room & { floorLevel: number }>
): (Room & { floorLevel: number })[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return [];

  const results: (Room & { floorLevel: number })[] = [];
  const seen = new Set<string>();

  // Search by exact ID first
  roomIndex.forEach((room, key) => {
    if (seen.has(room.id)) return;

    const matchById = room.id.toLowerCase().includes(normalizedQuery);
    const matchByName = room.name.toLowerCase().includes(normalizedQuery);
    const matchByType = room.type.toLowerCase().includes(normalizedQuery);

    if (matchById || matchByName || matchByType) {
      results.push(room);
      seen.add(room.id);
    }
  });

  return results;
}

/**
 * Merges floor data into a unified graph for multi-floor pathfinding
 */
export function mergeFloorsIntoGraph(floorsData: FloorData[]): {
  allNodes: NavigationNode[];
  allEdges: Array<{ from: string; to: string; weight: number }>;
} {
  const allNodes: NavigationNode[] = [];
  const allEdges: Array<{ from: string; to: string; weight: number }> = [];
  const portalMap = new Map<number, string>(); // floor -> stair/elevator node ID

  // Collect all nodes and edges
  floorsData.forEach((floor) => {
    floor.navigation.nodes.forEach((node) => {
      allNodes.push(node);

      // Track portals for multi-floor connectivity
      if (node.type === 'portal') {
        portalMap.set(floor.floorLevel, node.id);
      }
    });

    floor.navigation.edges.forEach((edge) => {
      allEdges.push(edge);
    });
  });

  // Connect portals between floors (stairs/elevators)
  const portals = Array.from(portalMap.entries()).sort((a, b) => a[0] - b[0]);
  for (let i = 0; i < portals.length - 1; i++) {
    const currentFloorPortal = portals[i][1];
    const nextFloorPortal = portals[i + 1][1];

    // Add edge between consecutive floor portals
    allEdges.push({
      from: currentFloorPortal,
      to: nextFloorPortal,
      weight: 50, // Stairs/elevators cost
    });
  }

  return { allNodes, allEdges };
}

/**
 * Gets all rooms on a specific floor
 */
export function getRoomsOnFloor(
  floor: FloorData,
  typeFilter?: string
): Room[] {
  if (!typeFilter) return floor.rooms;
  return floor.rooms.filter((room) => room.type === typeFilter);
}

/**
 * Gets turn-by-turn navigation instructions
 */
export function generateInstructions(
  pathNodes: Array<{ id: string; x: number; y: number; floor: number }>,
  nodeMap: Map<string, NavigationNode & { floorLevel: number }>
): string[] {
  const instructions: string[] = [];

  if (pathNodes.length < 2) return instructions;

  // Analyze path segments to generate turn instructions
  for (let i = 1; i < pathNodes.length; i++) {
    const prev = pathNodes[i - 1];
    const current = pathNodes[i];

    const node = nodeMap.get(current.id);
    if (!node) continue;

    // Handle floor changes
    if (current.floor !== prev.floor) {
      const direction = current.floor > prev.floor ? 'up' : 'down';
      const floors = Math.abs(current.floor - prev.floor);
      instructions.push(
        `Proceed ${direction} ${floors} floor${floors > 1 ? 's' : ''} via stairs or elevator`
      );
      continue;
    }

    // Analyze turn direction
    if (i > 1) {
      const prevPrev = pathNodes[i - 2];
      const dx1 = prev.x - prevPrev.x;
      const dy1 = prev.y - prevPrev.y;
      const dx2 = current.x - prev.x;
      const dy2 = current.y - prev.y;

      // Cross product to determine turn direction
      const cross = dx1 * dy2 - dy1 * dx2;
      const angle = Math.atan2(dy2, dx2) - Math.atan2(dy1, dx1);

      if (Math.abs(angle) > 0.2) {
        // 0.2 radians ≈ 11 degrees
        const direction = angle > 0 ? 'left' : 'right';
        const distance = Math.sqrt(dx2 * dx2 + dy2 * dy2) * 0.1; // Convert to meters
        instructions.push(`Turn ${direction}, then proceed ${Math.round(distance)}m`);
      }
    }
  }

  if (instructions.length === 0) {
    instructions.push('Follow the highlighted path to your destination');
  }

  return instructions;
}
