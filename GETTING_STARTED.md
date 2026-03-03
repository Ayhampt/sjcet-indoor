# Getting Started with NaviCampus Navigation System

## System Overview
NaviCampus is a sophisticated indoor navigation system for St. Peters Engineering College featuring:
- Interactive node-based pathfinding
- Real-time route calculation with Dijkstra's algorithm
- Constraint-based routing (stairs-only rooms, direct access rooms)
- Visual path representation with polylines
- Turn-by-turn navigation instructions

## How to Use

### 1. Select Navigation Points
Open the app and you'll see the Navigation Control Panel on the left sidebar:

**Starting Point**:
- By default, set to "Central Hallway Junction"
- Click the selector to change to any node or room
- Search by name or room number

**Destination**:
- Click the destination selector
- Search for your target room or node
- Select from the dropdown

### 2. Start Navigation
- Click **"Start Navigation"** button
- The system calculates the optimal route
- Path appears on the map with polylines
- Distance, time, and instructions display

### 3. Navigate
- Follow the polyline on the map
- Read step-by-step instructions in the sidebar
- Instructions update as you progress
- Watch for floor changes (stairs required)

### 4. Clear Route
- Click **"Clear"** button to reset
- Choose a new destination

## Key Features

### Node Selection
The NodeSelector dropdown provides:
- **Junction Nodes** (purple) - Hallway intersections
- **Direct Access** (teal) - Rooms with direct hallway access (103-107)
- **Stairs Only** (orange) - Rooms requiring stairs (101, 108, 110)
- **QR Points** (green) - Entry/information points
- **Portals** (pink) - Floor transitions

### Smart Routing
The system automatically:
- Routes to rooms 103-107 via direct hallway paths
- Routes to rooms 101, 108, 110 through staircases
- Calculates shortest distances
- Estimates walking time
- Shows turn-by-turn directions

### Mobile Responsive
- Sidebar collapses on small screens
- Touch-friendly controls
- Scrollable instruction lists

## Room Access

### Direct Access Rooms
**Rooms 103, 104, 105, 106, 107**
- Can be reached without using stairs
- Accessible from main hallway junctions
- Shortest routes available

### Stairs-Only Rooms
**Room 101** → Via Staircase A
**Room 108** → Via Staircase B  
**Room 110** → Via Staircase B

These routes must go through designated staircases.

## Technical Details

### Architecture
```
app/page.tsx (Main page)
├── NavigationControlPanel (Select start/destination)
│   └── NodeSelector (Dropdown for rooms/nodes)
├── MapCanvas (Visualize routes)
└── Sidebar (Show instructions)
```

### Data Flow
1. User selects destination in NavigationControlPanel
2. Room object enriched with floorLevel
3. Graph builder creates node map
4. Dijkstra algorithm finds shortest path
5. Path constraints validated
6. Polyline rendered on MapCanvas
7. Instructions generated and displayed

### Key Files
- **Components**:
  - `components/navigation/NavigationControlPanel.tsx` - Main UI
  - `components/navigation/NodeSelector.tsx` - Node/room dropdown
  - `components/map/MapCanvas.tsx` - Map visualization
  - `components/ui/Sidebar.tsx` - Instructions sidebar

- **Logic**:
  - `lib/use-navigation.ts` - Navigation hook
  - `lib/pathfinding.ts` - Dijkstra & constraint logic
  - `lib/graph-builder.ts` - Graph construction

- **Data**:
  - `data/floors/st-peters/floor-0.json` - Ground floor layout
  - `data/floors/st-peters/floor-1.json` - First floor
  - `data/floors/st-peters/floor-2.json` - Second floor

## Common Issues & Solutions

### "Destination floor not found" Error
**Cause**: Room missing floorLevel property
**Solution**: Ensure NavigationControlPanel attaches floorLevel before calling onNavigate
**Status**: ✅ Fixed in current version

### Path Not Showing
**Possible Causes**:
- Room doesn't exist on current floor
- Navigation hook error (check console)
- Graph not properly built

**Debug Steps**:
1. Open browser console (F12)
2. Check for error messages
3. Verify room ID exists in floor data
4. Restart navigation

### Wrong Route Calculated
**Cause**: Graph constraints not properly applied
**Debug**: Check navigation steps in sidebar instructions

## Customization Guide

### Adding New Rooms
Edit `data/floors/st-peters/floor-0.json`:
```json
{
  "id": "SP_G_NEW_ROOM",
  "name": "New Room",
  "roomNumber": 999,
  "type": "lab",
  "x": 500,
  "y": 400,
  "w": 100,
  "h": 100
}
```

### Adding Junction Node
Add to `navigation.nodes`:
```json
{
  "id": "SP_G_JUNCTION_NEW",
  "x": 500,
  "y": 350,
  "type": "junction",
  "nodeType": "accessible_directly",
  "label": "New Junction",
  "accessibleRooms": ["SP_G_NEW_ROOM"]
}
```

### Creating Stairs-Only Room
1. Add node as `stair_node` type
2. Set `nodeType: "stairs_only"`
3. Set `requiresStairs: true`
4. Connect only through stair nodes

### Modifying Edge Weights
Edit `navigation.edges` weights to affect route preference:
```json
{
  "from": "SP_G_N_HALL_N",
  "to": "SP_G_JUNCTION_103",
  "weight": 100,  // Lower = preferred
  "type": "hallway"
}
```

## API Reference

### useNavigation Hook
```typescript
const {
  currentFloor,           // Current floor number
  navigationState,        // Active route info
  selectedDestination,    // Selected room
  visiblePathSegments,    // Nodes on current floor
  instructions,          // Turn-by-turn steps
  navigateTo,           // Start navigation
  clearNavigation,      // Reset route
  setCurrentFloor       // Change floor
} = useNavigation({ floorsData, startFloor: 0 });
```

### NavigationControlPanel Props
```typescript
interface NavigationControlPanelProps {
  nodes: NavigationNode[];              // Available nodes
  rooms: Room[];                        // Available rooms
  floorsData: FloorData[];             // All floor data
  currentFloor: number;                // Current floor
  navigationState: NavigationState | null;
  selectedDestination: Room | null;
  onNavigate: (destination) => void;   // Navigation callback
  onClearNavigation: () => void;
  distance?: number;                   // Calculated distance
  estimatedTime?: number;              // Walking time estimate
  instructions: string[];              // Navigation steps
}
```

## Support & Troubleshooting

### Debug Mode
Add console logging to trace navigation:
```typescript
console.log("[v0] Navigation state:", navigationState);
console.log("[v0] Path segments:", visiblePathSegments);
console.log("[v0] Instructions:", instructions);
```

### Performance Tips
- Pre-compute room indices on app load
- Cache pathfinding results for common routes
- Use memoization for floor data access

### Browser Compatibility
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (iOS 14+)

## Next Steps
1. Try navigating between different rooms
2. Check path differences between stairs vs direct access
3. Test on different floors
4. Customize for your needs

For detailed technical information, see:
- `IMPLEMENTATION_STATUS.md` - Current implementation details
- `SYSTEM_ARCHITECTURE.md` - Full technical architecture
- `NAVIGATION_SYSTEM.md` - Complete system documentation
