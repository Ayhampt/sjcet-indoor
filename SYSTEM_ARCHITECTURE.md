# System Architecture - Node-Based Navigation System

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER INTERFACE LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  │  MapCanvas       │  │  PathDisplay     │  │  NavigationTest  │
│  │                  │  │                  │  │                  │
│  │ • Floor render   │  │ • Route info     │  │ • Test suite     │
│  │ • Node visual    │  │ • Distance/time  │  │ • 6 test rooms   │
│  │ • Path line      │  │ • Instructions   │  │ • Validation     │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
│           │                     │                     │
└───────────┼─────────────────────┼─────────────────────┼──────────┘
            │                     │                     │
┌───────────┼─────────────────────┼─────────────────────┼──────────┐
│           ↓                     ↓                     ↓          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │          NAVIGATION HOOK LAYER                          │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  useNavigation() Hook                                   │   │
│  │  • State management (currentFloor, navigation)         │   │
│  │  • Room search functionality                           │   │
│  │  • Route calculation orchestration                     │   │
│  │  • Instruction generation                             │   │
│  └──────────────────────────┬──────────────────────────────┘   │
│                             │                                   │
└─────────────────────────────┼───────────────────────────────────┘
                              │
┌─────────────────────────────┼───────────────────────────────────┐
│                             ↓                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │       PATHFINDING ENGINE LAYER                          │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  lib/pathfinding.ts                                     │   │
│  │                                                         │   │
│  │  ┌─────────────────────────────────────────────┐      │   │
│  │  │ buildConstrainedGraph()                     │      │   │
│  │  │ • Takes nodes, edges, constraints          │      │   │
│  │  │ • Creates weighted graph structure         │      │   │
│  │  │ • Applies edge type modifiers              │      │   │
│  │  │ • Adds bidirectional connections          │      │   │
│  │  └─────────────────────────────────────────────┘      │   │
│  │                        ↓                               │   │
│  │  ┌─────────────────────────────────────────────┐      │   │
│  │  │ dijkstraWithConstraints()                   │      │   │
│  │  │ • Dijkstra's shortest path algorithm       │      │   │
│  │  │ • Constraint-aware edge filtering          │      │   │
│  │  │ • Handles stair-only access rules          │      │   │
│  │  │ • Returns distances & previous map         │      │   │
│  │  └─────────────────────────────────────────────┘      │   │
│  │                        ↓                               │   │
│  │  ┌─────────────────────────────────────────────┐      │   │
│  │  │ reconstructPath()                           │      │   │
│  │  │ • Builds path from algorithm output        │      │   │
│  │  │ • Converts to PathNode objects             │      │   │
│  │  │ • Adds floor information                   │      │   │
│  │  └─────────────────────────────────────────────┘      │   │
│  │                        ↓                               │   │
│  │  ┌─────────────────────────────────────────────┐      │   │
│  │  │ validatePathConstraints()                   │      │   │
│  │  │ • Verifies stair-only access               │      │   │
│  │  │ • Checks room accessibility rules          │      │   │
│  │  │ • Reports violations                       │      │   │
│  │  └─────────────────────────────────────────────┘      │   │
│  │                        ↓                               │   │
│  │  ┌─────────────────────────────────────────────┐      │   │
│  │  │ calculateDistance() & estimateTime()       │      │   │
│  │  │ • Euclidean distance calculation           │      │   │
│  │  │ • Floor vertical distance (3m/floor)      │      │   │
│  │  │ • Walking speed adjusted time              │      │   │
│  │  └─────────────────────────────────────────────┘      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┼───────────────────────────────────┐
│                             ↓                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            DATA LAYER                                   │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  Floor Data (floor-0.json)                              │   │
│  │  • 15 Navigation Nodes                                  │   │
│  │  • 26 Edges with type & constraints                     │   │
│  │  • 8 Rooms with metadata                                │   │
│  │  • Entry/Exit points                                    │   │
│  │  • Staircase locations                                  │   │
│  │                                                         │   │
│  │  Type Definitions (types/map.d.ts)                      │   │
│  │  • NavigationNode (with nodeType, accessibleRooms, etc) │   │
│  │  • NavigationEdge (with type, requiresStairs)          │   │
│  │  • Room, PathNode, NavigationState                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌──────────────────┐
│  User Clicks Room│
└────────┬─────────┘
         │
         ↓
