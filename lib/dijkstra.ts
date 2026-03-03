// This module is maintained for backward compatibility.
// For new features and constraint-based pathfinding, use lib/pathfinding.ts

export {
  buildConstrainedGraph as buildGraph,
  dijkstraWithConstraints as dijkstra,
  reconstructPath,
  calculateDistance,
  estimateTime,
} from './pathfinding';

// Legacy type exports for compatibility
export interface Graph {
  [key: string]: Array<{ node: any; weight: number }>;
}

export interface DijkstraResult {
  distances: Map<string, number>;
  previous: Map<string, string | null>;
}
