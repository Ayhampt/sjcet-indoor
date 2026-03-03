# Node-Based Indoor Navigation System

## Overview

This is a comprehensive node-based navigation system for the indoor environment at St. Peters Engineering College. The system uses Dijkstra's algorithm with constraint-aware pathfinding to calculate optimal routes between any two points, with special handling for rooms accessible only via stairs.

## Architecture

### Core Components

#### 1. **Data Structures** (`types/map.d.ts`)
- `NavigationNode`: Represents junction points, stairs, QR points, and portals with metadata
- `NavigationEdge`: Connections between nodes with type and constraint information
- `Room`: Physical spaces that users navigate to
- `PathNode`: Waypoints along calculated routes

#### 2. **Pathfinding Engine** (`lib/pathfinding.ts`)
- **buildConstrainedGraph**: Creates weighted graph with constraint-aware weights
- **dijkstraWithConstraints**: Enhanced Dijkstra implementation supporting:
  - Stair-only access restrictions
  - Direct room accessibility preferences
  - Multi-floor navigation
  - Portal/vertical circulation handling
- **validatePathConstraints**: Verifies paths respect access requirements

#### 3. **Floor Data** (`data/floors/st-peters/floor-0.json`)
- 14 navigation nodes (junctions, stairs, portals, QR points)
- 26 edges with type classifications
- Room metadata with accessibility information

#### 4. **Visualization** (`components/map/MapCanvas.tsx`)
- SVG-based floor plan rendering
- Color-coded node types:
  - **Purple circles**: Junction nodes
  - **Orange circles**: Stair access points
  - **Green circles**: Start points
  - **Red circles**: Destination points
  - **Pink circles**: Portal nodes
- Animated polyline path visualization
- Path waypoint markers

#### 5. **Navigation Hook** (`lib/use-navigation.ts`)
- State management for navigation operations
- Search functionality across multiple floors
- Route calculation and instruction generation
- Floor-specific path filtering

## Navigation Node Types

### Junction Nodes
- **Type**: `junction` / `nodeType: 'junction'`
- **Example**: `SP_G_N_HALL_N`, `SP_G_N_HALL_C`, `SP_G_N_HALL_S`
- **Purpose**: Central decision points in hallways
- **Accessibility**: Multiple rooms accessible from each junction
- **Routing**: Primary nodes for Dijkstra pathfinding

### Accessible-Directly Nodes
- **Type**: `junction` / `nodeType: 'accessible_directly'`
- **Examples**: `SP_G_JUNCTION_103`, `SP_G_JUNCTION_104`, etc.
- **Purpose**: Dedicated access points for rooms 103-107
- **Routing**: Direct edges to their respective rooms
- **Rooms**: 103, 104, 105, 106, 107

### Stair-Only Access Nodes
- **Type**: `stair_node` / `nodeType: 'stairs_only'`
- **Examples**: `SP_G_STAIR_NODE_A`, `SP_G_STAIR_NODE_B`, `SP_G_STAIR_108`
- **Purpose**: Vertical circulation points
- **Constraint**: `requiresStairs: true`
- **Special Case**: Room 108 is ONLY accessible via stairs

### Portal Nodes
- **Type**: `portal`
- **Example**: `SP_G_STAIR_PORTAL`
- **Purpose**: Multi-floor connections
- **Metadata**: `targetFloor` property for floor transitions

### QR Points
- **Type**: `qr_point`
- **Example**: `SP_G_QR_ENTRY`
- **Purpose**: Scanning/reference points on the floor

## Room Access Patterns

### Direct Access Rooms (103-107)
```
Room → Junction Node → Hallway Junction → Destination
```
- Room 103: Via `SP_G_JUNCTION_103`
- Room 104: Via `SP_G_JUNCTION_104`
- Room 105: Via `SP_G_JUNCTION_105`
- Room 106: Via `SP_G_JUNCTION_106`
- Room 107: Via `SP_G_JUNCTION_107`

### Stairs-Only Access (Room 108)
```
Current Location → Hallway → Stair Node A/B → Room 108 Stair Access → Room 108
```
- Must use either `SP_G_STAIR_NODE_A` or `SP_G_STAIR_NODE_B`
- Routes through `SP_G_STAIR_108` with `requiresStairs: true` constraint
- Algorithm enforces stair-only access requirement

## Pathfinding Algorithm

### Dijkstra with Constraints

1. **Graph Construction**
   ```typescript
   buildConstrainedGraph(nodes, edges, constraints)
   ```
   - Weight adjustment based on edge type
   - Stair weights multiplied by 1.5 if direct access preferred
   - Bidirectional edges for hallway navigation

2. **Constraint Validation**
   ```typescript
   dijkstraWithConstraints(graph, start, end, nodeMap, constraints)
   ```
   - Filters edges based on requirements
   - Respects `requiresStairs` flags
   - Validates accessible rooms at junctions

3. **Path Reconstruction**
   ```typescript
   reconstructPath(previous, start, end, nodeMap, currentFloor)
   ```
   - Builds node sequence from Dijkstra result
   - Converts to PathNode objects with floor information
   - Handles floor transitions via portals

