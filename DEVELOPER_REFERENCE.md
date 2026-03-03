# Developer Quick Reference - Enhanced Navigation

## Component API Reference

### NavigationControlPanel

```typescript
<NavigationControlPanel
  nodes={currentFloorData.navigation.nodes}
  rooms={currentFloorData.rooms}
  floorsData={FLOORS_DATA}
  currentFloor={currentFloor}
  navigationState={navigationState}
  selectedDestination={selectedDestination}
  onNavigate={(destination) => navigateTo(destination)}
  onClearNavigation={() => clearNavigation()}
  distance={navigationState?.distance}
  estimatedTime={navigationState?.estimatedTime}
  instructions={instructions}
/>
```

**Props:**
- `nodes`: NavigationNode[] - Available navigation nodes on current floor
- `rooms`: Room[] - Available rooms on current floor
- `floorsData`: FloorData[] - All floor data
- `currentFloor`: number - Current floor level
- `navigationState`: NavigationState | null - Active navigation state
- `selectedDestination`: Room | null - Currently selected destination
- `onNavigate`: Callback fired when route initiated
- `onClearNavigation`: Callback fired when route cleared
- `distance`: Optional distance in meters
- `estimatedTime`: Optional time in minutes
- `instructions`: String array of navigation steps

---

### NodeSelector

```typescript
<NodeSelector
  nodes={nodes}
  rooms={rooms}
  onSelectNode={(node) => handleSelection(node)}
  selectedNodeId={currentNodeId}
  label="Select Starting Point"
  placeholder="Choose a node..."
  includeJunctionsOnly={false}
  showNodeType={true}
/>
```

**Props:**
- `nodes`: NavigationNode[] - Nodes to display
- `rooms`: Room[] - Rooms to display
- `onSelectNode`: (node: NavigationNode | Room) => void
- `selectedNodeId`: Optional currently selected ID
- `label`: Optional label text
- `placeholder`: Optional placeholder text
- `includeJunctionsOnly`: Filter to only junctions
- `showNodeType`: Show node type info

---

### QRScanner

```typescript
<QRScanner
  onScan={(data) => handleScan(data)}
  scanType="destination"
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
/>
```

**Props:**
- `onScan`: (data: ScanData) => void
- `scanType`: 'start' | 'destination'
- `isOpen`: boolean - Modal visibility
- `onClose`: () => void - Close handler

**Scan Data:**
```typescript
{
  nodeId: string;
  nodeName: string;
  type: 'start' | 'destination';
}
```

---

## Data Structure Reference

### NavigationNode (Enhanced)

```typescript
interface NavigationNode {
  id: string;
  x: number;
  y: number;
  type: 'hallway' | 'qr_point' | 'portal' | 'room' | 'junction' | 'stair_node';
  label?: string;
  targetFloor?: number;
  nodeType?: 'junction' | 'accessible_directly' | 'stairs_only';
  accessibleRooms?: string[];
  requiresStairs?: boolean;
  description?: string;
}
```

### NavigationEdge (Enhanced)

```typescript
interface NavigationEdge {
  from: string;
  to: string;
  weight: number;
  type?: 'hallway' | 'stairs' | 'elevator' | 'direct';
  requiresStairs?: boolean;
}
```

### NavigationPoint (Internal)

```typescript
interface NavigationPoint {
  nodeId?: string;
  roomId?: string;
  label: string;
  source: 'manual' | 'qr' | 'current_location';
  timestamp: number;
}
```

---

## Pathfinding Functions

### buildConstrainedGraph

```typescript
const graph = buildConstrainedGraph(
  allNodes,
  allEdges,
  {
    allowStairsOnly: false,
    preferDirectAccess: true,
    startFloor: 0,
    endFloor: 1,
  }
);
```

Builds weighted graph with constraint modifications.

**Weight Modifiers:**
- Stairs with `preferDirectAccess`: weight × 1.5
- Direct edges: weight × 0.9
- Stair-only edges: hard constraint (no modification)

### dijkstraWithConstraints

```typescript
const result = dijkstraWithConstraints(
  graph,
  startNodeId,
  destinationNodeId,
  nodeMap,
  {
    allowStairsOnly: false,
    preferDirectAccess: true,
  }
);
```

Enhanced Dijkstra returning:
```typescript
{
  distances: Map<string, number>;
  previous: Map<string, string | null>;
}
```

### validatePathConstraints

```typescript
const validation = validatePathConstraints(
  pathNodeIds,
  nodeMap,
  allEdges
);
```

Returns:
```typescript
{
  valid: boolean;
  violations: string[];
}
```

---

## QR Code Mapping

Add/modify in `components/navigation/QRScanner.tsx`:

```typescript
const QR_CODE_MAP: Record<string, { nodeId: string; nodeName: string }> = {
  'QR_SP_G_CENTER': { 
    nodeId: 'SP_G_QR_ENTRY', 
    nodeName: 'Ground Floor Center' 
  },
  // Add more mappings...
};
```

**Format:**
- Key: QR code string (case-insensitive)
- Value: Object with nodeId and display name

---

## Access Constraint Rules

### Direct Access Rooms
- **103**: North junction → Room entrance
- **104**: North junction → Room entrance
- **105**: North junction → Room entrance
- **106**: South junction → Room entrance
- **107**: South junction → Room entrance

### Stair-Required Rooms
- **101**: Staircase A junction → Room 101 junction → Room entrance
- **108**: Staircase B junction → Room 108 stair junction → Room entrance
- **110**: Staircase B junction → Room 110 stair junction → Room entrance

