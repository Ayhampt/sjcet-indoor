export interface Room {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type:
    | "lecture"
    | "lab"
    | "office"
    | "restroom"
    | "waiting"
    | "cafeteria"
    | "library"
    | "corridor";
  description?: string;
  openHours?: string;
  crowdLevel?: "low" | "medium" | "high";
}

export interface NavigationNode {
  id: string;
  x: number;
  y: number;
  type: "hallway" | "qr_point" | "portal" | "room" | "junction" | "stair_node";
  label?: string;
  targetFloor?: number;
  // Node metadata for constraint-based navigation
  nodeType?: "junction" | "accessible_directly" | "stairs_only";
  accessibleRooms?: string[]; // Room IDs directly accessible from this node
  requiresStairs?: boolean; // Whether access requires stairs
  description?: string;
}

export interface NavigationEdge {
  from: string;
  to: string;
  weight: number;
  type?: "hallway" | "stairs" | "elevator" | "direct"; // Edge type for constraint checking
  requiresStairs?: boolean; // Edge only accessible via stairs
}

export interface FloorData {
  buildingId: string;
  floorLevel: number;
  metadata: {
    name: string;
    viewBox: string;
  };
  rooms: Room[];
  navigation: {
    nodes: NavigationNode[];
    edges: NavigationEdge[];
  };
}

export interface PathNode {
  id: string;
  x: number;
  y: number;
  floor: number;
}

export interface NavigationState {
  startNodeId: string;
  destinationRoomId: string;
  currentFloor: number;
  path: PathNode[];
  estimatedTime: number; // in minutes
  distance: number; // in meters
}