4. **Distance & Time Calculation**
   - SVG units → meters (1 unit = 0.1m)
   - Floor changes: 3 meters per floor
   - Walking speed: 1.4 m/s + 10% adjustment
   - Time: ceil(distance / 1.4 * 1.1 / 60) minutes

## Testing Nodes and Routes

### Critical Test Cases

#### Test 1: Room 103 (Waiting Room - Direct Access)
```
Start: SP_G_N_HALL_N → SP_G_JUNCTION_103 → SP_G_103
Expected: 2-3 nodes, no stairs
Constraint: Direct access only
```

#### Test 2: Room 104 (Toilet - Direct Access)
```
Start: SP_G_N_HALL_N → SP_G_JUNCTION_104 → SP_G_104
Expected: 2-3 nodes, no stairs
Constraint: Direct access only
```

#### Test 3: Room 105 (Lecture Hall - Direct Access)
```
Start: SP_G_N_HALL_N → SP_G_JUNCTION_105 → SP_G_105
Expected: 2-3 nodes, no stairs
Constraint: Direct access only
```

#### Test 4: Room 106 (Lecture Hall - Direct Access)
```
Start: SP_G_N_HALL_S → SP_G_JUNCTION_106 → SP_G_106
Expected: 2-3 nodes, no stairs
Constraint: Direct access only
```

#### Test 5: Room 107 (Toilet - Direct Access)
```
Start: SP_G_N_HALL_S → SP_G_JUNCTION_107 → SP_G_107
Expected: 2-3 nodes, no stairs
Constraint: Direct access only
```

#### Test 6: Room 108 (Waiting Room - STAIRS ONLY)
```
Start: SP_G_N_HALL_C → SP_G_STAIR_NODE_A/B → SP_G_STAIR_108 → SP_G_108
Expected: 4-5 nodes, MUST include stairs
Constraint: Stairs required, direct route blocked
```

## File Structure

```
project/
├── types/
│   └── map.d.ts                    # Type definitions with metadata
├── lib/
│   ├── pathfinding.ts              # Constraint-aware pathfinding
│   ├── dijkstra.ts                 # Backward-compatible wrapper
│   ├── graph-builder.ts            # Graph utilities
│   └── use-navigation.ts           # React hook for navigation
├── data/floors/st-peters/
│   ├── floor-0.json                # Enhanced with junction nodes
│   ├── floor-1.json                # First floor
│   └── floor-2.json                # Second floor
├── components/
│   ├── map/
│   │   └── MapCanvas.tsx           # Enhanced visualization
│   └── navigation/
│       ├── PathDisplay.tsx         # Route information
│       └── NavigationTest.tsx      # Test component
└── NAVIGATION_SYSTEM.md            # This file
```

## Edge Types and Weights

| Type | Weight | Purpose | Bidirectional |
|------|--------|---------|---------------|
| hallway | varies | Normal corridor movement | Yes |
| stairs | varies + 1.5x | Vertical circulation | Yes |
| direct | ~50 | Room entry | Yes |
| elevator | varies | Future vertical transport | Yes |

## Usage Example

```typescript
import { useNavigation } from '@/lib/use-navigation';
import { FloorData } from '@/types/map.d';

function MyComponent({ floorsData }: { floorsData: FloorData[] }) {
  const {
    navigationState,
    navigateTo,
    visiblePathSegments,
    instructions,
  } = useNavigation({ floorsData, startFloor: 0 });

  // Navigate to room 108 (requires stairs)
  const room108 = floorsData[0].rooms.find(r => r.id === 'SP_G_108');
  if (room108) {
    navigateTo(room108);
  }

  // Access path
  console.log(navigationState?.path);        // All nodes
  console.log(visiblePathSegments);          // Current floor only
  console.log(navigationState?.distance);    // In meters
  console.log(navigationState?.estimatedTime); // In minutes
  console.log(instructions);                 // Turn-by-turn
}
```

## Key Features

✓ **Constraint-Based Navigation**: Enforces stair-only access for Room 108
✓ **Junction Node System**: 14 strategically placed junction nodes
✓ **Direct Access Routing**: Rooms 103-107 accessible via dedicated junctions
✓ **Multi-Floor Support**: Seamless navigation across 3 floors
✓ **Path Visualization**: Color-coded nodes and animated polylines
✓ **Route Metrics**: Distance, time, and waypoint information
✓ **Turn-by-Turn Instructions**: Step-by-step navigation guidance
✓ **Floor-Specific Views**: Filters paths to current floor
✓ **Portal Support**: Vertical circulation via stairs/elevators

## Validation Rules

1. **Room 108 Requirement**: Path must include stair node if destination is Room 108
2. **Junction Accessibility**: Can only enter rooms from designated junctions
3. **Direct Access Preference**: System prefers direct hallway routes when available
4. **Bidirectional Edges**: All hallway edges are bidirectional
5. **Floor Transitions**: Only via portal nodes

## Future Enhancements

- Elevator support as alternative to stairs
- Real-time crowd density visualization
- Accessibility routes for mobility-impaired users
- Dynamic obstacle avoidance
- User preference routing (fastest vs. safest)
- Wayfinding sign position integration
