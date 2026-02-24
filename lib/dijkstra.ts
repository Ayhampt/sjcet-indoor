import { NavigationEdge, NavigationNode, PathNode } from '@/types/map.d';

interface Graph {
  [key: string]: Array<{ node: NavigationNode; weight: number }>;
}

interface DijkstraResult {
  distances: Map<string, number>;
  previous: Map<string, string | null>;
}

export function buildGraph(
  nodes: NavigationNode[],
  edges: NavigationEdge[]
): Graph {
  const graph: Graph = {};

  // Initialize all nodes
  nodes.forEach((node) => {
    graph[node.id] = [];
  });

  // Add edges
  edges.forEach((edge) => {
    const fromNode = nodes.find((n) => n.id === edge.from);
    if (fromNode) {
      const toNode = nodes.find((n) => n.id === edge.to);
      if (toNode) {
        graph[edge.from].push({ node: toNode, weight: edge.weight });
        // Add reverse edge for bidirectional navigation
        graph[edge.to].push({ node: fromNode, weight: edge.weight });
      }
    }
  });

  return graph;
}

export function dijkstra(
  graph: Graph,
  startNodeId: string,
  endNodeId: string
): DijkstraResult {
  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const unvisited = new Set<string>(Object.keys(graph));

  // Initialize distances
  Object.keys(graph).forEach((nodeId) => {
    distances.set(nodeId, nodeId === startNodeId ? 0 : Infinity);
    previous.set(nodeId, null);
  });

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
      break; // Unreachable node
    }

    unvisited.delete(currentNodeId);

    if (currentNodeId === endNodeId) {
      break; // Reached destination
    }

    // Check neighbors
    const neighbors = graph[currentNodeId] || [];
    neighbors.forEach(({ node: neighborNode, weight }) => {
      if (unvisited.has(neighborNode.id)) {
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

export function reconstructPath(
  previous: Map<string, string | null>,
  startNodeId: string,
  endNodeId: string,
  nodeMap: Map<string, NavigationNode>,
  currentFloor: number
): PathNode[] {
  const path: string[] = [];
  let current: string | null = endNodeId;

  while (current !== null) {
    path.unshift(current);
    current = previous.get(current) ?? null;
  }

  // Convert node IDs to PathNode objects with floor information
  return path.map((nodeId) => {
    const node = nodeMap.get(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }

    // Determine floor from node type and portal information
    let floor = currentFloor;
    if (node.type === 'portal' && node.targetFloor !== undefined) {
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

export function calculateDistance(pathNodes: PathNode[]): number {
  let totalDistance = 0;

  for (let i = 0; i < pathNodes.length - 1; i++) {
    const current = pathNodes[i];
    const next = pathNodes[i + 1];

    // Calculate 2D distance between points
    const dx = next.x - current.x;
    const dy = next.y - current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Convert SVG units to meters (assuming 1 SVG unit ≈ 0.1 meter)
    totalDistance += distance * 0.1;

    // Add vertical distance for floor changes (assume 3 meters per floor)
    if (next.floor !== current.floor) {
      totalDistance += Math.abs(next.floor - current.floor) * 3;
    }
  }

  return Math.round(totalDistance);
}

export function estimateTime(distance: number): number {
  // Assume average walking speed of 1.4 m/s, but add 10% for turns/obstacles
  const baseTime = distance / 1.4;
  const adjustedTime = baseTime * 1.1;
  return Math.ceil(adjustedTime / 60); // Convert to minutes
}