### Implementation in floor-0.json

```json
{
  "id": "SP_G_JUNCTION_101",
  "type": "stair_node",
  "nodeType": "stairs_only",
  "requiresStairs": true,
  "accessibleRooms": ["SP_G_101"]
}
```

Edge to staircase:
```json
{
  "from": "SP_G_STAIR_NODE_A",
  "to": "SP_G_JUNCTION_101",
  "weight": 100,
  "type": "stairs",
  "requiresStairs": true
}
```

---

## Integration Patterns

### Add Component to Page

```typescript
import { NavigationControlPanel } from '@/components/navigation/NavigationControlPanel';

// In JSX:
<NavigationControlPanel
  nodes={currentFloorData.navigation.nodes}
  rooms={currentFloorData.rooms}
  // ... other props
/>
```

### Handle Navigation Selection

```typescript
const handleNavigate = (destination: Room | NavigationNode) => {
  if ('roomNumber' in destination) {
    // It's a room
    navigateTo(destination as Room);
  } else {
    // It's a node - navigate to nearby rooms
    const nearbyRoom = findClosestRoom(destination);
    navigateTo(nearbyRoom);
  }
};
```

### Listen for QR Scans

```typescript
const handleQRScan = (data: {
  nodeId: string;
  nodeName: string;
  type: 'start' | 'destination';
}) => {
  if (data.type === 'start') {
    setStartPoint(data);
  } else {
    setDestinationPoint(data);
    // Auto-trigger navigation
    handleStartNavigation();
  }
};
```

---

## Common Tasks

### Add New Navigation Node

1. **Edit floor-0.json:**
```json
{
  "id": "SP_G_NEW_NODE",
  "x": 300,
  "y": 400,
  "type": "junction",
  "nodeType": "junction",
  "label": "New Junction",
  "accessibleRooms": ["SP_G_ROOM_ID"],
  "description": "Description here"
}
```

2. **Add edges:**
```json
{
  "from": "SP_G_N_HALL_N",
  "to": "SP_G_NEW_NODE",
  "weight": 120,
  "type": "hallway"
}
```

### Make Room Stairs-Only

1. **Update node:**
```json
{
  "id": "SP_G_JUNCTION_NEW_ROOM",
  "nodeType": "stairs_only",
  "requiresStairs": true,
  "accessibleRooms": ["SP_G_NEW_ROOM"]
}
```

2. **Add stair edge:**
```json
{
  "from": "SP_G_STAIR_NODE_A",
  "to": "SP_G_JUNCTION_NEW_ROOM",
  "weight": 100,
  "type": "stairs",
  "requiresStairs": true
}
```

### Add QR Code

1. **Update QRScanner.tsx:**
```typescript
const QR_CODE_MAP = {
  'QR_SP_G_NEW_LOCATION': {
    nodeId: 'SP_G_NEW_NODE',
    nodeName: 'New Location Name'
  }
};
```

2. **Print QR code** with string `QR_SP_G_NEW_LOCATION`

3. **Place at location**

---

## Performance Tips

1. **Memoize expensive calculations:**
```typescript
const filteredNodes = useMemo(() => {
  return nodes.filter(/* ... */);
}, [nodes, searchQuery]);
```

2. **Debounce search input:**
```typescript
const debouncedSearch = useCallback(
  debounce((query) => setSearchQuery(query), 300),
  []
);
```

3. **Lazy load QR scanner modal:**
```typescript
const QRScanner = lazy(() => 
  import('./QRScanner')
);
```

---

## Testing Checklist

- [ ] Room 103 navigates without stairs
- [ ] Room 104 navigates without stairs
- [ ] Room 105 navigates without stairs
- [ ] Room 106 navigates without stairs
- [ ] Room 107 navigates without stairs
- [ ] Room 101 always uses Staircase A
- [ ] Room 108 always uses Staircase B
- [ ] Room 110 always uses Staircase B
- [ ] QR codes scan and map correctly
- [ ] Manual QR entry works
- [ ] Swap button reverses route
- [ ] Distance calculation accurate
- [ ] Time estimate realistic
- [ ] Route displays on map
- [ ] Instructions generate correctly

---

## Debugging

### Enable Debug Logs

Add to use-navigation.ts:
```typescript
console.log("[v0] Path validation:", validation);
console.log("[v0] Route distance:", distance);
console.log("[v0] Instructions:", instructions);
```

### Check Graph Structure

```typescript
console.log("[v0] Graph nodes:", Object.keys(graph));
console.log("[v0] Node edges:", graph['SP_G_JUNCTION_101']);
```

### Verify Constraints

```typescript
const node = nodeMap.get('SP_G_JUNCTION_108');
console.log("[v0] Node type:", node?.nodeType);
console.log("[v0] Requires stairs:", node?.requiresStairs);
```

---

## Browser DevTools Tips

1. **Inspect NodeSelector:**
   - Check filtered arrays in console
   - Verify search query logic

2. **Monitor navigationState:**
   - Watch state changes in React DevTools
   - Check component rerenders

3. **Profile MapCanvas:**
   - Use Performance tab for rendering time
   - Check for unnecessary SVG updates

4. **Check Network:**
   - Verify floor data loads correctly
   - Monitor QR image upload size

---

## Related Documentation

- Full Guide: `ENHANCED_NAVIGATION_GUIDE.md`
- System Architecture: `SYSTEM_ARCHITECTURE.md`
- Type Definitions: `types/map.d.ts`
- Pathfinding: `lib/pathfinding.ts`
- Navigation Hook: `lib/use-navigation.ts`
