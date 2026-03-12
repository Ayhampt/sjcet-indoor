import { NavigationEdge, NavigationNode, PathNode } from "@/types/map.d";

interface Graph {
  [key: string]: Array<{
    node: NavigationNode;
    weight: number;
    edge?: NavigationEdge;
  }>;
}

interface DijkstraResult {
  distances: Map<string, number>;
  previous: Map<string, string | null>;
}

interface PathfindingConstraints {
  allowStairsOnly?: boolean; // Whether to allow stairs-only routes
  preferDirectAccess?: boolean; // Prefer direct access over stairs
  startFloor?: number;
  endFloor?: number;
}

/**
 * Builds a weighted graph from nodes and edges
 * Optionally applies constraint-based weight modifications
 */
export function buildConstrainedGraph(
  nodes: NavigationNode[],
  edges: NavigationEdge[],
  constraints?: PathfindingConstraints,
  destinationNodeId?: string,
  nodeMap?: Map<string, NavigationNode>,
): Graph {
  const graph: Graph = {};

  // Initialize all nodes
  nodes.forEach((node) => {
    graph[node.id] = [];
  });

  // Add edges with constraint-aware weight adjustments
  edges.forEach((edge) => {
    const fromNode = nodes.find((n) => n.id === edge.from);
    const toNode = nodes.find((n) => n.id === edge.to);

    if (fromNode && toNode) {
      let weight = edge.weight;

      // Apply weight modifiers based on edge type and constraints
      if (edge.type === "stairs" && constraints?.preferDirectAccess) {
        weight *= 1.5; // Penalize stairs if direct access is preferred
      }

      // Add forward edge
      graph[edge.from].push({ node: toNode, weight, edge });

      // Add reverse edge for bidirectional navigation
      graph[edge.to].push({ node: fromNode, weight, edge });
    }
  });

  return graph;
}

/**
 * Validates if a path respects access constraints
 */