┌──────────────────────────────────┐
│ useNavigation.navigateTo()       │
│ • Find destination floor         │
│ • Get starting node              │
│ • Find closest junction node     │
└────────┬─────────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│ buildConstrainedGraph()          │
│ • Merge all floors               │
│ • Create weighted graph          │
│ • Apply constraints              │
└────────┬─────────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│ dijkstraWithConstraints()        │
│ • Initialize distances           │
│ • Process nodes in priority order│
│ • Check constraint for each edge │
│ • Return distances & previous    │
└────────┬─────────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│ reconstructPath()                │
│ • Walk backwards from destination│
│ • Build path node sequence       │
│ • Add floor information          │
└────────┬─────────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│ validatePathConstraints()        │
│ • Verify stair-only rules        │
│ • Check room accessibility       │
│ • Log violations if any          │
└────────┬─────────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│ calculateDistance() &            │
│ estimateTime()                   │
│ • Sum euclidean distances        │
│ • Add floor vertical distances   │
│ • Calculate walking time         │
└────────┬─────────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│ generateInstructions()           │
│ • Analyze path segments          │
│ • Create turn-by-turn directions │
│ • Add distance markers           │
└────────┬─────────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│ Update navigationState            │
│ • Path: PathNode[]              │
│ • Distance: number               │
│ • EstimatedTime: number          │
│ • Instructions: string[]         │
└────────┬─────────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│ MapCanvas renders path           │
│ • Draw blue dashed polyline      │
│ • Show junction nodes            │
│ • Mark waypoints                 │
│ • Highlight start/end            │
└────────┬─────────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│ User sees route on map           │
│ & directions in sidebar          │
└──────────────────────────────────┘
```

## Constraint Validation Flow

```
                    ┌─────────────────┐
                    │  Path Computed  │
                    └────────┬────────┘
                             │
                    ┌────────↓────────┐
                    │  Extract Path   │
                    │  Node IDs       │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ↓                  ↓                  ↓
  ┌─────────────────┐┌──────────────────┐┌──────────────────┐
  │ Check Node      ││ Validate Stair   ││ Check Room       │
  │ Requirements   ││ Only Access      ││ Accessibility    │
  └────────┬────────┘└────────┬─────────┘└────────┬─────────┘
           │                  │                  │
           │ Room 108 case:   │ Edge has        │ Junction must
           │ requiresStairs   │ requiresStairs  │ have room in
           │ must be TRUE     │ must match node │ accessibleRooms
           │                  │                 │
           └──────────────────┼─────────────────┘
                              │
                    ┌─────────↓─────────┐
                    │ Validation        │
                    │ Result            │
                    ├──────────────────┤
                    │ valid: boolean   │
                    │ violations: []   │
                    └──────────────────┘
```

## Node Type Hierarchy

```
NavigationNode
├── Junction Nodes (primary)
│   ├── SP_G_N_HALL_N (North hallway junction)
│   ├── SP_G_N_HALL_C (Central hallway junction)
│   └── SP_G_N_HALL_S (South hallway junction)
│
├── Room Access Nodes (dedicated)
│   ├── SP_G_JUNCTION_103 → Room 103
│   ├── SP_G_JUNCTION_104 → Room 104
│   ├── SP_G_JUNCTION_105 → Room 105
│   ├── SP_G_JUNCTION_106 → Room 106
│   └── SP_G_JUNCTION_107 → Room 107
│
├── Stair Access Nodes (vertical circulation)
│   ├── SP_G_STAIR_NODE_A (Staircase A)
│   ├── SP_G_STAIR_NODE_B (Staircase B)
│   └── SP_G_STAIR_108 (Room 108 stairs) ← SPECIAL
│
├── Portal Nodes (multi-floor)
│   └── SP_G_STAIR_PORTAL (To Floor 1)
│
├── QR Points (reference)
│   └── SP_G_QR_ENTRY (Ground floor center)
│
└── Entry/Exit Points (external)
    ├── SP_G_ENTRY_W (West entry)
    ├── SP_G_ENTRY_E (East entry)
    ├── SP_G_ENTRY_N (North entry)
    └── SP_G_ENTRY_S (South entry)
```

## Edge Weight Calculation

```
Base Weight
    ↓
┌───┴───┐
│ Type? │
└───┬───┘
    │
    ├─→ "hallway": weight as-is
    │
    ├─→ "stairs": weight * 1.5 (if preferDirectAccess)
    │
    ├─→ "direct": weight as-is (~50)
    │
    └─→ "elevator": weight as-is (future)

Final Weight → Used in Dijkstra's algorithm
```

## Component Communication

```
┌─────────────────────────────────────────────────┐
│         app/page.tsx (Main Page)                │
└──────────────────┬────────────────────────────┬─┘
                   │                            │
        ┌──────────↓─────────┐    ┌─────────────↓──┐
        │ useNavigation Hook │    │  State Props   │
        ├───────────────────┤    │                │
        │ • navigateTo()    │    │ • currentFloor │
        │ • clearNavigation │    │ • searchQuery  │
        │ • setSearchQuery  │    │ • navigationState
        │ • visiblePath... │    │ • instructions │
        └──────────┬────────┘    └────────────────┘
                   │
        ┌──────────┼────────────────────┐
        │          │                    │
        ↓          ↓                    ↓