export function validatePathConstraints(
  path: string[],
  nodeMap: Map<string, NavigationNode>,
  edges: NavigationEdge[],
): {
  valid: boolean;
  violations: string[];
} {
  const violations: string[] = [];

  // Check each node in the path
  for (let i = 0; i < path.length; i++) {
    const nodeId = path[i];
    const node = nodeMap.get(nodeId);

    if (!node) continue;

    // Validate stair-only access
    if (node.requiresStairs && node.nodeType === "stairs_only") {
      // Check if we're coming from a valid stair edge
      if (i > 0) {
        const prevNodeId = path[i - 1];
        const edge = edges.find(
          (e) =>
            (e.from === prevNodeId && e.to === nodeId) ||
            (e.from === nodeId && e.to === prevNodeId),
        );

        if (!edge?.requiresStairs && !edge?.type?.includes("stair")) {
          violations.push(
            `Node ${nodeId} (${node.label}) requires stair access but path doesn't use stairs`,
          );
        }
      }
    }

    // Validate room accessibility
    if (node.type === "room") {
      const parentJunction = findParentJunction(nodeId, nodeMap, edges);
      if (parentJunction && !isAccessible(nodeId, parentJunction, nodeMap)) {
        violations.push(
          `Room ${nodeId} is not accessible from junction ${parentJunction}`,
        );
      }
    }
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

/**
 * Finds the parent junction node for a given room
 */
function findParentJunction(
  roomId: string,
  nodeMap: Map<string, NavigationNode>,
  edges: NavigationEdge[],
): string | null {
  const directJunctions = edges
    .filter(
      (e) => (e.from === roomId || e.to === roomId) && e.type === "direct",
    )
    .map((e) => (e.from === roomId ? e.to : e.from));

  if (directJunctions.length > 0) {
    return directJunctions[0];
  }

  return null;
}

/**
 * Checks if a room is accessible from a given junction
 */
function isAccessible(
  roomId: string,
  junctionId: string,
  nodeMap: Map<string, NavigationNode>,
): boolean {
  const junction = nodeMap.get(junctionId);
  return !!junction?.accessibleRooms?.includes(roomId);
}

/**
 * Enhanced Dijkstra's algorithm with constraint support
 */
export function dijkstraWithConstraints(
  graph: Graph,
  startNodeId: string,
  endNodeId: string,
  nodeMap: Map<string, NavigationNode>,
  constraints?: PathfindingConstraints,
): DijkstraResult {
  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const unvisited = new Set<string>(Object.keys(graph));

  // Initialize distances
  Object.keys(graph).forEach((nodeId) => {
    distances.set(nodeId, nodeId === startNodeId ? 0 : Infinity);
    previous.set(nodeId, null);
  });

  // Check if end node requires stairs
  const endNode = nodeMap.get(endNodeId);
  const endNodeRequiresStairs =
    endNode?.requiresStairs || endNode?.nodeType === "stairs_only";

  while (unvisited.size > 0) {
    // Find unvisited node with minimum distance
    let currentNodeId: string | null = null;
    let minDistance = Infinity;

    unvisited.forEach((nodeId) => {
      const distance = distances.get(nodeId) ?? Infinity;
      if (distance < minDistance) {
        minDistance = distance;
        currentNodeId = nodeId;
      }
    });

    if (currentNodeId === null || minDistance === Infinity) {
      break;
    }

    unvisited.delete(currentNodeId);

    if (currentNodeId === endNodeId) {
      break;
    }

    // Check neighbors
    const neighbors = graph[currentNodeId] || [];
    neighbors.forEach(({ node: neighborNode, weight, edge }) => {
      if (unvisited.has(neighborNode.id)) {
        // Apply constraint-based filtering
        if (
          !isEdgeAllowedByConstraints(
            edge,
            neighborNode,
            constraints,
            nodeMap,
            endNodeRequiresStairs,
          )
        ) {
          return; // Skip this edge
        }

        const currentDistance = distances.get(currentNodeId!) ?? Infinity;
        const newDistance = currentDistance + weight;
        const neighborDistance = distances.get(neighborNode.id) ?? Infinity;

        if (newDistance < neighborDistance) {
          distances.set(neighborNode.id, newDistance);
          previous.set(neighborNode.id, currentNodeId);
        }
      }
    });
  }

  return { distances, previous };
}

/**
 * Determines if an edge can be used based on constraints
 */
function isEdgeAllowedByConstraints(
  edge: NavigationEdge | undefined,
  targetNode: NavigationNode,
  constraints?: PathfindingConstraints,
  nodeMap?: Map<string, NavigationNode>,
  endNodeRequiresStairs?: boolean,
): boolean {
  // If no constraints and destination doesn't require stairs, allow all edges
  if (!constraints && !endNodeRequiresStairs) return true;

  // When targeting stair-only rooms, block direct access edges
  if (endNodeRequiresStairs) {
    // Block direct edges to direct-access junctions when we need stairs
    if (
      edge?.type === "direct" ||
      (targetNode.nodeType === "accessible_directly" &&
        edge?.type === "hallway")
    ) {
      return false;
    }
    // Allow stair edges
    if (edge?.type === "stairs" || edge?.requiresStairs) {
      return true;
    }
  }

  return true;
}

/**
 * Reconstructs the path from Dijkstra result
 */
export function reconstructPath(
  previous: Map<string, string | null>,
  startNodeId: string,
  endNodeId: string,
  nodeMap: Map<string, NavigationNode>,
  currentFloor: number,
): PathNode[] {
  const path: string[] = [];
  let current: string | null = endNodeId;

  while (current !== null) {
    path.unshift(current);
    current = previous.get(current) ?? null;
  }

  // If start node is not in path, add it
  if (path[0] !== startNodeId) {
    path.unshift(startNodeId);
  }

  // Convert node IDs to PathNode objects
  return path.map((nodeId) => {
    const node = nodeMap.get(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }

    let floor = currentFloor;
    if (node.type === "portal" && node.targetFloor !== undefined) {
      floor = node.targetFloor;
    }

    return {
      id: nodeId,
      x: node.x,
      y: node.y,
      floor,
    };
  });
}

/**
 * Calculates distance along a path
 */
export function calculateDistance(pathNodes: PathNode[]): number {
  let totalDistance = 0;

  for (let i = 0; i < pathNodes.length - 1; i++) {
    const current = pathNodes[i];
    const next = pathNodes[i + 1];

    // Calculate 2D Euclidean distance
    const dx = next.x - current.x;
    const dy = next.y - current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Convert SVG units to meters (1 unit ≈ 0.1 meter)
    totalDistance += distance * 0.1;

    // Add vertical distance for floor changes (3 meters per floor)
    if (next.floor !== current.floor) {
      totalDistance += Math.abs(next.floor - current.floor) * 3;
    }
  }

  return Math.round(totalDistance);
}

/**
 * Estimates walking time in minutes
 */
export function estimateTime(distance: number): number {
  // Average walking speed: 1.4 m/s, plus 10% for turns/obstacles
  const baseTime = distance / 1.4;
  const adjustedTime = baseTime * 1.1;
  return Math.ceil(adjustedTime / 60);
}

/**
 * Finds all nodes accessible from a given starting point with constraints
 */
export function findAccessibleNodes(
  startNodeId: string,
  graph: Graph,
  nodeMap: Map<string, NavigationNode>,
  constraints?: PathfindingConstraints,
): string[] {
  const accessible = new Set<string>();
  const queue: string[] = [startNodeId];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (visited.has(currentId)) continue;
    visited.add(currentId);
    accessible.add(currentId);

    const neighbors = graph[currentId] || [];
    neighbors.forEach(({ node: neighbor, edge }) => {
      if (!visited.has(neighbor.id)) {
        if (isEdgeAllowedByConstraints(edge, neighbor, constraints, nodeMap)) {
          queue.push(neighbor.id);
        }
      }
    });
  }

  return Array.from(accessible);
}