┌──────────────┐┌──────────────┐┌──────────────┐
│ MapCanvas    ││ Sidebar      ││ DestinationCard
│              ││              ││
│ • floorData  ││ • rooms      ││ • distance
│ • path       ││ • instructions││ • time
│ • selected   ││ • onRoomSel  ││ • onNavigate
│ • onRoomClick││ • navigation ││
└──────────────┘└──────────────┘└──────────────┘
        ↑                              
        │                              
        └──────────────────────────────
              Path visualization
```

## Algorithm Complexity Analysis

### Dijkstra's Algorithm
- **V** (vertices) = 15 nodes
- **E** (edges) = 26 edges
- **Time Complexity**: O((V + E) log V)
  - O((15 + 26) log 15)
  - O(41 × 3.9)
  - **O(≈160) operations**
  
### Constraint Validation
- **V** iterations
- **Path verification**: O(P) where P = path length (typically 2-5)
- **Total**: O(V + P) = O(15 + 5) = **O(20)**

### Overall Performance
- **Graph building**: O(V + E) = O(41)
- **Dijkstra**: O(160)
- **Path reconstruction**: O(P) = O(5)
- **Validation**: O(P) = O(5)
- **Total**: **O(≈210) operations**
- **Actual Time**: < 1ms on modern hardware

## Memory Layout

```
Floor Data Structure (≈50KB)
├── Rooms Array (8 rooms × 100 bytes = 800 bytes)
├── Navigation Nodes (15 nodes × 60 bytes = 900 bytes)
├── Edges (26 edges × 80 bytes = 2,080 bytes)
├── Metadata (1,000 bytes)
└── Staircases/Entries (1,000 bytes)

Graph Structure (≈10KB)
├── Adjacency list (15 nodes × 64 bytes = 960 bytes)
└── Edge references (26 × 40 bytes = 1,040 bytes)

Runtime State (≈5KB)
├── navigationState object (500 bytes)
├── pathNodes array (5-10 nodes × 50 bytes = 500 bytes)
├── instructions array (100-500 bytes)
└── Search results (variable)

Total Per Navigation: ≈20-30KB active memory
```

## State Management Flow

```
┌────────────────────────────────────┐
│ useNavigation Hook State           │
├────────────────────────────────────┤
│ const [currentFloor, setCurrentFloor] = useState(0)
│ const [navigationState, setNavigationState] = useState(null)
│ const [selectedDestination, setSelectedDestination] = useState(null)
│ const [searchQuery, setSearchQuery] = useState('')
│ const [instructions, setInstructions] = useState([])
└────────────────────────────────────┘
             ↓
┌────────────────────────────────────┐
│ Memoized Calculations              │
├────────────────────────────────────┤
│ useMemo: roomIndex                 │
│ useMemo: nodeMap                   │
│ useMemo: searchResults             │
│ useMemo: visiblePathSegments       │
│ useMemo: nextFloorChange           │
└────────────────────────────────────┘
             ↓
┌────────────────────────────────────┐
│ Passed to UI Components            │
├────────────────────────────────────┤
│ MapCanvas (pathSegments, selected)
│ Sidebar (search, instructions)     │
│ PathDisplay (navigationState)      │
│ FloorSwitcher (currentFloor)       │
└────────────────────────────────────┘
```

## Testing Matrix

```
Test Target        │ Test Type        │ Expected Result
─────────────────────────────────────────────────────────
Room 103           │ Direct Access    │ Path: 2-3 nodes, no stairs
Room 104           │ Direct Access    │ Path: 2-3 nodes, no stairs
Room 105           │ Direct Access    │ Path: 2-3 nodes, no stairs
Room 106           │ Direct Access    │ Path: 2-3 nodes, no stairs
Room 107           │ Direct Access    │ Path: 2-3 nodes, no stairs
Room 108           │ Stairs Only      │ Path: MUST include STAIR_108
─────────────────────────────────────────────────────────
Junction Nodes     │ Visibility       │ All 15 rendered on map
Edge Weights       │ Distance Calc    │ Accurate meters
Floor Changes      │ Multi-floor      │ Portal transitions work
Constraint Valid.  │ Rules Enforce.   │ Violations reported
```

## Extension Points

```
System can be extended at:

1. New Node Types
   └─ Add to NavigationNode.type enum
   └─ Create rendering logic in MapCanvas

2. New Edge Types
   └─ Add to NavigationEdge.type enum
   └─ Implement weight modifier in buildConstrainedGraph

3. New Constraints
   └─ Add to PathfindingConstraints interface
   └─ Implement check in dijkstraWithConstraints

4. New Floor Data
   └─ Create floor-3.json with 15 nodes, 26+ edges
   └─ Add to FLOORS_DATA array
   └─ System auto-supports

5. Visual Customization
   └─ Color scheme in MapCanvas
   └─ Node marker styles
   └─ Path animation effects
```

---

**Architecture Version**: 1.0.0
**Last Updated**: March 2026
**System Status**: Production Ready
